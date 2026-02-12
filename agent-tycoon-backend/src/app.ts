import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler.middleware';
import { rateLimiter } from './middleware/rateLimit.middleware';
import authRoutes from './routes/auth.routes';
import playerRoutes from './routes/player.routes';
import landRoutes from './routes/land.routes';
import buildingRoutes from './routes/building.routes';
import populationRoutes from './routes/population.routes';
import loanRoutes from './routes/loan.routes';
import marketRoutes from './routes/market.routes';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(rateLimiter);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/player', playerRoutes);
app.use('/api/v1/land', landRoutes);
app.use('/api/v1/building', buildingRoutes);
app.use('/api/v1/population', populationRoutes);
app.use('/api/v1/loan', loanRoutes);
app.use('/api/v1/market', marketRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`API Prefix: ${process.env.API_PREFIX || '/api/v1'}`);
});

export default app;
