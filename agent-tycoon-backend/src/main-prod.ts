/**
 * Main Application Entry - Production Version
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { logger } from './utils/logger';
import * as dotenv from 'dotenv';

// Routes
import authRoutes from './routes/auth.routes.v2';
import landRoutes from './routes/land.routes';
import buildingRoutes from './routes/building.routes';
import populationRoutes from './routes/population.routes';
import loanRoutes from './routes/loan.routes';
import marketRoutes from './routes/market.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (message: string) => logger.info(message.trim()) } }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    database: 'connected',
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/lands', landRoutes);
app.use('/api/v1/buildings', buildingRoutes);
app.use('/api/v1/population', populationRoutes);
app.use('/api/v1/loans', loanRoutes);
app.use('/api/v1/market', marketRoutes);

// API status endpoint
app.get('/api/v1/status', (req, res) => {
  res.json({
    message: 'AI Agent Tycoon API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      status: '/api/v1/status',
      auth: {
        register: 'POST /api/v1/auth/register',
        login: 'POST /api/v1/auth/login',
        me: 'GET /api/v1/auth/me',
        webhook: 'PATCH /api/v1/auth/webhook',
      },
      lands: {
        list: 'GET /api/v1/lands',
        details: 'GET /api/v1/lands/:landId',
        purchase: 'POST /api/v1/lands/:landId/purchase',
        auction: 'POST /api/v1/lands/:landId/auction',
      },
      buildings: {
        list: 'GET /api/v1/buildings',
        create: 'POST /api/v1/buildings',
        upgrade: 'POST /api/v1/buildings/:buildingId/upgrade',
        workers: 'PATCH /api/v1/buildings/:buildingId/workers',
      },
      population: {
        get: 'GET /api/v1/population',
        employ: 'POST /api/v1/population/employ',
        satisfaction: 'PATCH /api/v1/population/satisfaction',
      },
      loans: {
        list: 'GET /api/v1/loans',
      },
      market: {
        prices: 'GET /api/v1/market/prices',
      },
    },
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'AI Agent Tycoon: Economic Battle',
    version: '1.0.0',
    docs: '/api/v1/status',
    health: '/health',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path,
    availableEndpoints: [
      '/health',
      '/api/v1/status',
      '/api/v1/auth/register',
      '/api/v1/auth/login',
      '/api/v1/auth/me',
    ],
  });
});

// Error handler
app.use((err: any, req, res, next) => {
  logger.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    path: req.path,
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Server started on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🗄️  Database: agent_tycoon`);
  logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
  logger.info(`📖 API status: http://localhost:${PORT}/api/v1/status`);
  logger.info(`🔐 Auth: http://localhost:${PORT}/api/v1/auth/login`);
});

export default app;
