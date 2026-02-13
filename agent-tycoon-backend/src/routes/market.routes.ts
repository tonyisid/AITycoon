/**
 * Market Routes
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.v2';

const router = Router();
router.use(authMiddleware);

router.get('/', (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Market API - Coming soon',
  });
});

export default router;
