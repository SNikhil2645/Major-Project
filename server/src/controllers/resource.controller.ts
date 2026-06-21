import { Request, Response } from 'express';
import * as resourceService from '../services/resource.service';
import { asyncHandler } from '../utils/asyncHandler';

export const create = asyncHandler(async (req: Request, res: Response) => {
  const resource = await resourceService.createResource({ ...req.body, uploadedBy: req.user!.userId });
  res.status(201).json({ success: true, data: resource });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await resourceService.deleteResource(req.params.id);
  res.json({ success: true, data: { message: 'Resource deleted' } });
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const category = req.query.category as string | undefined;
  const result = await resourceService.listResources(category, page, limit);
  res.json({ success: true, data: result.resources, meta: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages } });
});

export const listAll = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const result = await resourceService.listAllResources({}, page, limit);
  res.json({ success: true, data: result.resources, meta: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages } });
});
