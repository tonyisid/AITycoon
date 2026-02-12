import { Response } from 'express';
import { Land } from '../models/Land';
import { Player } from '../models/Player';
import { AppError } from '../middleware/errorHandler.middleware';
import { logger } from '../utils/logger';
import CONSTANTS from '../utils/constants';

/**
 * Get all available lands
 * @route   GET /api/v1/land
 * @access  Private
 */
export const getLands = async (req: any, res: Response) => {
  try {
    // Get all unowned lands
    const lands = await Land.find({ where: { currentOwner: null } });

    logger.info(`Retrieved ${lands.length} available lands`);

    res.json({
      success: true,
      lands: lands.map(land => ({
        land_id: land.landId,
        land_type: land.landType,
        area: land.area,
        location: land.location,
        power_capacity: land.powerCapacity,
        water_resource: land.waterResource,
        transport_access: land.transportAccess,
        base_price: land.basePrice,
        auction_id: land.auctionId
      }))
    });
  } catch (error) {
    logger.error('Get lands error:', error);
    throw error;
  }
};

/**
 * Purchase a land
 * @route   POST /api/v1/land/purchase
 * @access  Private
 */
export const purchaseLand = async (req: any, res: Response) => {
  try {
    const { playerId } = req.player;
    const { land_id, bid_price } = req.body;

    // Validate input
    if (!land_id || !bid_price) {
      throw new AppError('land_id and bid_price are required', 400);
    }

    // Find land
    const land = await Land.findOne({ where: { landId: land_id } });

    if (!land) {
      throw new AppError(CONSTANTS.ERROR_MESSAGES.LAND_NOT_FOUND, 404);
    }

    // Check if land is available
    if (land.currentOwner) {
      throw new AppError('Land is already owned', 400);
    }

    // Find player
    const player = await Player.findOne({ where: { id: playerId } });

    if (!player) {
      throw new AppError(CONSTANTS.ERROR_MESSAGES.PLAYER_NOT_FOUND, 404);
    }

    // Check if player has enough credits
    if (player.creditPoints < bid_price) {
      throw new AppError(CONSTANTS.ERROR_MESSAGES.INSUFFICIENT_CREDITS, 400);
    }

    // Transfer ownership
    land.currentOwner = player.id;
    await land.save();

    // Deduct credits
    player.creditPoints -= bid_price;
    await player.save();

    logger.info(`Land purchased: ${land_id} by ${player.agentName} for ${bid_price} CP`);

    res.json({
      success: true,
      land_id: land_id,
      price_paid: bid_price,
      remaining_credits: player.creditPoints
    });
  } catch (error) {
    logger.error('Purchase land error:', error);
    throw error;
  }
};

/**
 * Get all ongoing auctions
 * @route   GET /api/v1/land/auctions
 * @access  Private
 */
export const getAuctions = async (req: any, res: Response) => {
  try {
    // Get all lands with auctions
    const lands = await Land.find({ where: { auctionId: null, isNull: false } });

    logger.info(`Retrieved ${lands.length} auctioned lands`);

    res.json({
      success: true,
      auctions: lands.map(land => ({
        land_id: land.landId,
        land_type: land.landType,
        base_price: land.basePrice,
        current_bid: land.currentBid,
        auction_end: land.auctionEnd,
        highest_bidder: land.highestBidder
      }))
    });
  } catch (error) {
    logger.error('Get auctions error:', error);
    throw error;
  }
};
