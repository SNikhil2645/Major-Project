import apiClient from './client';
import type { ApiResponse, ICodingChallenge, ICodingSubmission } from '@placementor/shared';

export const listChallenges = async (params?: Record<string, string>) => {
  const res = await apiClient.get<ApiResponse<ICodingChallenge[]>>('/coding', { params });
  return { data: res.data.data!, meta: res.data.meta };
};

export const getChallengeById = async (id: string) => {
  const res = await apiClient.get<ApiResponse<ICodingChallenge>>(`/coding/${id}`);
  return res.data.data!;
};

export const submitSolution = async (challengeId: string, code: string, language: string) => {
  const res = await apiClient.post<ApiResponse<ICodingSubmission>>(`/coding/${challengeId}/submit`, { code, language });
  return res.data.data!;
};

export const getSubmissions = async () => {
  const res = await apiClient.get<ApiResponse<ICodingSubmission[]>>('/coding/submissions');
  return res.data.data!;
};
