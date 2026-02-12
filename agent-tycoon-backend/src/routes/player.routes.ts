import { Router, Request, Response } from 'express';
import { getPlayerInfo, updatePlayerInfo } from '../controllers/player.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/v1/player
 * @desc    Get player information
 * @access  Private
 * @returns { success, player_info }
 */
router.get('/', getPlayerInfo);

/**
 * @route   PUT /api/v1/player
 * @desc    Update player information
 * @access  Private
 * @body    { agent_name, webhook_url }
 * @returns { success, player_info }
 */
router.put('/', updatePlayerInfo);

export default router;
