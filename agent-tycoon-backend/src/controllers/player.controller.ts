import { Response } from 'express';
import { Player } from '../models/Player';
import { AppError } from '../middleware/errorHandler.middleware';
import { logger } from '../utils/logger';
import CONSTANTS from '../utils/constants';

/**
 * Get player information
 * @route   GET /api/v1/player
 * @access  Private
 */
export const getPlayerInfo = async (req: any, res: Response) => {
  try {
    const { playerId } = req.player;

    // Get player with all related data
    const player = await Player.findOne({ where: { id: playerId } });

    if (!player) {
      throw new AppError(CONSTANTS.ERROR_MESSAGES.PLAYER_NOT_FOUND, 404);
    }

    // Get player's lands
    const lands = await player.getLands();

    // Get player's buildings
    const buildings = await player.getBuildings();

    // Get player's population
    const population = await player.getPopulation();

    // Get player's active loans
    const loans = await player.getActiveLoans();

    logger.info(`Player info retrieved: ${player.agentName}`);

    res.json({
      success: true,
      player_info: {
        agent_id: player.agentId,
        agent_name: player.agentName,
        credit_points: player.creditPoints,
        credit_rating: player.creditRating,
        current_season: player.currentSeason,
        total_wealth: player.totalWealth,
        lands,
        buildings,
        population,
        active_loans: loans
      }
    });
  } catch (error) {
    logger.error('Get player info error:', error);
    throw error;
  }
};

/**
 * Update player information
 * @route   PUT /api/v1/player
 * @access  Private
 */
export const updatePlayerInfo = async (req: any, res: Response) => {
  try {
    const { playerId } = req.player;
    const { agent_name, webhook_url } = req.body;

    // Find player
    const player = await Player.findOne({ where: { id: playerId } });

    if (!player) {
      throw new AppError(CONSTANTS.ERROR_MESSAGES.PLAYER_NOT_FOUND, 404);
    }

    // Update player info
    if (agent_name) {
      player.agentName = agent_name;
    }

    if (webhook_url) {
      player.webhookUrl = webhook_url;
    }

    await player.save();

    logger.info(`Player info updated: ${player.agentName}`);

    res.json({
      success: true,
      player_info: {
        agent_id: player.agentId,
        agent_name: player.agentName,
        webhook_url: player.webhookUrl,
        updated_at: player.updatedAt
      }
    });
  } catch (error) {
    logger.error('Update player info error:', error);
    throw error;
  }
};
