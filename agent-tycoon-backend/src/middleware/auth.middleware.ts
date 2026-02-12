import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../middleware/errorHandler.middleware';
import { logger } from '../utils/logger';

/**
 * Authentication middleware
 * Verifies JWT token and adds player info to request
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Add player info to request
    req.player = {
      playerId: decoded.playerId,
      agentId: decoded.agentId,
      agentName: decoded.agentName
    };

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    throw new AppError('Invalid or expired token', 401);
  }
};

/**
 * Extend Express Request type to include player
 */
declare global {
  namespace Express {
    interface Request {
      player?: {
        playerId: number;
        agentId: string;
        agentName: string;
      };
    }
  }
}
