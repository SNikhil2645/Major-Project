import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';
import { Spinner } from '../components/ui/Spinner';
import type { ApiResponse, IUserPublic } from '@placementor/shared';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const setUser = useAuthStore((s) => s.setUser);
  const [loading, setLoading] = useState(!user && isAuthenticated);

  useEffect(() => {
    if (!user && isAuthenticated) {
      apiClient
        .get<ApiResponse<IUserPublic>>('/users/me')
        .then((res) => setUser(res.data.data!))
        .catch(() => {
          useAuthStore.getState().logout();
        })
        .finally(() => setLoading(false));
    }
  }, [user, isAuthenticated, setUser]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">403</h1>
        <p className="text-gray-500">You don't have permission to access this page.</p>
      </div>
    );
  }

  return <Outlet />;
}
