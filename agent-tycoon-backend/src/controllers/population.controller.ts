import { Response } from 'express';
import { Population } from '../models/Population';
import { Player } from '../models/Player';
import { Building } from '../models/Building';
import { AppError } from '../middleware/errorHandler.middleware';
import { logger } from '../utils/logger';
import CONSTANTS from '../utils/constants';

/**
 * Get population status
 * @route   GET /api/v1/population
 * @access  Private
 */
export const getPopulationStatus = async (req: any, res: Response) => {
  try {
    const { playerId } = req.player;

    // Get player's population
    const population = await Population.findOne({ where: { playerId } });

    if (!population) {
      throw new AppError(CONSTANTS.ERROR_MESSAGES.POPULATION_NOT_FOUND, 404);
    }

    logger.info(`Population status retrieved for player ${playerId}`);

    res.json({
      success: true,
      population_info: {
        total_population: population.totalPopulation,
        employed_population: population.employedPopulation,
        unemployed_population: population.unemployedPopulation,
        satisfaction_level: population.satisfactionLevel,
        growth_rate: population.growthRate,
        daily_food_consumption: population.dailyFoodConsumption,
        daily_clothing_consumption: population.dailyClothingConsumption,
        daily_housing_consumption: population.dailyHousingConsumption,
        daily_entertainment_consumption: population.dailyEntertainmentConsumption
      }
    });
  } catch (error) {
    logger.error('Get population status error:', error);
    throw error;
  }
};

/**
 * Employ workers
 * @route   POST /api/v1/population/employ
 * @access  Private
 */
export const employWorkers = async (req: any, res: Response) => {
  try {
    const { playerId } = req.player;
    const { building_id, worker_count, wage } = req.body;

    // Validate input
    if (!building_id || !worker_count || !wage) {
      throw new AppError('building_id, worker_count, and wage are required', 400);
    }

    // Find building
    const building = await Building.findOne({ where: { buildingId: building_id, ownerId: playerId } });

    if (!building) {
      throw new AppError(CONSTANTS.ERROR_MESSAGES.BUILDING_NOT_FOUND, 404);
    }

    // Find player
    const player = await Player.findOne({ where: { id: playerId } });

    if (!player) {
      throw new AppError(CONSTANTS.ERROR_MESSAGES.PLAYER_NOT_FOUND, 404);
    }

    // Find population
    const population = await Population.findOne({ where: { playerId } });

    if (!population) {
      throw new AppError(CONSTANTS.ERROR_MESSAGES.POPULATION_NOT_FOUND, 404);
    }

    // Check if enough unemployed workers
    if (population.unemployedPopulation < worker_count) {
      throw new AppError('Not enough unemployed workers', 400);
    }

    // Calculate production efficiency gain
    const baseWorkers = getBaseWorkerRequirement(building.buildingType);
    const efficiencyGain = calculateEfficiencyGain(worker_count, baseWorkers, building.buildingType);

    // Update building
    building.workerCount += worker_count;
    building.productionEfficiency += efficiencyGain;
    await building.save();

    // Update population
    population.employedPopulation += worker_count;
    population.unemployedPopulation -= worker_count;
    await population.save();

    // Calculate daily wage cost
    const dailyWageCost = worker_count * wage;

    logger.info(`Workers employed: ${worker_count} at building ${building_id} by ${player.agentName}`);

    res.json({
      success: true,
      building_id: building_id,
      workers_added: worker_count,
      total_workers: building.workerCount,
      daily_wage_cost,
      production_efficiency: building.productionEfficiency
    });
  } catch (error) {
    logger.error('Employ workers error:', error);
    throw error;
  }
};

/**
 * Fire workers
 * @route   POST /api/v1/population/fire
 * @access  Private
 */
export const fireWorkers = async (req: any, res: Response) => {
  try {
    const { playerId } = req.player;
    const { building_id, worker_count } = req.body;

    // Validate input
    if (!building_id || !worker_count) {
      throw new AppError('building_id and worker_count are required', 400);
    }

    // Find building
    const building = await Building.findOne({ where: { buildingId: building_id, ownerId: playerId } });

    if (!building) {
      throw new AppError(CONSTANTS.ERROR_MESSAGES.BUILDING_NOT_FOUND, 404);
    }

    // Check if enough workers
    if (building.workerCount < worker_count) {
      throw new AppError('Not enough workers to fire', 400);
    }

    // Find population
    const population = await Population.findOne({ where: { playerId } });

    if (!population) {
      throw new AppError(CONSTANTS.ERROR_MESSAGES.POPULATION_NOT_FOUND, 404);
    }

    // Calculate production efficiency loss
    const baseWorkers = getBaseWorkerRequirement(building.buildingType);
    const efficiencyLoss = calculateEfficiencyLoss(worker_count, baseWorkers, building.buildingType);

    // Update building
    building.workerCount -= worker_count;
    building.productionEfficiency -= efficiencyLoss;
    await building.save();

    // Update population
    population.employedPopulation -= worker_count;
    population.unemployedPopulation += worker_count;
    await population.save();

    logger.info(`Workers fired: ${worker_count} from building ${building_id} by ${player.agentName}`);

    res.json({
      success: true,
      building_id: building_id,
      workers_removed: worker_count,
      total_workers: building.workerCount,
      production_efficiency: building.productionEfficiency
    });
  } catch (error) {
    logger.error('Fire workers error:', error);
    throw error;
  }
};

// Helper functions
function getBaseWorkerRequirement(buildingType: string): number {
  const workerMap: { [key: string]: number } = {
    agriculture: 10,
    mining: 10,
    forestry: 10,
    fishery: 10,
    food_processing: 20,
    machinery_manufacturing: 20,
    textile_clothing: 20,
    chemical: 20,
    software_development: 5,
    retail_commerce: 5,
    education_training: 5,
    medical_healthcare: 5,
    entertainment_culture: 5,
    energy_electricity: 15
  };

  return workerMap[buildingType] || 10;
}

function calculateEfficiencyGain(workerCount: number, baseWorkers: number, buildingType: string): number {
  const efficiencyMultiplier = getEfficiencyMultiplier(buildingType);
  return (workerCount / baseWorkers) * efficiencyMultiplier;
}

function calculateEfficiencyLoss(workerCount: number, baseWorkers: number, buildingType: string): number {
  const efficiencyMultiplier = getEfficiencyMultiplier(buildingType);
  return (workerCount / baseWorkers) * efficiencyMultiplier;
}

function getEfficiencyMultiplier(buildingType: string): number {
  if (CONSTANTS.PRIMARY_INDUSTRIES.includes(buildingType)) {
    return 0.0; // No efficiency bonus for primary industries
  } else if (CONSTANTS.SECONDARY_INDUSTRIES.includes(buildingType)) {
    return 0.2; // 20% efficiency bonus for secondary industries
  } else if (CONSTANTS.TERTIARY_INDUSTRIES.includes(buildingType)) {
    return 0.5; // 50% efficiency bonus for tertiary industries
  }
  return 0.0;
}
