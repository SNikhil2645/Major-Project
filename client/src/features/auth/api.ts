import apiClient from '../../api/client';
import type { ApiResponse, AuthResponse } from '@placementor/shared';

export async function loginApi(email: string, password: string) {
  const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', { email, password });
  return response.data.data!;
}

export async function registerApi(name: string, email: string, password: string) {
  const response = await apiClient.post<ApiResponse<{ user: AuthResponse['user'] }>>('/auth/register', {
    name,
    email,
    password,
  });
  return response.data.data!;
}

export async function forgotPasswordApi(email: string) {
  await apiClient.post('/auth/forgot-password', { email });
}

export async function resetPasswordApi(token: string, password: string) {
  await apiClient.post('/auth/reset-password', { token, password });
}
