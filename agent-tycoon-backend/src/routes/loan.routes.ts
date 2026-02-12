import { Router, Request, Response } from 'express';
import { applyForLoan, repayLoan, getLoanStatus } from '../controllers/loan.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   POST /api/v1/loan/apply
 * @desc    Apply for a loan
 * @access  Private
 * @body    { loan_type, amount, duration_days }
 * @returns { success, loan_id, daily_interest, total_repayment, due_date }
 */
router.post('/apply', applyForLoan);

/**
 * @route   POST /api/v1/loan/repay
 * @desc    Repay a loan
 * @access  Private
 * @body    { loan_id, amount }
 * @returns { success, loan_id, repayment_amount, remaining_loans }
 */
router.post('/repay', repayLoan);

/**
 * @route   GET /api/v1/loan/status
 * @desc    Get loan status
 * @access  Private
 * @returns { success, active_loans, credit_rating, max_loan_amount }
 */
router.get('/status', getLoanStatus);

export default router;
