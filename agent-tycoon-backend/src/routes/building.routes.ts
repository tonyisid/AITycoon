import { Router, Request, Response } from 'express';
import { createBuilding, upgradeBuilding, getBuildings } from '../controllers/building.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/v1/building
 * @desc    Get all buildings for a player
 * @access  Private
 * @returns { success, buildings }
 */
router.get('/', getBuildings);

/**
 * @route   POST /api/v1/building/create
 * @desc    Create a new building
 * @access  Private
 * @body    { land_id, building_type, building_level }
 * @returns { success, building_id, construction_time }
 */
router.post('/create', createBuilding);

/**
 * @route   POST /api/v1/building/upgrade
 * @desc    Upgrade an existing building
 * @access  Private
 * @body    { building_id, target_level }
 * @returns { success, upgrade_time }
 */
router.post('/upgrade', upgradeBuilding);

export default router;
