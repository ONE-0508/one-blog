import { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { UserProfile } from '../types/auth';
import { getCurrentUser, logout as apiLogout } from '../api/auth';
import { getAccessToken } from '../api/authStorage';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (userData: UserProfile) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 检查用户是否已认证
  const checkAuth = useCallback(async (): Promise<boolean> => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return false;
    }

    try {
      setIsLoading(true);
      const response = await getCurrentUser();
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        return true;
      } else {
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 登录
  const login = useCallback((userData: UserProfile) => {
    setUser(userData);
  }, []);

  // 登出
  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      setUser(null);
    }
  }, []);

  // 初始化时检查认证状态
  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  const value: AuthContextType = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      checkAuth,
    }),
    [user, isLoading, login, logout, checkAuth]
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export { AuthContext };
