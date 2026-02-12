import { MarketPrice } from '../models/MarketPrice';
import { cacheGet, cacheSet } from '../config/redis';
import { logger } from '../utils/logger';

/**
 * Get market price for an item type
 */
export async function getMarketPrice(itemType: string): Promise<number> {
  try {
    // Try cache first
    const cachedPrice = await cacheGet(`market_price:${itemType}`);
    if (cachedPrice) {
      return parseInt(cachedPrice);
    }

    // Get from database
    const marketPrice = await MarketPrice.findOne({ where: { itemType: itemType } });

    if (!marketPrice) {
      logger.warn(`Market price not found for item type: ${itemType}`);
      return 500; // Default price
    }

    // Cache for 5 minutes
    await cacheSet(`market_price:${itemType}`, marketPrice.currentPrice.toString(), 300);

    return marketPrice.currentPrice;
  } catch (error) {
    logger.error('Get market price error:', error);
    return 500; // Default price
  }
}

/**
 * Get building fixed cost
 */
export function getBuildingFixedCost(buildingType: string): number {
  const costMap: { [key: string]: number } = {
    agriculture: 100,
    mining: 150,
    forestry: 80,
    fishery: 120,
    food_processing: 200,
    machinery_manufacturing: 300,
    textile_clothing: 250,
    chemical: 400,
    software_development: 500,
    retail_commerce: 300,
    education_training: 400,
    medical_healthcare: 450,
    entertainment_culture: 350,
    energy_electricity: 600
  };

  return costMap[buildingType] || 100;
}

/**
 * Get worker wage
 */
export function getWorkerWage(buildingType: string): number {
  const wageMap: { [key: string]: number } = {
    agriculture: 20,
    mining: 20,
    forestry: 20,
    fishery: 20,
    food_processing: 30,
    machinery_manufacturing: 30,
    textile_clothing: 30,
    chemical: 30,
    software_development: 50,
    retail_commerce: 30,
    education_training: 50,
    medical_healthcare: 50,
    entertainment_culture: 50,
    energy_electricity: 30
  };

  return wageMap[buildingType] || 20;
}

/**
 * Get base worker requirement
 */
export function getBaseWorkerRequirement(buildingType: string): number {
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

/**
 * Get efficiency multiplier
 */
export function getEfficiencyMultiplier(buildingType: string): number {
  const CONSTANTS = require('../utils/constants').CONSTANTS;

  if (CONSTANTS.PRIMARY_INDUSTRIES.includes(buildingType)) {
    return 0.0; // No efficiency bonus for primary industries
  } else if (CONSTANTS.SECONDARY_INDUSTRIES.includes(buildingType)) {
    return 0.2; // 20% efficiency bonus for secondary industries
  } else if (CONSTANTS.TERTIARY_INDUSTRIES.includes(buildingType)) {
    return 0.5; // 50% efficiency bonus for tertiary industries
  }

  return 0.0;
}

/**
 * Get production amount
 */
export function getProductionAmount(buildingType: string): number {
  const productionMap: { [key: string]: number } = {
    agriculture: 5,
    mining: 10,
    forestry: 20,
    fishery: 3,
    food_processing: 10,
    machinery_manufacturing: 5,
    textile_clothing: 100,
    chemical: 2,
    software_development: 5,
    retail_commerce: 2000,
    education_training: 100,
    medical_healthcare: 50,
    entertainment_culture: 10,
    energy_electricity: 1000
  };

  return productionMap[buildingType] || 5;
}

/**
 * Get production item type
 */
export function getProductionItemType(buildingType: string): string {
  const itemMap: { [key: string]: string } = {
    agriculture: 'food',
    mining: 'ore',
    forestry: 'wood',
    fishery: 'fish',
    food_processing: 'food',
    machinery_manufacturing: 'machinery',
    textile_clothing: 'clothing',
    chemical: 'chemicals',
    software_development: 'software',
    retail_commerce: 'sales',
    education_training: 'education',
    medical_healthcare: 'healthcare',
    entertainment_culture: 'entertainment',
    energy_electricity: 'electricity'
  };

  return itemMap[buildingType] || 'item';
}

/**
 * Calculate daily profit
 */
export function calculateDailyProductionProfit(building: any, marketPrice: number): number {
  const productionAmount = getProductionAmount(building.buildingType) * building.productionEfficiency;
  return productionAmount * marketPrice;
}

/**
 * Calculate daily cost
 */
export function calculateDailyCost(building: any): number {
  const fixedCost = getBuildingFixedCost(building.buildingType);
  const powerCost = building.powerConsumption * 0.1; // 0.1 CP per kWh
  const laborCost = building.workerCount * getWorkerWage(building.buildingType);

  return fixedCost + powerCost + laborCost;
}

/**
 * Calculate daily net profit
 */
export function calculateDailyNetProfit(building: any, marketPrice: number): number {
  const revenue = calculateDailyProductionProfit(building, marketPrice);
  const cost = calculateDailyCost(building);

  return revenue - cost;
}
