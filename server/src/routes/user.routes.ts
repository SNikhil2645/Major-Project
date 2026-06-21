import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { upload } from '../middleware/upload';
import { updateProfileSchema } from '../validators/auth.validator';

const router = Router();

router.get('/me', authenticate, userController.getProfile);
router.patch('/me', authenticate, validate(updateProfileSchema), userController.updateProfile);
router.post('/me/avatar', authenticate, upload.single('avatar'), userController.uploadAvatar);

router.get('/', authenticate, authorize('admin'), userController.listUsers);
router.get('/:id', authenticate, authorize('admin'), userController.getUserById);
router.patch('/:id/toggle-status', authenticate, authorize('admin'), userController.toggleUserStatus);

export default router;
