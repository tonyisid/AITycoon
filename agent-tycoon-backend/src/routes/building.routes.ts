/**
 * Building Routes
 */

import { Router } from 'express';
import * as BuildingController from '../controllers/building.controller';
import { authMiddleware } from '../middleware/auth.middleware.v2';

const router = Router();
router.use(authMiddleware);

router.get('/', BuildingController.listBuildings);
router.post('/', BuildingController.createBuilding);
router.post('/:buildingId/upgrade', BuildingController.upgradeBuilding);
router.patch('/:buildingId/workers', BuildingController.updateWorkers);

export default router;
