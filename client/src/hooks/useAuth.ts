import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const { user, isAuthenticated, setAuth, setUser, logout } = useAuthStore();

  return {
    user,
    isAuthenticated,
    isAdmin: user?.role === 'admin',
    setAuth,
    setUser,
    logout,
  };
}
