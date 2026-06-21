import apiClient from './client';
import type { ApiResponse, IResource } from '@placementor/shared';

export const listResources = async (category?: string) => {
  const params: Record<string, string> = {};
  if (category) params.category = category;
  const res = await apiClient.get<ApiResponse<IResource[]>>('/resources', { params });
  return { data: res.data.data!, meta: res.data.meta };
};
