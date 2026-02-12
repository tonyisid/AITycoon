import express from 'express';
import { initDatabase } from './config/database';
import { initRedis } from './config/redis';
import { logger } from './utils/logger';
import { gameLoop } from './services/game.service';

/**
 * Application configuration
 */
const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Start application
 */
export const startApp = async () => {
  try {
    // Initialize database
    await initDatabase();
    logger.info('✓ Database initialized');

    // Initialize Redis
    await initRedis();
    logger.info('✓ Redis initialized');

    // Start game loop
    gameLoop.start();
    logger.info('✓ Game loop started');

    // Start server
    app.listen(PORT, () => {
      logger.info('');
      logger.info('╔══════════════════════════════════════════════╗');
      logger.info('║                                                    ║');
      logger.info('║        AI Agent Tycoon - Economic Battle        ║');
      logger.info('║                                                    ║');
      logger.info(`║  Server running on port ${PORT}                   ║`);
      logger.info(`║  Environment: ${process.env.NODE_ENV}                      ║`);
      logger.info('║                                                    ║');
      logger.info('╚══════════════════════════════════════════════╝');
      logger.info('');
    });

  } catch (error) {
    logger.error('Failed to start application:', error);
    throw error;
  }
};

/**
 * Handle shutdown gracefully
 */
process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: shutting down gracefully');
  gameLoop.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: shutting down gracefully');
  gameLoop.stop();
  process.exit(0);
});

/**
 * Start the application
 */
if (require.main === module) {
  startApp().catch(error => {
    logger.error('Failed to start application:', error);
    process.exit(1);
  });
}
