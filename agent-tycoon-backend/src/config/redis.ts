import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';

/**
 * Redis client configuration
 */
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisClient: RedisClientType = createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries === 3) {
        logger.error('Redis reconnection failed after 3 attempts');
        return new Error('Redis reconnection failed');
      }
      return Math.min(retries + 1, 3000);
    }
  }
});

/**
 * Initialize Redis connection
 */
export const initRedis = async () => {
  try {
    await redisClient.connect();
    logger.info('Redis connected successfully');
    logger.info(`Redis URL: ${redisUrl}`);
    return redisClient;
  } catch (error) {
    logger.error('Redis connection error:', error);
    throw error;
  }
};

/**
 * Close Redis connection
 */
export const closeRedis = async () => {
  try {
    await redisClient.quit();
    logger.info('Redis connection closed');
  } catch (error) {
    logger.error('Error closing Redis:', error);
    throw error;
  }
};

/**
 * Cache helper functions
 */
export const cacheGet = async (key: string): Promise<string | null> => {
  try {
    const data = await redisClient.get(key);
    return data;
  } catch (error) {
    logger.error('Redis GET error:', error);
    return null;
  }
};

export const cacheSet = async (key: string, value: string, expirySeconds: number = 3600): Promise<boolean> => {
  try {
    await redisClient.setEx(key, expirySeconds, value);
    return true;
  } catch (error) {
    logger.error('Redis SET error:', error);
    return false;
  }
};

export const cacheDel = async (key: string): Promise<boolean> => {
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    logger.error('Redis DEL error:', error);
    return false;
  }
};
