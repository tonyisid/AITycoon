/**
 * Authentication Controller
 */

import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import * as PlayerDAO from '../models/player.dao';
import { generateApiKey, isValidApiKey } from '../utils/helpers';

/**
 * Register a new AI Agent
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { agentId, agentName, webhookUrl } = req.body;

    // Validation
    if (!agentId || !agentName) {
      res.status(400).json({
        success: false,
        message: 'agentId and agentName are required',
      });
      return;
    }

    // Check if agent already exists
    const existingPlayer = await PlayerDAO.getPlayerByAgentId(agentId);
    if (existingPlayer) {
      res.status(400).json({
        success: false,
        message: 'Agent ID already exists',
      });
      return;
    }

    // Generate API key
    const apiKey = generateApiKey();

    // Create player
    const player = await PlayerDAO.createPlayer({
      agent_id: agentId,
      agent_name: agentName,
      webhook_url: webhookUrl || null,
      api_key: apiKey,
      credit_points: 10000,
      credit_rating: 'B',
      current_season: 1,
      total_wealth: 10000,
      is_bankrupt: false,
    });

    logger.info(`New agent registered: ${agentId} (${agentName})`);

    res.status(201).json({
      success: true,
      data: {
        agentId: player.agent_id,
        agentName: player.agent_name,
        apiKey: player.api_key,
        creditPoints: player.credit_points,
        creditRating: player.credit_rating,
        createdAt: player.created_at,
      },
      message: 'Agent registered successfully',
    });
  } catch (error) {
    logger.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register agent',
    });
  }
}

/**
 * Login with API key
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { apiKey } = req.body;

    // Validation
    if (!apiKey) {
      res.status(400).json({
        success: false,
        message: 'API key is required',
      });
      return;
    }

    // Validate API key format
    if (!isValidApiKey(apiKey)) {
      res.status(400).json({
        success: false,
        message: 'Invalid API key format',
      });
      return;
    }

    // Find player by API key
    const player = await PlayerDAO.getPlayerByApiKey(apiKey);
    if (!player) {
      res.status(401).json({
        success: false,
        message: 'Invalid API key',
      });
      return;
    }

    logger.info(`Agent logged in: ${player.agent_id} (${player.agent_name})`);

    res.json({
      success: true,
      data: {
        agentId: player.agent_id,
        agentName: player.agent_name,
        apiKey: player.api_key,
        creditPoints: player.credit_points,
        creditRating: player.credit_rating,
        totalWealth: player.total_wealth,
        isBankrupt: player.is_bankrupt,
        currentSeason: player.current_season,
      },
      message: 'Login successful',
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to login',
    });
  }
}

/**
 * Get current player info
 */
export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    // Assume authentication middleware has attached player to request
    const playerId = (req as any).playerId;

    if (!playerId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const player = await PlayerDAO.getPlayerById(playerId);
    if (!player) {
      res.status(404).json({
        success: false,
        message: 'Player not found',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        agentId: player.agent_id,
        agentName: player.agent_name,
        webhookUrl: player.webhook_url,
        creditPoints: player.credit_points,
        creditRating: player.credit_rating,
        totalWealth: player.total_wealth,
        isBankrupt: player.is_bankrupt,
        currentSeason: player.current_season,
        createdAt: player.created_at,
      },
    });
  } catch (error) {
    logger.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get player info',
    });
  }
}

/**
 * Update webhook URL
 */
export async function updateWebhook(req: Request, res: Response): Promise<void> {
  try {
    const playerId = (req as any).playerId;
    const { webhookUrl } = req.body;

    if (!playerId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const player = await PlayerDAO.updatePlayer(playerId, {
      webhook_url: webhookUrl || null,
    });

    logger.info(`Webhook URL updated for agent: ${player.agent_id}`);

    res.json({
      success: true,
      data: {
        webhookUrl: player.webhook_url,
      },
      message: 'Webhook URL updated successfully',
    });
  } catch (error) {
    logger.error('Update webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update webhook URL',
    });
  }
}

export default {
  register,
  login,
  getMe,
  updateWebhook,
};
