import { Router } from 'express';
import * as codingController from '../controllers/coding.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createChallengeSchema, updateChallengeSchema, submitSolutionSchema } from '../validators/coding.validator';

const router = Router();

router.get('/', authenticate, codingController.list);
router.get('/all', authenticate, authorize('admin'), codingController.listAll);
router.get('/submissions', authenticate, codingController.getSubmissions);
router.get('/:id', authenticate, codingController.getById);
router.post('/:challengeId/submit', authenticate, validate(submitSolutionSchema), codingController.submit);

router.post('/', authenticate, authorize('admin'), validate(createChallengeSchema), codingController.create);
router.patch('/:id', authenticate, authorize('admin'), validate(updateChallengeSchema), codingController.update);
router.delete('/:id', authenticate, authorize('admin'), codingController.remove);

export default router;
