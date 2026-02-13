/**
 * Population Controller
 */

import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import * as PopulationDAO from '../models/population.dao';

/**
 * Get population data
 */
export async function getPopulation(req: Request, res: Response): Promise<void> {
  try {
    const playerId = (req as any).playerId;
    const population = await PopulationDAO.getPopulationByPlayerId(playerId);

    if (!population) {
      res.status(404).json({
        success: false,
        message: 'Population not found',
      });
      return;
    }

    res.json({
      success: true,
      data: population,
    });
  } catch (error) {
    logger.error('Get population error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get population',
    });
  }
}

/**
 * Employ population
 */
export async function employPopulation(req: Request, res: Response): Promise<void> {
  try {
    const playerId = (req as any).playerId;
    const { count } = req.body;

    const population = await PopulationDAO.employPopulation(playerId, count);

    logger.info(`Player ${playerId} employed ${count} population`);

    res.json({
      success: true,
      data: {
        employed: population.employed_population,
        unemployed: population.unemployed_population,
        total: population.total_population,
      },
      message: 'Population employed successfully',
    });
  } catch (error) {
    logger.error('Employ population error:', error);
    
    if (error.message === 'Not enough unemployed population') {
      res.status(400).json({
        success: false,
        message: 'Not enough unemployed population',
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to employ population',
    });
  }
}

/**
 * Update satisfaction
 */
export async function updateSatisfaction(req: Request, res: Response): Promise<void> {
  try {
    const playerId = (req as any).playerId;
    const { satisfactionLevel } = req.body;

    const population = await PopulationDAO.updateSatisfaction(playerId, satisfactionLevel);

    logger.info(`Player ${playerId} satisfaction updated to ${satisfactionLevel}`);

    res.json({
      success: true,
      data: population,
      message: 'Satisfaction updated successfully',
    });
  } catch (error) {
    logger.error('Update satisfaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update satisfaction',
    });
  }
}

export default {
  getPopulation,
  employPopulation,
  updateSatisfaction,
};
