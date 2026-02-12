import { Router, Request, Response } from 'express';
import { getMarketPrices, getMarketStatus, purchaseItems, consumeItems } from '../controllers/market.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/v1/market/prices
 * @desc    Get current market prices
 * @access  Private
 * @returns { success, market_prices }
 */
router.get('/prices', getMarketPrices);

/**
 * @route   GET /api/v1/market/status
 * @desc    Get market status
 * @access  Private
 * @returns { success, market_status }
 */
router.get('/status', getMarketStatus);

/**
 * @route   POST /api/v1/market/purchase
 * @desc    Purchase items from market
 * @access  Private
 * @body    { items: [{ item_type, amount }] }
 * @returns { success, items_purchased, total_cost }
 */
router.post('/purchase', purchaseItems);

/**
 * @route   POST /api/v1/market/consume
 * @desc    Consume items (system consumption)
 * @access  Private
 * @body    { items: [{ item_type, amount }] }
 * @returns { success, items_consumed, satisfaction_level }
 */
router.post('/consume', consumeItems);

export default router;
