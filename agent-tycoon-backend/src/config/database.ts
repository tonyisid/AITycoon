import { createConnection } from 'typeorm';
import { Player } from '../models/Player';
import { Land } from '../models/Land';
import { Building } from '../models/Building';
import { Population } from '../models/Population';
import { Loan } from '../models/Loan';
import { MarketPrice } from '../models/MarketPrice';
import { logger } from '../utils/logger';

/**
 * Database configuration
 */
export const databaseConfig = {
  type: process.env.DB_TYPE || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'agent_tycoon',
  synchronize: process.env.NODE_ENV === 'development',
  logging: true,
  entities: [Player, Land, Building, Population, Loan, MarketPrice]
};

/**
 * Initialize database connection
 */
export const initDatabase = async () => {
  try {
    const connection = await createConnection(databaseConfig);
    
    logger.info('Database connected successfully');
    logger.info(`Database: ${process.env.DB_NAME}`);
    logger.info(`Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);

    return connection;
  } catch (error) {
    logger.error('Database connection error:', error);
    throw error;
  }
};

/**
 * Close database connection
 */
export const closeDatabase = async () => {
  try {
    const connection = await createConnection(databaseConfig);
    await connection.close();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database:', error);
    throw error;
  }
};
