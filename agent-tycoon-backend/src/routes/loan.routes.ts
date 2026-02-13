/**
 * Loan Routes
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.v2';

const router = Router();
router.use(authMiddleware);

// TODO: Add loan controller and routes
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Loan API - Coming soon',
    data: [],
  });
});

export default router;
