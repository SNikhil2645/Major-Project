import apiClient from './client';
import type { ApiResponse, IMockInterview } from '@placementor/shared';

export const startInterview = async (role: string, totalQuestions = 5) => {
  const res = await apiClient.post<ApiResponse<IMockInterview>>('/interview/start', { role, totalQuestions });
  return res.data.data!;
};

export const submitAnswer = async (interviewId: string, answer: string) => {
  const res = await apiClient.post<ApiResponse<IMockInterview>>(`/interview/${interviewId}/answer`, { answer });
  return res.data.data!;
};

export const getCurrentQuestion = async (interviewId: string) => {
  const res = await apiClient.get<ApiResponse>(`/interview/${interviewId}/current`);
  return res.data.data!;
};

export const getInterviewById = async (id: string) => {
  const res = await apiClient.get<ApiResponse<IMockInterview>>(`/interview/${id}`);
  return res.data.data!;
};

export const getInterviews = async () => {
  const res = await apiClient.get<ApiResponse<IMockInterview[]>>('/interview');
  return res.data.data!;
};
