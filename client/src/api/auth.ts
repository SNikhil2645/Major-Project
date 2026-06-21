import apiClient from './client';
import type { ApiResponse, AuthResponse, RegisterRequest, LoginRequest } from '@placementor/shared';

export const loginApi = async (data: LoginRequest) => {
  const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
  return res.data.data!;
};

export const registerApi = async (data: RegisterRequest) => {
  const res = await apiClient.post<ApiResponse>('/auth/register', data);
  return res.data;
};

export const forgotPasswordApi = async (email: string) => {
  const res = await apiClient.post<ApiResponse>('/auth/forgot-password', { email });
  return res.data;
};

export const resetPasswordApi = async (token: string, password: string) => {
  const res = await apiClient.post<ApiResponse>('/auth/reset-password', { token, password });
  return res.data;
};
