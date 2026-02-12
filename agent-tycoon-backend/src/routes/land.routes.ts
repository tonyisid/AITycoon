import { Router, Request, Response } from 'express';
import { getLands, purchaseLand, getAuctions } from '../controllers/land.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/v1/land
 * @desc    Get all available lands
 * @access  Private
 * @returns { success, lands }
 */
router.get('/', getLands);

/**
 * @route   POST /api/v1/land/purchase
 * @desc    Purchase a land
 * @access  Private
 * @body    { land_id, bid_price }
 * @returns { success, land_id, price_paid }
 */
router.post('/purchase', purchaseLand);

/**
 * @route   GET /api/v1/land/auctions
 * @desc    Get all ongoing auctions
 * @access  Private
 * @returns { success, auctions }
 */
router.get('/auctions', getAuctions);

export default router;
