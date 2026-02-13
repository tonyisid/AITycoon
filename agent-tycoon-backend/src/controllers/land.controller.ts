/**
 * Land Controller
 */

import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import * as LandDAO from '../models/land.dao';

/**
 * List available lands
 */
export async function listLands(req: Request, res: Response): Promise<void> {
  try {
    const { landType, minLocation, maxLocation, page, pageSize } = req.query;

    const filters = {
      landType: landType as string,
      minLocation: minLocation ? parseInt(minLocation as string) : undefined,
      maxLocation: maxLocation ? parseInt(maxLocation as string) : undefined,
      page: page ? parseInt(page as string) : undefined,
      pageSize: pageSize ? parseInt(pageSize as string) : undefined,
    };

    const result = await LandDAO.listLands(filters);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('List lands error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list lands',
    });
  }
}

/**
 * Get land details
 */
export async function getLand(req: Request, res: Response): Promise<void> {
  try {
    const { landId } = req.params;
    const id = parseInt(landId);

    const land = await LandDAO.getLandById(id);

    if (!land) {
      res.status(404).json({
        success: false,
        message: 'Land not found',
      });
      return;
    }

    res.json({
      success: true,
      data: land,
    });
  } catch (error) {
    logger.error('Get land error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get land',
    });
  }
}

/**
 * Purchase land
 */
export async function purchaseLand(req: Request, res: Response): Promise<void> {
  try {
    const { landId } = req.params;
    const playerId = (req as any).playerId;
    const id = parseInt(landId);

    const land = await LandDAO.purchaseLand(id, playerId);

    logger.info(`Land ${id} purchased by player ${playerId}`);

    res.json({
      success: true,
      data: {
        landId: land.land_id,
        playerId: playerId,
        basePrice: land.base_price,
      },
      message: 'Land purchased successfully',
    });
  } catch (error) {
    logger.error('Purchase land error:', error);
    
    if (error.message === 'Land not available for purchase') {
      res.status(400).json({
        success: false,
        message: 'Land not available',
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to purchase land',
    });
  }
}

/**
 * Create auction for land
 */
export async function createAuction(req: Request, res: Response): Promise<void> {
  try {
    const { landId } = req.params;
    const playerId = (req as any).playerId;
    const { startPrice } = req.body;
    const id = parseInt(landId);

    const land = await LandDAO.createAuction(id, playerId, startPrice || 0);

    logger.info(`Auction created for land ${id} by player ${playerId}`);

    res.json({
      success: true,
      data: {
        auctionId: land.auction_id,
        landId: land.land_id,
        startPrice: startPrice || 0,
      },
      message: 'Auction created successfully',
    });
  } catch (error) {
    logger.error('Create auction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create auction',
    });
  }
}

export default {
  listLands,
  getLand,
  purchaseLand,
  createAuction,
};
