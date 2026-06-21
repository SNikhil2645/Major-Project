import { Request, Response } from 'express';
import * as resumeService from '../services/resume.service';
import * as activityService from '../services/activity.service';
import * as readinessService from '../services/readiness.service';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';

export const uploadAndAnalyze = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw new AppError('No file uploaded', 400);

  let extractedText = '';

  try {
    if (req.file.mimetype === 'application/pdf') {
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(req.file.buffer || req.file.path);
      extractedText = data.text;
    } else if (req.file.mimetype.includes('wordprocessingml')) {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ path: req.file.path });
      extractedText = result.value;
    } else {
      extractedText = `Resume file: ${req.file.originalname} (${req.file.mimetype})`;
    }
  } catch {
    extractedText = `Could not extract text from ${req.file.originalname}`;
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  const analysis = await resumeService.analyzeResume(
    req.user!.userId,
    req.file.originalname,
    fileUrl,
    extractedText,
  );

  await activityService.logActivity(req.user!.userId, 'resume_uploaded', { score: analysis.score });
  await readinessService.calculateReadiness(req.user!.userId);

  res.status(201).json({ success: true, data: analysis });
});

export const getAnalyses = asyncHandler(async (req: Request, res: Response) => {
  const analyses = await resumeService.getResumeAnalysesByUser(req.user!.userId);
  res.json({ success: true, data: analyses });
});

export const getLatest = asyncHandler(async (req: Request, res: Response) => {
  const analysis = await resumeService.getLatestResumeAnalysis(req.user!.userId);
  res.json({ success: true, data: analysis });
});
