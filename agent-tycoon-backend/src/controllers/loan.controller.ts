import { Response } from 'express';
import { Loan } from '../models/Loan';
import { Player } from '../models/Player';
import { AppError } from '../middleware/errorHandler.middleware';
import { logger } from '../utils/logger';
import CONSTANTS from '../utils/constants';

/**
 * Apply for a loan
 * @route   POST /api/v1/loan/apply
 * @access  Private
 */
export const applyForLoan = async (req: any, res: Response) => {
  try {
    const { playerId } = req.player;
    const { loan_type, amount, duration_days } = req.body;

    // Validate input
    if (!loan_type || !amount || !duration_days) {
      throw new AppError('loan_type, amount, and duration_days are required', 400);
    }

    // Find player
    const player = await Player.findOne({ where: { id: playerId } });

    if (!player) {
      throw new AppError(CONSTANTS.ERROR_MESSAGES.PLAYER_NOT_FOUND, 404);
    }

    // Check credit rating
    const creditRating = player.creditRating;

    // Calculate loan parameters
    const loanParams = calculateLoanParameters(loan_type, amount, duration_days, creditRating);

    // Validate loan amount
    if (amount > loanParams.maxAmount) {
      throw new AppError(CONSTANTS.ERROR_MESSAGES.INSUFFICIENT_LOAN_AMOUNT, 400);
    }

    // Calculate daily interest and total repayment
    const dailyInterest = Math.ceil(amount * loanParams.dailyInterest);
    const totalRepayment = amount + (dailyInterest * duration_days);

    // Calculate due date
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + duration_days);

    // Create loan
    const loan = await Loan.create({
      playerId: player.id,
      loanType: loan_type,
      amount: amount,
      durationDays: duration_days,
      dailyInterest: dailyInterest,
      totalRepayment: totalRepayment,
      dueDate: dueDate,
      status: 'active'
    });

    // Add loan amount to player credits
    player.creditPoints += amount;
    await player.save();

    logger.info(`Loan applied: ${loan_type} ${amount} CP by ${player.agentName}`);

    res.json({
      success: true,
      loan_id: loan.loanId,
      amount: loan.amount,
      daily_interest: dailyInterest,
      total_repayment: totalRepayment,
      due_date: dueDate,
      credit_rating: creditRating
    });
  } catch (error) {
    logger.error('Apply for loan error:', error);
    throw error;
  }
};

/**
 * Repay a loan
 * @route   POST /api/v1/loan/repay
 * @access  Private
 */
export const repayLoan = async (req: any, res: Response) => {
  try {
    const { playerId } = req.player;
    const { loan_id, amount } = req.body;

    // Validate input
    if (!loan_id || !amount) {
      throw new AppError('loan_id and amount are required', 400);
    }

    // Find loan
    const loan = await Loan.findOne({ where: { loanId: loan_id, playerId: playerId, status: 'active' } });

    if (!loan) {
      throw new AppError(CONSTANTS.ERROR_MESSAGES.LOAN_NOT_FOUND, 404);
    }

    // Find player
    const player = await Player.findOne({ where: { id: playerId } });

    if (!player) {
      throw new AppError(CONSTANTS.ERROR_MESSAGES.PLAYER_NOT_FOUND, 404);
    }

    // Check if player has enough credits
    if (player.creditPoints < amount) {
      throw new AppError(CONSTANTS.ERROR_MESSAGES.INSUFFICIENT_CREDITS, 400);
    }

    // Check if repayment amount is sufficient
    const remainingRepayment = loan.totalRepayment - loan.repaidAmount;
    if (amount > remainingRepayment) {
      throw new AppError('Repayment amount exceeds remaining balance', 400);
    }

    // Deduct credits
    player.creditPoints -= amount;
    await player.save();

    // Update loan
    loan.repaidAmount += amount;
    if (loan.repaidAmount >= loan.totalRepayment) {
      loan.status = 'paid';
      // Improve credit rating
      if (player.creditRating !== 'S' && player.creditRating !== 'A') {
        const ratings = CONSTANTS.CREDIT_RATINGS;
        const currentIndex = ratings.indexOf(player.creditRating);
        if (currentIndex > 0) {
          player.creditRating = ratings[currentIndex - 1];
        }
      }
    }
    await loan.save();

    // Get remaining active loans
    const activeLoans = await Loan.find({ where: { playerId: playerId, status: 'active' } });

    logger.info(`Loan repaid: ${loan_id} ${amount} CP by ${player.agentName}`);

    res.json({
      success: true,
      loan_id: loan_id,
      repayment_amount: amount,
      remaining_repayment: loan.totalRepayment - loan.repaidAmount,
      remaining_loans: activeLoans.length,
      credit_rating: player.creditRating
    });
  } catch (error) {
    logger.error('Repay loan error:', error);
    throw error;
  }
};

/**
 * Get loan status
 * @route   GET /api/v1/loan/status
 * @access  Private
 */
export const getLoanStatus = async (req: any, res: Response) => {
  try {
    const { playerId } = req.player;

    // Get active loans
    const activeLoans = await Loan.find({ where: { playerId: playerId, status: 'active' } });

    // Find player
    const player = await Player.findOne({ where: { id: playerId } });

    if (!player) {
      throw new AppError(CONSTANTS.ERROR_MESSAGES.PLAYER_NOT_FOUND, 404);
    }

    // Calculate max loan amount based on credit rating
    const maxLoanAmount = calculateMaxLoanAmount(player.creditRating);

    logger.info(`Loan status retrieved for player ${playerId}`);

    res.json({
      success: true,
      active_loans: activeLoans.map(loan => ({
        loan_id: loan.loanId,
        loan_type: loan.loanType,
        amount: loan.amount,
        daily_interest: loan.dailyInterest,
        total_repayment: loan.totalRepayment,
        repaid_amount: loan.repaidAmount,
        days_remaining: Math.ceil((loan.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        due_date: loan.dueDate
      })),
      credit_rating: player.creditRating,
      max_loan_amount: maxLoanAmount
    });
  } catch (error) {
    logger.error('Get loan status error:', error);
    throw error;
  }
};

// Helper functions
function calculateLoanParameters(loanType: string, amount: number, durationDays: number, creditRating: string) {
  switch (loanType) {
    case 'short_term':
      return {
        maxAmount: CONSTANTS.SHORT_TERM_LOAN_MAX,
        dailyInterest: CONSTANTS.SHORT_TERM_LOAN_INTEREST
      };
    case 'medium_term':
      return {
        maxAmount: CONSTANTS.MEDIUM_TERM_LOAN_MAX,
        dailyInterest: CONSTANTS.MEDIUM_TERM_LOAN_INTEREST
      };
    case 'long_term':
      return {
        maxAmount: CONSTANTS.LONG_TERM_LOAN_MAX,
        dailyInterest: CONSTANTS.LONG_TERM_LOAN_INTEREST
      };
    case 'emergency':
      return {
        maxAmount: CONSTANTS.EMERGENCY_LOAN_MAX,
        dailyInterest: CONSTANTS.EMERGENCY_LOAN_INTEREST
      };
    default:
      throw new AppError(CONSTANTS.ERROR_MESSAGES.INVALID_LOAN_TYPE, 400);
  }
}

function calculateMaxLoanAmount(creditRating: string): number {
  switch (creditRating) {
    case 'S':
      return CONSTANTS.LONG_TERM_LOAN_MAX;
    case 'A':
      return CONSTANTS.MEDIUM_TERM_LOAN_MAX;
    case 'B':
      return CONSTANTS.SHORT_TERM_LOAN_MAX * 2;
    case 'C':
      return CONSTANTS.SHORT_TERM_LOAN_MAX;
    case 'D':
      return 0; // No loans available
    default:
      return CONSTANTS.SHORT_TERM_LOAN_MAX;
  }
}
