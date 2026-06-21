import { Request, Response } from 'express';
import * as interviewService from '../services/interview.service';
import * as activityService from '../services/activity.service';
import { asyncHandler } from '../utils/asyncHandler';

export const start = asyncHandler(async (req: Request, res: Response) => {
  const { role, totalQuestions } = req.body;
  const interview = await interviewService.startInterview(req.user!.userId, role, totalQuestions || 5);
  res.status(201).json({ success: true, data: interview });
});

export const submitAnswer = asyncHandler(async (req: Request, res: Response) => {
  const { answer } = req.body;
  const interview = await interviewService.submitAnswer(req.params.id, req.user!.userId, answer);

  if (interview.status === 'completed') {
    await activityService.logActivity(req.user!.userId, 'interview_completed', { interviewId: req.params.id, score: interview.overallScore });
  }

  res.json({ success: true, data: interview });
});

export const getCurrent = asyncHandler(async (req: Request, res: Response) => {
  const result = await interviewService.getCurrentQuestion(req.params.id, req.user!.userId);
  res.json({ success: true, data: result });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const interview = await interviewService.getInterviewById(req.params.id, req.user!.userId);
  res.json({ success: true, data: interview });
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const interviews = await interviewService.getInterviewsByUser(req.user!.userId);
  res.json({ success: true, data: interviews });
});
