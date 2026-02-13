/**
 * Authentication Middleware
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import * as PlayerDAO from '../models/player.dao';

// Extend Express Request type to include player
declare global {
  namespace Express {
    interface Request {
      playerId?: number;
      player?: any;
    }
  }
}

/**
 * Verify JWT token or API key
 */
export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Get API key from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: 'Authorization header required',
      });
      return;
    }

    const apiKey = authHeader.replace('Bearer ', '');

    // Validate player
    const player = await PlayerDAO.getPlayerByApiKey(apiKey);
    
    if (!player) {
      res.status(401).json({
        success: false,
        message: 'Invalid API key',
      });
      return;
    }

    // Attach player to request
    req.playerId = player.id;
    req.player = player;

    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error',
    });
  }
}

/**
 * Optional authentication - doesn't fail if no auth provided
 */
export async function optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      // No auth provided, continue without it
      return next();
    }

    const apiKey = authHeader.replace('Bearer ', '');
    const player = await PlayerDAO.getPlayerByApiKey(apiKey);
    
    if (player) {
      req.playerId = player.id;
      req.player = player;
    }

    next();
  } catch (error) {
    logger.error('Optional auth error:', error);
    next(); // Continue even if auth fails
  }
}
