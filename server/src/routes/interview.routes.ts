import { Router } from 'express';
import * as interviewController from '../controllers/interview.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { startInterviewSchema, submitAnswerSchema } from '../validators/interview.validator';

const router = Router();

router.get('/', authenticate, interviewController.list);
router.get('/:id', authenticate, interviewController.getById);
router.get('/:id/current', authenticate, interviewController.getCurrent);
router.post('/start', authenticate, validate(startInterviewSchema), interviewController.start);
router.post('/:id/answer', authenticate, validate(submitAnswerSchema), interviewController.submitAnswer);

export default router;
