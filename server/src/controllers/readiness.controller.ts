import { Request, Response } from 'express';
import * as readinessService from '../services/readiness.service';
import { asyncHandler } from '../utils/asyncHandler';

export const getReadiness = asyncHandler(async (req: Request, res: Response) => {
  const score = await readinessService.getReadiness(req.user!.userId);
  res.json({ success: true, data: score });
});

export const recalculate = asyncHandler(async (req: Request, res: Response) => {
  const score = await readinessService.calculateReadiness(req.user!.userId);
  res.json({ success: true, data: score });
});
