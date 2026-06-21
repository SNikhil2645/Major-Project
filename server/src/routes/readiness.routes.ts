import { Router } from 'express';
import * as readinessController from '../controllers/readiness.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, readinessController.getReadiness);
router.post('/recalculate', authenticate, readinessController.recalculate);

export default router;
