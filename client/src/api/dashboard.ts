import apiClient from './client';
import type { ApiResponse, DashboardStats, AdminStats } from '@placementor/shared';

export const getStudentDashboard = async () => {
  const res = await apiClient.get<ApiResponse<DashboardStats>>('/dashboard/student');
  return res.data.data!;
};

export const getAdminStats = async () => {
  const res = await apiClient.get<ApiResponse<AdminStats>>('/dashboard/admin');
  return res.data.data!;
};
