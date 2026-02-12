import { Response } from 'express';
import { Building } from '../models/Building';
import { Player } from '../models/Player';
import { Land } from '../models/Land';
import { AppError } from '../middleware/errorHandler.middleware';
import { logger } from '../utils/logger';
import CONSTANTS from '../utils/constants';

/**
 * Get all buildings for a player
 * @route   GET /api/v1/building
 * @access  Private
 */
export const getBuildings = async (req: any, res: Response) => {
  try {
    const { playerId } = req.player;

    // Get player's buildings
    const buildings = await Building.find({ where: { ownerId: playerId } });

    logger.info(`Retrieved ${buildings.length} buildings for player ${playerId}`);

    res.json({
      success: true,
      buildings: buildings.map(building => ({
        building_id: building.buildingId,
        land_id: building.landId,
        building_type: building.buildingType,
        building_level: building.buildingLevel,
        production_efficiency: building.productionEfficiency,
        power_consumption: building.powerConsumption,
        worker_count: building.workerCount,
        construction_start: building.constructionStart,
        construction_end: building.constructionEnd,
        upgrade_start: building.upgradeStart,
        upgrade_end: building.upgradeEnd
      }))
    });
  } catch (error) {
    logger.error('Get buildings error:', error);
    throw error;
  }
};

/**
 * Create a new building
 * @route   POST /api/v1/building/create
 * @access  Private
 */
export const createBuilding = async (req: any, res: Response) => {
  try {
    const { playerId } = req.player;
    const { land_id, building_type, building_level = 1 } = req.body;

    // Validate input
    if (!land_id || !building_type) {
      throw new AppError('land_id and building_type are required', 400);
    }

    // Find land
    const land = await Land.findOne({ where: { landId: land_id, currentOwner: playerId } });

    if (!land) {
      throw new AppError('Land not found or not owned by player', 404);
    }

    // Find player
    const player = await Player.findOne({ where: { id: playerId } });

    if (!player) {
      throw new AppError(CONSTANTS.ERROR_MESSAGES.PLAYER_NOT_FOUND, 404);
    }

    // Get building cost
    const buildingCost = getBuildingCost(building_type);
    const constructionTime = getConstructionTime(building_level);

    // Check if player has enough credits
    if (player.creditPoints < buildingCost) {
      throw new AppError(CONSTANTS.ERROR_MESSAGES.INSUFFICIENT_CREDITS, 400);
    }

    // Calculate construction end time
    const constructionStart = new Date();
    const constructionEnd = new Date(constructionStart.getTime() + constructionTime * 1000);

    // Create building
    const building = await Building.create({
      landId: land.id,
      ownerId: playerId,
      buildingType: building_type,
      buildingLevel: building_level,
      productionEfficiency: 1.0,
      powerConsumption: getBuildingPowerConsumption(building_type, building_level),
      workerCount: 0,
      constructionStart,
      constructionEnd
    });

    // Deduct credits
    player.creditPoints -= buildingCost;
    await player.save();

    logger.info(`Building created: ${building_type} on land ${land_id} by ${player.agentName}`);

    res.json({
      success: true,
      building_id: building.buildingId,
      construction_time: constructionTime,
      estimated_completion: constructionEnd,
      cost: buildingCost,
      remaining_credits: player.creditPoints
    });
  } catch (error) {
    logger.error('Create building error:', error);
    throw error;
  }
};

/**
 * Upgrade an existing building
 * @route   POST /api/v1/building/upgrade
 * @access  Private
 */
export const upgradeBuilding = async (req: any, res: Response) => {
  try {
    const { playerId } = req.player;
    const { building_id, target_level } = req.body;

    // Validate input
    if (!building_id || !target_level) {
      throw new AppError('building_id and target_level are required', 400);
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

    // Calculate upgrade cost and time
    const upgradeCost = getUpgradeCost(building.buildingType, building.buildingLevel, target_level);
    const upgradeTime = getUpgradeTime(building.buildingLevel, target_level);

    // Check if player has enough credits
    if (player.creditPoints < upgradeCost) {
      throw new AppError(CONSTANTS.ERROR_MESSAGES.INSUFFICIENT_CREDITS, 400);
    }

    // Calculate upgrade end time
    const upgradeStart = new Date();
    const upgradeEnd = new Date(upgradeStart.getTime() + upgradeTime * 1000);

    // Update building
    building.upgradeStart = upgradeStart;
    building.upgradeEnd = upgradeEnd;
    await building.save();

    // Deduct credits
    player.creditPoints -= upgradeCost;
    await player.save();

    logger.info(`Building upgraded: ${building_id} to level ${target_level} by ${player.agentName}`);

    res.json({
      success: true,
      building_id: building_id,
      upgrade_time: upgradeTime,
      estimated_completion: upgradeEnd,
      cost: upgradeCost,
      remaining_credits: player.creditPoints
    });
  } catch (error) {
    logger.error('Upgrade building error:', error);
    throw error;
  }
};

// Helper functions
function getBuildingCost(buildingType: string): number {
  const costMap: { [key: string]: number } = {
    agriculture: CONSTANTS.AGRICULTURE_COST,
    mining: CONSTANTS.MINING_COST,
    forestry: CONSTANTS.FORESTRY_COST,
    fishery: CONSTANTS.FISHERY_COST,
    food_processing: CONSTANTS.FOOD_PROCESSING_COST,
    machinery_manufacturing: CONSTANTS.MACHINERY_MANUFACTURING_COST,
    textile_clothing: CONSTANTS.TEXTILE_CLOTHING_COST,
    chemical: CONSTANTS.CHEMICAL_COST,
    software_development: CONSTANTS.SOFTWARE_DEVELOPMENT_COST,
    retail_commerce: CONSTANTS.RETAIL_COMMERCE_COST,
    education_training: CONSTANTS.EDUCATION_TRAINING_COST,
    medical_healthcare: CONSTANTS.MEDICAL_HEALTHCARE_COST,
    entertainment_culture: CONSTANTS.ENTERTAINMENT_CULTURE_COST,
    energy_electricity: CONSTANTS.ENERGY_ELECTRICITY_COST
  };

  return costMap[buildingType] || 5000;
}

function getConstructionTime(buildingLevel: number): number {
  const level = CONSTANTS.BUILDING_LEVELS[buildingLevel as keyof typeof CONSTANTS.BUILDING_LEVELS];
  return level?.constructionTime || 3600; // Default 1 hour
}

function getUpgradeTime(currentLevel: number, targetLevel: number): number {
  const target = CONSTANTS.BUILDING_LEVELS[targetLevel as keyof typeof CONSTANTS.BUILDING_LEVELS];
  return target?.constructionTime || 14400; // Default 4 hours
}

function getBuildingPowerConsumption(buildingType: string, buildingLevel: number): number {
  const powerMap: { [key: string]: number[] } = {
    agriculture: [50, 45, 40, 35, 25], // kW for levels 1-5
    mining: [100, 90, 80, 70, 50],
    forestry: [50, 45, 40, 35, 25],
    fishery: [60, 54, 48, 42, 30],
    food_processing: [200, 180, 160, 140, 100],
    machinery_manufacturing: [300, 270, 240, 210, 150],
    textile_clothing: [250, 225, 200, 175, 125],
    chemical: [400, 360, 320, 280, 200],
    software_development: [100, 90, 80, 70, 50],
    retail_commerce: [150, 135, 120, 105, 75],
    education_training: [200, 180, 160, 140, 100],
    medical_healthcare: [250, 225, 200, 175, 125],
    entertainment_culture: [300, 270, 240, 210, 150],
    energy_electricity: [0, 0, 0, 0, 0] // Power plants don't consume power
  };

  const powerArray = powerMap[buildingType] || [100];
  return powerArray[buildingLevel - 1] || powerArray[0];
}

function getUpgradeCost(buildingType: string, currentLevel: number, targetLevel: number): number {
  const baseCost = getBuildingCost(buildingType);
  const levelMultiplier = targetLevel === 2 ? 2 : targetLevel === 3 ? 5 : targetLevel === 4 ? 10 : 20;

  return baseCost * levelMultiplier;
}
