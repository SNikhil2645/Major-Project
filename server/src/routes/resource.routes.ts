import { Router } from 'express';
import * as resourceController from '../controllers/resource.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, resourceController.list);
router.get('/all', authenticate, authorize('admin'), resourceController.listAll);

router.post('/', authenticate, authorize('admin'), resourceController.create);
router.delete('/:id', authenticate, authorize('admin'), resourceController.remove);

export default router;
