import { Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Player } from '../models/Player';
import { AppError } from '../middleware/errorHandler.middleware';
import { logger } from '../utils/logger';
import CONSTANTS from '../utils/constants';

/**
 * Register a new AI Agent
 * @route   POST /api/v1/auth/register
 * @access  Public
 * @body    { agent_id, agent_name, webhook_url }
 */
export const register = async (req: any, res: Response) => {
  try {
    const { agent_id, agent_name, webhook_url } = req.body;

    // Validate input
    if (!agent_id || !agent_name) {
      throw new AppError('agent_id and agent_name are required', 400);
    }

    // Check if agent already exists
    const existingPlayer = await Player.findOne({ where: { agentId: agent_id } });
    if (existingPlayer) {
      throw new AppError('Agent ID already exists', 400);
    }

    // Generate API key
    const api_key = `sk_live_${crypto.randomBytes(32).toString('hex')}`;

    // Create new player
    const player = await Player.create({
      agentId: agent_id,
      agentName: agent_name,
      webhookUrl: webhook_url || null,
      apiKey: api_key,
      creditPoints: CONSTANTS.INITIAL_CREDIT_POINTS,
      creditRating: 'B',
      currentSeason: 1,
      totalWealth: CONSTANTS.INITIAL_CREDIT_POINTS
    });

    // Create initial population
    await player.createPopulation();

    // Generate initial land
    await player.generateInitialLand();

    logger.info(`New player registered: ${agent_name} (${agent_id})`);

    res.status(201).json({
      success: true,
      api_key: api_key,
      agent_id: agent_id,
      message: 'Agent registered successfully'
    });
  } catch (error) {
    logger.error('Register error:', error);
    throw error;
  }
};

/**
 * Login and get access token
 * @route   POST /api/v1/auth/login
 * @access  Public
 * @body    { api_key }
 */
export const login = async (req: any, res: Response) => {
  try {
    const { api_key } = req.body;

    // Validate input
    if (!api_key) {
      throw new AppError('api_key is required', 400);
    }

    // Find player by API key
    const player = await Player.findOne({ where: { apiKey: api_key } });
    if (!player) {
      throw new AppError(CONSTANTS.ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        playerId: player.id,
        agentId: player.agentId,
        agentName: player.agentName
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: parseInt(process.env.JWT_EXPIRES_IN || '3600') } // 1 hour
    );

    logger.info(`Player logged in: ${player.agentName} (${player.agentId})`);

    res.json({
      success: true,
      access_token: token,
      expires_in: 3600
    });
  } catch (error) {
    logger.error('Login error:', error);
    throw error;
  }
};

/**
 * Refresh access token
 * @route   POST /api/v1/auth/refresh
 * @access  Public
 * @body    { api_key }
 */
export const refreshToken = async (req: any, res: Response) => {
  try {
    const { api_key } = req.body;

    // Validate input
    if (!api_key) {
      throw new AppError('api_key is required', 400);
    }

    // Find player by API key
    const player = await Player.findOne({ where: { apiKey: api_key } });
    if (!player) {
      throw new AppError(CONSTANTS.ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    // Generate new JWT token
    const token = jwt.sign(
      {
        playerId: player.id,
        agentId: player.agentId,
        agentName: player.agentName
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: parseInt(process.env.JWT_EXPIRES_IN || '3600') } // 1 hour
    );

    res.json({
      success: true,
      access_token: token,
      expires_in: 3600
    });
  } catch (error) {
    logger.error('Refresh token error:', error);
    throw error;
  }
};
