import { createContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/authService';
import type { User, LoginRequest, RegisterRequest } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (data: RegisterRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = user !== null;

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    setIsLoading(true);
    try {
      const response = await authService.me();
      
      if (response.success) {
        setUser(response.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(credentials: LoginRequest): Promise<boolean> {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(credentials);

      if (response.success) {
        setUser(response.data.user);
        setIsLoading(false);
        return true;
      } else {
        setError(response.error);
        setIsLoading(false);
        return false;
      }
    } catch {
      setError('Login failed. Please try again.');
      setIsLoading(false);
      return false;
    }
  }

  async function register(data: RegisterRequest): Promise<boolean> {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.register(data);

      if (response.success) {
        setUser(response.data.user);
        setIsLoading(false);
        return true;
      } else {
        setError(response.error);
        setIsLoading(false);
        return false;
      }
    } catch {
      setError('Registration failed. Please try again.');
      setIsLoading(false);
      return false;
    }
  }

  async function logout() {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  }

  function clearError() {
    setError(null);
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    error,
    login,
    register,
    logout,
    checkAuth,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
