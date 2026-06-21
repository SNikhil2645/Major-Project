import { Resource } from '../models/Resource';
import { AppError } from '../utils/AppError';

export async function createResource(data: Record<string, unknown>) {
  return Resource.create(data);
}

export async function deleteResource(id: string) {
  const resource = await Resource.findByIdAndDelete(id);
  if (!resource) throw new AppError('Resource not found', 404);
  return resource;
}

export async function listResources(category?: string, page = 1, limit = 20) {
  const filter: Record<string, unknown> = { isActive: true };
  if (category) filter.category = category;

  const [resources, total] = await Promise.all([
    Resource.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Resource.countDocuments(filter),
  ]);

  return { resources, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function listAllResources(filter: Record<string, unknown> = {}, page = 1, limit = 50) {
  const [resources, total] = await Promise.all([
    Resource.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Resource.countDocuments(filter),
  ]);

  return { resources, total, page, limit, totalPages: Math.ceil(total / limit) };
}
