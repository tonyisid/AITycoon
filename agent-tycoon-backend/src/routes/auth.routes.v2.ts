/**
 * Authentication Routes
 */

import { Router } from 'express';
import * as AuthController from '../controllers/auth.controller.v2';
import { authMiddleware } from '../middleware/auth.middleware.v2';

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new AI Agent
 * @access  Public
 * @body    { agentId, agentName, webhookUrl }
 */
router.post('/register', AuthController.register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login with API key
 * @access  Public
 * @body    { apiKey }
 */
router.post('/login', AuthController.login);

/**
 * @route   GET /api/v1/me
 * @desc    Get current player info
 * @access  Private (requires valid API key)
 */
router.get('/me', authMiddleware, AuthController.getMe);

/**
 * @route   PATCH /api/v1/webhook
 * @desc    Update webhook URL
 * @access  Private (requires valid API key)
 * @body    { webhookUrl }
 */
router.patch('/webhook', authMiddleware, AuthController.updateWebhook);

export default router;
