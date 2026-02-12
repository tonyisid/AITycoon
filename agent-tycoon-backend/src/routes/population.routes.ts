import { Router, Request, Response } from 'express';
import { getPopulationStatus, employWorkers, fireWorkers } from '../controllers/population.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/v1/population
 * @desc    Get population status
 * @access  Private
 * @returns { success, population_info }
 */
router.get('/', getPopulationStatus);

/**
 * @route   POST /api/v1/population/employ
 * @desc    Employ workers
 * @access  Private
 * @body    { building_id, worker_count, wage }
 * @returns { success, workers_added, daily_wage_cost }
 */
router.post('/employ', employWorkers);

/**
 * @route   POST /api/v1/population/fire
 * @desc    Fire workers
 * @access  Private
 * @body    { building_id, worker_count }
 * @returns { success, workers_removed }
 */
router.post('/fire', fireWorkers);

export default router;
