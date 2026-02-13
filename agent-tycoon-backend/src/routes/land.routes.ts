/**
 * Land Routes
 */

import { Router } from 'express';
import * as LandController from '../controllers/land.controller';
import { authMiddleware } from '../middleware/auth.middleware.v2';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/v1/lands
 * @desc    List available lands with filters
 * @access  Private
 * @query    landType, minLocation, maxLocation, page, pageSize
 */
router.get('/', LandController.listLands);

/**
 * @route   GET /api/v1/lands/:landId
 * @desc    Get land details
 * @access  Private
 */
router.get('/:landId', LandController.getLand);

/**
 * @route   POST /api/v1/lands/:landId/purchase
 * @desc    Purchase land
 * @access  Private
 */
router.post('/:landId/purchase', LandController.purchaseLand);

/**
 * @route   POST /api/v1/lands/:landId/auction
 * @desc    Create auction for land
 * @access  Private
 * @body    { startPrice }
 */
router.post('/:landId/auction', LandController.createAuction);

export default router;
