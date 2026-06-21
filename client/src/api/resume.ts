import apiClient from './client';
import type { ApiResponse, IResumeAnalysis } from '@placementor/shared';

export const uploadResume = async (file: File) => {
  const formData = new FormData();
  formData.append('resume', file);
  const res = await apiClient.post<ApiResponse<IResumeAnalysis>>('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data!;
};

export const getResumeAnalyses = async () => {
  const res = await apiClient.get<ApiResponse<IResumeAnalysis[]>>('/resume');
  return res.data.data!;
};

export const getLatestResume = async () => {
  const res = await apiClient.get<ApiResponse<IResumeAnalysis | null>>('/resume/latest');
  return res.data.data;
};
