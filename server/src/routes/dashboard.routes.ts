import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/student', authenticate, dashboardController.getStudentDashboard);
router.get('/admin', authenticate, authorize('admin'), dashboardController.getAdminStats);

export default router;
