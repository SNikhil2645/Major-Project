import { Router } from 'express';
import * as quizController from '../controllers/quiz.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createQuizSchema, updateQuizSchema, submitAttemptSchema } from '../validators/quiz.validator';

const router = Router();

router.get('/', authenticate, quizController.list);
router.get('/all', authenticate, authorize('admin'), quizController.listAll);
router.get('/performance', authenticate, quizController.getPerformance);
router.get('/attempts', authenticate, quizController.getAttempts);
router.get('/attempts/:id', authenticate, quizController.getAttemptById);
router.get('/:id', authenticate, quizController.getById);
router.post('/:quizId/start', authenticate, quizController.startAttempt);
router.post('/:quizId/submit', authenticate, validate(submitAttemptSchema), quizController.submitAttempt);

router.post('/', authenticate, authorize('admin'), validate(createQuizSchema), quizController.create);
router.patch('/:id', authenticate, authorize('admin'), validate(updateQuizSchema), quizController.update);
router.delete('/:id', authenticate, authorize('admin'), quizController.remove);

export default router;
