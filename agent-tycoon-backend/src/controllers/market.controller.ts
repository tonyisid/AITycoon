import { Response } from 'express';
import { MarketPrice } from '../models/MarketPrice';
import { Player } from '../models/Player';
import { AppError } from '../middleware/errorHandler.middleware';
import { logger } from '../utils/logger';
import CONSTANTS from '../utils/constants';

/**
 * Get current market prices
 * @route   GET /api/v1/market/prices
 * @access  Private
 */
export const getMarketPrices = async (req: any, res: Response) => {
  try {
    // Get all market prices
    const marketPrices = await MarketPrice.find();

    logger.info(`Market prices retrieved: ${marketPrices.length} items`);

    res.json({
      success: true,
      market_prices: marketPrices.map(price => ({
        item_type: price.itemType,
        base_price: price.basePrice,
        current_price: price.currentPrice,
        total_demand: price.totalDemand,
        total_supply: price.totalSupply,
        price_trend: price.priceTrend,
        market_sentiment: price.marketSentiment
      }))
    });
  } catch (error) {
    logger.error('Get market prices error:', error);
    throw error;
  }
};

/**
 * Get market status
 * @route   GET /api/v1/market/status
 * @access  Private
 */
export const getMarketStatus = async (req: any, res: Response) => {
  try {
    // Get all market prices and calculate market status
    const marketPrices = await MarketPrice.find();

    // Calculate market health indicators
    const totalSupply = marketPrices.reduce((sum, price) => sum + price.totalSupply, 0);
    const totalDemand = marketPrices.reduce((sum, price) => sum + price.totalDemand, 0);
    const supplyDemandRatio = totalSupply / totalDemand;

    // Determine market status
    let marketStatus = 'balanced';
    if (supplyDemandRatio > 1.2) {
      marketStatus = 'oversupply';
    } else if (supplyDemandRatio < 0.8) {
      marketStatus = 'shortage';
    }

    logger.info(`Market status: ${marketStatus}, supply/demand ratio: ${supplyDemandRatio}`);

    res.json({
      success: true,
      market_status: {
        status: marketStatus,
        supply_demand_ratio: supplyDemandRatio,
        total_supply,
        total_demand,
        total_items: marketPrices.length
      }
    });
  } catch (error) {
    logger.error('Get market status error:', error);
    throw error;
  }
};

/**
 * Purchase items from market
 * @route   POST /api/v1/market/purchase
 * @access  Private
 */
export const purchaseItems = async (req: any, res: Response) => {
  try {
    const { playerId } = req.player;
    const { items } = req.body;

    // Validate input
    if (!items || !Array.isArray(items)) {
      throw new AppError('items array is required', 400);
    }

    // Find player
    const player = await Player.findOne({ where: { id: playerId } });

    if (!player) {
      throw new AppError(CONSTANTS.ERROR_MESSAGES.PLAYER_NOT_FOUND, 404);
    }

    let totalCost = 0;
    const purchasedItems = [];

    // Process each item
    for (const item of items) {
      const { item_type, amount } = item;

      // Find market price
      const marketPrice = await MarketPrice.findOne({ where: { itemType: item_type } });

      if (!marketPrice) {
        throw new AppError(CONSTANTS.ERROR_MESSAGES.ITEM_NOT_FOUND, 404);
      }

      // Calculate cost
      const itemCost = marketPrice.currentPrice * amount;
      totalCost += itemCost;

      // Update market supply/demand
      marketPrice.totalSupply -= amount;
      marketPrice.totalDemand += amount;
      await marketPrice.save();

      purchasedItems.push({
        item_type,
        amount,
        unit_price: marketPrice.currentPrice,
        total_cost: itemCost
      });
    }

    // Check if player has enough credits
    if (player.creditPoints < totalCost) {
      throw new AppError(CONSTANTS.ERROR_MESSAGES.INSUFFICIENT_CREDITS, 400);
    }

    // Deduct credits
    player.creditPoints -= totalCost;
    await player.save();

    logger.info(`Items purchased: ${purchasedItems.length} items by ${player.agentName}`);

    res.json({
      success: true,
      items_purchased: purchasedItems,
      total_cost: totalCost,
      remaining_credits: player.creditPoints
    });
  } catch (error) {
    logger.error('Purchase items error:', error);
    throw error;
  }
};

/**
 * Consume items (system consumption)
 * @route   POST /api/v1/market/consume
 * @access  Private
 */
export const consumeItems = async (req: any, res: Response) => {
  try {
    const { playerId } = req.player;
    const { consumer_type = 'system', items } = req.body;

    // Validate input
    if (!items || !Array.isArray(items)) {
      throw new AppError('items array is required', 400);
    }

    // Find player
    const player = await Player.findOne({ where: { id: playerId } });

    if (!player) {
      throw new AppError(CONSTANTS.ERROR_MESSAGES.PLAYER_NOT_FOUND, 404);
    }

    // Get player's population
    const population = await player.getPopulation();

    let totalCost = 0;
    const consumedItems = [];

    // Process each item
    for (const item of items) {
      const { item_type, amount } = item;

      // Find market price
      const marketPrice = await MarketPrice.findOne({ where: { itemType: item_type } });

      if (!marketPrice) {
        throw new AppError(CONSTANTS.ERROR_MESSAGES.ITEM_NOT_FOUND, 404);
      }

      // Calculate cost
      const itemCost = marketPrice.currentPrice * amount;
      totalCost += itemCost;

      // Update market supply/demand
      marketPrice.totalDemand += amount;
      await marketPrice.save();

      consumedItems.push({
        item_type,
        amount,
        unit_price: marketPrice.currentPrice,
        total_cost: itemCost
      });
    }

    // Check if population consumption needs are met
    // This is a simplified version - in production, you'd track actual consumption
    const satisfactionLevel = calculateSatisfactionLevel(consumedItems, population);

    // Update population satisfaction
    population.satisfactionLevel = satisfactionLevel;
    await population.save();

    logger.info(`Items consumed: ${consumedItems.length} items by ${player.agentName}`);

    res.json({
      success: true,
      items_consumed: consumedItems,
      total_cost: totalCost,
      satisfaction_level: satisfactionLevel
    });
  } catch (error) {
    logger.error('Consume items error:', error);
    throw error;
  }
};

// Helper function
function calculateSatisfactionLevel(consumedItems: any[], population: any): number {
  // Simplified satisfaction calculation
  // In production, this would consider actual consumption vs required consumption

  let satisfaction = 0.5; // Base satisfaction

  // Add satisfaction based on items consumed
  for (const item of consumedItems) {
    switch (item.item_type) {
      case 'food':
        satisfaction += 0.2;
        break;
      case 'clothing':
        satisfaction += 0.1;
        break;
      case 'housing':
        satisfaction += 0.15;
        break;
      case 'entertainment':
        satisfaction += 0.1;
        break;
    }
  }

  return Math.min(satisfaction, 1.0); // Cap at 1.0 (100%)
}
