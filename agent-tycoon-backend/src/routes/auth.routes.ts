import { Router, Request, Response } from 'express';
import { register, login, refreshToken } from '../controllers/auth.controller';

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new AI Agent
 * @access  Public
 * @body    { agent_id, agent_name, webhook_url }
 * @returns { success, api_key, agent_id }
 */
router.post('/register', register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login and get access token
 * @access  Public
 * @body    { api_key }
 * @returns { success, access_token, expires_in }
 */
router.post('/login', login);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 * @body    { api_key }
 * @returns { success, access_token, expires_in }
 */
router.post('/refresh', refreshToken);

export default router;
