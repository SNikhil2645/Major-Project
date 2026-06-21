import apiClient from './client';
import type { ApiResponse, IQuiz, IAttempt } from '@placementor/shared';

export const listQuizzes = async (params?: Record<string, string>) => {
  const res = await apiClient.get<ApiResponse<IQuiz[]>>('/quizzes', { params });
  return { data: res.data.data!, meta: res.data.meta };
};

export const getQuizById = async (id: string) => {
  const res = await apiClient.get<ApiResponse<IQuiz>>(`/quizzes/${id}`);
  return res.data.data!;
};

export const startQuizAttempt = async (quizId: string) => {
  const res = await apiClient.post<ApiResponse<{ quiz: IQuiz; startedAt: string }>>(`/quizzes/${quizId}/start`);
  return res.data.data!;
};

export const submitQuizAttempt = async (quizId: string, answers: { questionIndex: number; selectedAnswer: number }[], timeTaken: number) => {
  const res = await apiClient.post<ApiResponse<IAttempt>>(`/quizzes/${quizId}/submit`, { answers, timeTaken });
  return res.data.data!;
};

export const getAttempts = async () => {
  const res = await apiClient.get<ApiResponse<IAttempt[]>>('/quizzes/attempts');
  return res.data.data!;
};

export const getAttemptById = async (id: string) => {
  const res = await apiClient.get<ApiResponse<IAttempt>>(`/quizzes/attempts/${id}`);
  return res.data.data!;
};

export const getPerformance = async () => {
  const res = await apiClient.get<ApiResponse>('/quizzes/performance');
  return res.data.data!;
};
