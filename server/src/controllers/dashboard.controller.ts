import { Request, Response } from 'express';
import * as dashboardService from '../services/dashboard.service';
import { asyncHandler } from '../utils/asyncHandler';

export const getStudentDashboard = asyncHandler(async (req: Request, res: Response) => {
  const stats = await dashboardService.getStudentDashboard(req.user!.userId);
  res.json({ success: true, data: stats });
});

export const getAdminStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await dashboardService.getAdminStats();
  res.json({ success: true, data: stats });
});
