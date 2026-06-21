import { Router } from 'express';
import * as resumeController from '../controllers/resume.controller';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.post('/upload', authenticate, upload.single('resume'), resumeController.uploadAndAnalyze);
router.get('/', authenticate, resumeController.getAnalyses);
router.get('/latest', authenticate, resumeController.getLatest);

export default router;
