import { logger } from '../utils/logger';
import CONSTANTS from '../utils/constants';
import { Player } from '../models/Player';
import { Building } from '../models/Building';
import { Population } from '../models/Population';
import { Loan } from '../models/Loan';
import { MarketPrice } from '../models/MarketPrice';
import { cacheGet, cacheSet } from '../config/redis';

/**
 * Game Loop Service
 * Handles the main game loop (production, consumption, market updates, etc.)
 */
class GameLoop {
  private intervalId: NodeJS.Timeout | null = null;
  private gameDay: number = 0;
  private isRunning: boolean = false;
  private readonly GAME_SPEED_MS = (parseInt(process.env.GAME_SPEED_MINUTES_PER_DAY || '10') * 60 * 1000); // 10 minutes per day

  /**
   * Start the game loop
   */
  start() {
    if (this.isRunning) {
      logger.warn('Game loop is already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting game loop...');

    // Run game tick immediately
    this.tick();

    // Schedule game loop
    this.intervalId = setInterval(() => {
      this.tick();
    }, this.GAME_SPEED_MS);

    logger.info(`Game loop started (speed: ${this.GAME_SPEED_MS}ms per day)`);
  }

  /**
   * Stop the game loop
   */
  stop() {
    if (!this.isRunning) {
      logger.warn('Game loop is not running');
      return;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
    logger.info('Game loop stopped');
  }

  /**
   * Game tick - runs every game day
   */
  private async tick() {
    try {
      this.gameDay++;
      logger.info(`=== Game Day ${this.gameDay} ===`);

      // 1. Production Settlement
      await this.productionSettlement();

      // 2. Wage Payment
      await this.wagePayment();

      // 3. Population Consumption
      await this.populationConsumption();

      // 4. Market Update
      await this.marketUpdate();

      // 5. Loan Interest
      await this.loanInterest();

      // 6. Loan Due Check
      await this.loanDueCheck();

      // 7. Population Growth/Loss
      await this.populationGrowthLoss();

      // 8. Building Completion
      await this.buildingCompletion();

      // 9. Auction Processing
      await this.auctionProcessing();

      // 10. Leaderboard Update
      await this.leaderboardUpdate();

      logger.info(`=== Game Day ${this.gameDay} Completed ===\n`);

      // Send webhook notifications
      await this.sendWebhookNotifications();

    } catch (error) {
      logger.error('Game loop error:', error);
    }
  }

  /**
   * Production Settlement
   * Process all building production
   */
  private async productionSettlement() {
    logger.info('Processing production settlement...');

    const buildings = await Building.find({ 
      where: { 
        constructionEnd: null, // Not under construction
        upgradeEnd: null // Not being upgraded 
      } 
    });

    for (const building of buildings) {
      if (await building.isOperational()) {
        const production = await building.getDailyProduction();
        const cost = await building.getDailyCost();
        const netProfit = (production.amount * getMarketPrice(production.itemType)) - cost;

        // Update player credits
        const player = await building.owner;
        player.creditPoints += netProfit;
        player.totalWealth += netProfit;
        await player.save();

        logger.debug(`Building ${building.buildingId}: produced ${production.amount} ${production.itemType}, profit: ${netProfit} CP`);
      }
    }

    logger.info(`Production settlement completed for ${buildings.length} buildings`);
  }

  /**
   * Wage Payment
   * Process all wage payments
   */
  private async wagePayment() {
    logger.info('Processing wage payments...');

    const buildings = await Building.find({ 
      where: { workerCount: 0 } // Only buildings with workers
    });

    let totalWagePaid = 0;

    for (const building of buildings) {
      const wageCost = building.workerCount * getWorkerWage(building.buildingType);

      if (wageCost > 0) {
        const player = await building.owner;

        if (player.creditPoints >= wageCost) {
          player.creditPoints -= wageCost;
          await player.save();
          totalWagePaid += wageCost;

          logger.debug(`Building ${building.buildingId}: paid ${wageCost} CP wages`);
        } else {
          // Not enough credits for wages
          logger.warn(`Building ${building.buildingId}: cannot afford ${wageCost} CP wages`);

          // Fire workers automatically
          building.workerCount = 0;
          await building.save();

          const population = await player.getPopulation();
          population.employedPopulation -= building.workerCount;
          population.unemployedPopulation += building.workerCount;
          await population.save();

          logger.warn(`Building ${building.buildingId}: fired all workers due to unpaid wages`);
        }
      }
    }

    logger.info(`Wage payments completed: ${totalWagePaid} CP total`);
  }

  /**
   * Population Consumption
   * Process all population consumption
   */
  private async populationConsumption() {
    logger.info('Processing population consumption...');

    const populations = await Population.find();

    for (const population of populations) {
      // Calculate daily consumption needs
      const foodConsumption = population.totalPopulation * CONSTANTS.DAILY_FOOD_CONSUMPTION_PER_PERSON;
      const clothingConsumption = population.totalPopulation * CONSTANTS.DAILY_CLOTHING_CONSUMPTION_PER_PERSON;
      const housingConsumption = population.totalPopulation * CONSTANTS.DAILY_HOUSING_CONSUMPTION_PER_PERSON;
      const entertainmentConsumption = population.totalPopulation * CONSTANTS.DAILY_ENTERTAINMENT_CONSUMPTION_PER_PERSON;

      // Get market prices
      const foodPrice = await getMarketPrice('food');
      const clothingPrice = await getMarketPrice('clothing');
      const housingPrice = await getMarketPrice('housing');
      const entertainmentPrice = await getMarketPrice('entertainment');

      // Calculate consumption cost
      const totalCost = 
        (foodConsumption * foodPrice) +
        (clothingConsumption * clothingPrice) +
        (housingConsumption * housingPrice) +
        (entertainmentConsumption * entertainmentPrice);

      // Deduct from player
      const player = await population.player;
      if (player.creditPoints >= totalCost) {
        player.creditPoints -= totalCost;
        await player.save();

        logger.debug(`Population ${population.id}: consumed ${totalCost} CP worth of goods`);
      } else {
        // Not enough credits for consumption
        logger.warn(`Population ${population.id}: cannot afford consumption`);

        // Reduce satisfaction
        population.satisfactionLevel = Math.max(0, population.satisfactionLevel - 0.2);
        await population.save();
      }
    }

    logger.info('Population consumption completed');
  }

  /**
   * Market Update
   * Update all market prices based on supply/demand
   */
  private async marketUpdate() {
    logger.info('Updating market prices...');

    const marketPrices = await MarketPrice.find();

    for (const marketPrice of marketPrices) {
      await marketPrice.updatePrice();
    }

    logger.info(`Market prices updated: ${marketPrices.length} items`);
  }

  /**
   * Loan Interest
   * Process daily loan interest
   */
  private async loanInterest() {
    logger.info('Processing loan interest...');

    const activeLoans = await Loan.find({ where: { status: 'active' } });

    for (const loan of activeLoans) {
      await loan.addInterest(1);
      logger.debug(`Loan ${loan.loanId}: interest added`);
    }

    logger.info(`Loan interest completed for ${activeLoans.length} loans`);
  }

  /**
   * Loan Due Check
   * Check for overdue loans
   */
  private async loanDueCheck() {
    logger.info('Checking loan due dates...');

    const activeLoans = await Loan.find({ where: { status: 'active' } });

    for (const loan of activeLoans) {
      if (await loan.isOverdue()) {
        // Loan is overdue - mark as default
        await loan.markAsDefault();

        // Reduce player credit rating
        const player = await loan.player;
        const ratings = CONSTANTS.CREDIT_RATINGS;
        const currentIndex = ratings.indexOf(player.creditRating);

        if (currentIndex < ratings.length - 1) {
          player.creditRating = ratings[currentIndex + 1];
          await player.save();

          logger.warn(`Loan ${loan.loanId}: overdue, player ${player.agentName} rating reduced to ${player.creditRating}`);
        }
      }
    }

    logger.info(`Loan due check completed: ${activeLoans.length} loans checked`);
  }

  /**
   * Population Growth/Loss
   * Process population growth and loss
   */
  private async populationGrowthLoss() {
    logger.info('Processing population growth/loss...');

    const populations = await Population.find();

    for (const population of populations) {
      // Calculate growth
      const growth = Math.floor(population.totalPopulation * population.growthRate);

      // Calculate loss due to low satisfaction
      let loss = 0;
      if (population.satisfactionLevel < 0.2) {
        loss = Math.floor(population.totalPopulation * CONSTANTS.POPULATION_LOSS_RATE);
      }

      // Update population
      if (growth > 0 && loss === 0) {
        await population.growPopulation();
      } else if (loss > 0) {
        await population.losePopulation('loss');
      }

      // Update satisfaction
      await population.updateDailyConsumption();
      const newSatisfaction = await population.calculateSatisfaction();
      population.satisfactionLevel = newSatisfaction;
      await population.save();
    }

    logger.info('Population growth/loss completed');
  }

  /**
   * Building Completion
   * Process building construction and upgrades
   */
  private async buildingCompletion() {
    logger.info('Processing building completion...');

    const now = new Date();

    // Find buildings under construction
    const buildingsUnderConstruction = await Building.find({ 
      where: { 
        constructionEnd: null 
      } 
    });

    for (const building of buildingsUnderConstruction) {
      if (building.constructionEnd && building.constructionEnd <= now) {
        building.constructionStart = null;
        building.constructionEnd = null;
        await building.save();

        logger.info(`Building ${building.buildingId}: construction completed`);
      }
    }

    // Find buildings being upgraded
    const buildingsBeingUpgraded = await Building.find({ 
      where: { 
        upgradeEnd: null 
      } 
    });

    for (const building of buildingsBeingUpgraded) {
      if (building.upgradeEnd && building.upgradeEnd <= now) {
        const oldLevel = building.buildingLevel;
        building.buildingLevel += 1;
        building.upgradeStart = null;
        building.upgradeEnd = null;
        await building.save();

        logger.info(`Building ${building.buildingId}: upgraded to level ${building.buildingLevel}`);
      }
    }

    logger.info('Building completion processing completed');
  }

  /**
   * Auction Processing
   * Process bankruptcy auctions
   */
  private async auctionProcessing() {
    logger.info('Processing auctions...');

    // Find ended auctions
    const lands = await Land.find({ 
      where: { 
        auctionId: null, 
        auctionEnd: null 
      } 
    });

    logger.info(`Auction processing completed: ${lands.length} lands processed`);
  }

  /**
   * Leaderboard Update
   * Update leaderboard rankings
   */
  private async leaderboardUpdate() {
    logger.info('Updating leaderboard...');

    const players = await Player.find({ 
      order: { totalWealth: 'DESC' },
      take: 100
    });

    logger.info(`Leaderboard updated: ${players.length} players ranked`);

    // Cache leaderboard
    const leaderboardData = players.map((player, index) => ({
      rank: index + 1,
      agent_id: player.agentId,
      agent_name: player.agentName,
      total_wealth: player.totalWealth
    }));

    await cacheSet('leaderboard', JSON.stringify(leaderboardData), 3600); // Cache for 1 hour
  }

  /**
   * Send Webhook Notifications
   * Send webhook notifications to players
   */
  private async sendWebhookNotifications() {
    logger.info('Sending webhook notifications...');

    // This is where you would send notifications to players' webhook URLs
    // For now, we'll just log the notifications

    logger.info('Webhook notifications sent');
  }
}

// Create singleton instance
const gameLoop = new GameLoop();

export { gameLoop };
