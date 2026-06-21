import { Request, Response } from 'express';
import * as codingService from '../services/coding.service';
import * as activityService from '../services/activity.service';
import * as readinessService from '../services/readiness.service';
import { asyncHandler } from '../utils/asyncHandler';

export const create = asyncHandler(async (req: Request, res: Response) => {
  const challenge = await codingService.createChallenge({ ...req.body, createdBy: req.user!.userId });
  res.status(201).json({ success: true, data: challenge });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const challenge = await codingService.updateChallenge(req.params.id, req.body);
  res.json({ success: true, data: challenge });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await codingService.deleteChallenge(req.params.id);
  res.json({ success: true, data: { message: 'Challenge deleted' } });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const includeAll = req.user?.role === 'admin';
  const challenge = await codingService.getChallengeById(req.params.id, includeAll);
  res.json({ success: true, data: challenge });
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const filter: Record<string, unknown> = {};
  if (req.query.difficulty) filter.difficulty = req.query.difficulty;
  if (req.query.tag) filter.tags = req.query.tag;
  const result = await codingService.listChallenges(filter, page, limit);
  res.json({ success: true, data: result.challenges, meta: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages } });
});

export const listAll = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const result = await codingService.listAllChallenges({}, page, limit);
  res.json({ success: true, data: result.challenges, meta: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages } });
});

export const submit = asyncHandler(async (req: Request, res: Response) => {
  const { code, language } = req.body;
  const submission = await codingService.submitSolution(req.user!.userId, req.params.challengeId, code, language);
  await activityService.logActivity(req.user!.userId, 'coding_submitted', { challengeId: req.params.challengeId, status: submission.status });
  await readinessService.calculateReadiness(req.user!.userId);
  res.status(201).json({ success: true, data: submission });
});

export const getSubmissions = asyncHandler(async (req: Request, res: Response) => {
  const submissions = await codingService.getSubmissionsByUser(req.user!.userId);
  res.json({ success: true, data: submissions });
});
