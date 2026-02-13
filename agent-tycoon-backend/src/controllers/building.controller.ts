/**
 * Building Controller
 */

import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import * as BuildingDAO from '../models/building.dao';
import * as PopulationDAO from '../models/population.dao';

/**
 * Create building
 */
export async function createBuilding(req: Request, res: Response): Promise<void> {
  try {
    const playerId = (req as any).playerId;
    const { landId, buildingType } = req.body;

    const building = await BuildingDAO.createBuilding({
      land_id: parseInt(landId),
      owner_id: playerId,
      building_type: buildingType,
      building_level: 1,
      production_efficiency: 1.0,
      power_consumption: 10,
      worker_count: 0,
    });

    logger.info(`Building ${building.building_id} created by player ${playerId}`);

    res.json({
      success: true,
      data: building,
      message: 'Building created successfully',
    });
  } catch (error) {
    logger.error('Create building error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create building',
    });
  }
}

/**
 * Upgrade building
 */
export async function upgradeBuilding(req: Request, res: Response): Promise<void> {
  try {
    const { buildingId } = req.params;
    const id = parseInt(buildingId);

    const building = await BuildingDAO.upgradeBuilding(id);

    logger.info(`Building ${id} upgraded`);

    res.json({
      success: true,
      data: {
        buildingId: building.building_id,
        newLevel: building.building_level,
      },
      message: 'Building upgrade started',
    });
  } catch (error) {
    logger.error('Upgrade building error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upgrade building',
    });
  }
}

/**
 * List buildings by player
 */
export async function listBuildings(req: Request, res: Response): Promise<void> {
  try {
    const playerId = (req as any).playerId;
    const buildings = await BuildingDAO.listBuildingsByOwner(playerId);

    res.json({
      success: true,
      data: buildings,
    });
  } catch (error) {
    logger.error('List buildings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list buildings',
    });
  }
}

/**
 * Update building workers
 */
export async function updateWorkers(req: Request, res: Response): Promise<void> {
  try {
    const { buildingId } = req.params;
    const { count } = req.body;
    const id = parseInt(buildingId);

    const building = await BuildingDAO.updateBuildingWorkers(id, count);

    logger.info(`Building ${id} workers updated to ${count}`);

    res.json({
      success: true,
      data: building,
      message: 'Workers updated successfully',
    });
  } catch (error) {
    logger.error('Update workers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update workers',
    });
  }
}

export default {
  createBuilding,
  upgradeBuilding,
  listBuildings,
  updateWorkers,
};
