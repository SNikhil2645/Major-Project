import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import quizRoutes from './quiz.routes';
import codingRoutes from './coding.routes';
import resumeRoutes from './resume.routes';
import interviewRoutes from './interview.routes';
import readinessRoutes from './readiness.routes';
import resourceRoutes from './resource.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/quizzes', quizRoutes);
router.use('/coding', codingRoutes);
router.use('/resume', resumeRoutes);
router.use('/interview', interviewRoutes);
router.use('/readiness', readinessRoutes);
router.use('/resources', resourceRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
