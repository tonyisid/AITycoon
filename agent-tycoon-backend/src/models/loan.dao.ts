/**
 * Loan Data Access Object
 */

import { query } from '../config/database-connection';

export interface Loan {
  id: number;
  loan_id: string;
  player_id: number;
  loan_type: 'short' | 'medium' | 'long';
  amount: number;
  duration_days: number;
  daily_interest: number;
  total_repayment: number;
  due_date: Date;
  repaid_amount: number;
  status: 'active' | 'repaid' | 'defaulted' | 'cancelled';
  is_overdue: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Create a new loan
 */
export async function createLoan(
  loan: Omit<Loan, 'id' | 'created_at' | 'updated_at'>
): Promise<Loan> {
  const result = await query<Loan>(`
    INSERT INTO loans (
      loan_id, player_id, loan_type, amount, duration_days,
      daily_interest, total_repayment, due_date, repaid_amount,
      status, is_overdue
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `, [
    `loan_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    loan.player_id,
    loan.loan_type,
    loan.amount,
    loan.duration_days,
    loan.daily_interest,
    loan.total_repayment,
    loan.due_date,
    0,
    'active',
    false,
  ]);

  return result.rows[0];
}

/**
 * Get loan by ID
 */
export async function getLoanById(id: number): Promise<Loan | null> {
  const text = 'SELECT * FROM loans WHERE id = $1';
  const result = await query<Loan>(text, [id]);
  return result.rows[0] || null;
}

/**
 * List loans by player
 */
export async function listLoansByPlayer(playerId: number): Promise<Loan[]> {
  const text = 'SELECT * FROM loans WHERE player_id = $1 ORDER BY created_at DESC';
  const result = await query<Loan>(text, [playerId]);
  return result.rows;
}

/**
 * List active loans
 */
export async function listActiveLoans(): Promise<Loan[]> {
  const text = "SELECT * FROM loans WHERE status = 'active' ORDER BY due_date ASC";
  const result = await query<Loan>(text, []);
  return result.rows;
}

/**
 * Repay loan
 */
export async function repayLoan(loanId: number, amount: number): Promise<Loan> {
  const text = `
    UPDATE loans
    SET repaid_amount = repaid_amount + $1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
      AND status = 'active'
    RETURNING *
  `;

  const result = await query<Loan>(text, [amount, loanId]);

  if (result.rows.length === 0) {
    throw new Error('Loan not active');
  }

  // Check if fully repaid
  const loan = result.rows[0];
  if (loan.repaid_amount >= loan.total_repayment) {
    // Mark as repaid
    await query<Loan>(`
      UPDATE loans
      SET status = 'repaid',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [loanId]);
  }

  return loan;
}

/**
 * Mark loan as defaulted
 */
export async function markDefaulted(loanId: number): Promise<Loan> {
  const text = `
    UPDATE loans
    SET status = 'defaulted',
        is_overdue = true,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
      AND status = 'active'
    RETURNING *
  `;

  const result = await query<Loan>(text, [loanId]);
  return result.rows[0];
}
