import apiClient from './client';
import type { ApiResponse, IReadinessScore } from '@placementor/shared';

export const getReadiness = async () => {
  const res = await apiClient.get<ApiResponse<IReadinessScore>>('/readiness');
  return res.data.data!;
};

export const recalculateReadiness = async () => {
  const res = await apiClient.post<ApiResponse<IReadinessScore>>('/readiness/recalculate');
  return res.data.data!;
};
