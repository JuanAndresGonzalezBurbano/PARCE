import { createContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/authService';
import { SESSION_EXPIRED_EVENT } from '@/services/apiClient';
import type { User, LoginRequest, RegisterRequest, UpdateProfileRequest } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  // Verificación de sesión al cargar la app (una sola vez, al montar). Es lo
  // único de lo que depende ProtectedRoute para decidir si mostrar el
  // spinner de carga inicial o el contenido — deliberadamente separado de
  // `isLoading` (ver más abajo).
  isCheckingAuth: boolean;
  // Petición auth en curso (login/registro/actualizar perfil) — indicador de
  // carga *local* para el formulario que la disparó. No debe usarse para
  // decidir si renderizar una ruta protegida completa: si ProtectedRoute
  // reaccionara a este flag, cada updateProfile()/login() posterior al login
  // inicial desmontaría y remontaría la página completa mientras está en
  // vuelo (perdiendo el estado local del formulario, ej. un formulario de
  // edición abierto con un error de validación mostrado).
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  // Errores de validación por campo devueltos por el backend (registro/perfil).
  // Los validadores de Auth envían un array de strings por campo — ver
  // utils/apiErrors.ts::fieldErrorFor() para el normalizador que usa la UI.
  fieldErrors: Record<string, string | string[]> | null;
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (data: RegisterRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  updateProfile: (data: UpdateProfileRequest) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | string[]> | null>(null);

  const isAuthenticated = user !== null;

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Sesión expirada/invalidada en medio del uso (401 fuera de los endpoints
  // públicos, ver apiClient.ts): limpiar el usuario. ProtectedRoute ya
  // redirige a /login declarativamente en cuanto isAuthenticated pasa a
  // false — no hace falta navegar manualmente ni duplicar esta lógica en
  // cada página.
  useEffect(() => {
    function handleSessionExpired() {
      setUser(null);
      // Limpiar también el error/fieldErrors del intento que disparó el 401 —
      // si no, el mensaje de esa petición (ej. "Authentication required")
      // queda pegado y se muestra en el formulario de login tras redirigir,
      // como si el login mismo hubiera fallado.
      setError(null);
      setFieldErrors(null);
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, []);

  async function checkAuth() {
    setIsCheckingAuth(true);
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
      setIsCheckingAuth(false);
    }
  }

  async function login(credentials: LoginRequest): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    setFieldErrors(null);

    try {
      const response = await authService.login(credentials);

      if (response.success) {
        setUser(response.data.user);
        setIsLoading(false);
        return true;
      } else {
        setError(response.error);
        setFieldErrors(response.fields ?? null);
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
    setFieldErrors(null);

    try {
      const response = await authService.register(data);

      if (response.success) {
        setUser(response.data.user);
        setIsLoading(false);
        return true;
      } else {
        setError(response.error);
        setFieldErrors(response.fields ?? null);
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

  async function updateProfile(data: UpdateProfileRequest): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    setFieldErrors(null);
    try {
      const response = await authService.updateProfile(data);
      if (response.success) {
        setUser(response.data);
        setIsLoading(false);
        return true;
      } else {
        setError(response.error);
        setFieldErrors(response.fields ?? null);
        setIsLoading(false);
        return false;
      }
    } catch {
      setError('No se pudo actualizar el perfil. Inténtalo de nuevo.');
      setIsLoading(false);
      return false;
    }
  }

  function clearError() {
    setError(null);
    setFieldErrors(null);
  }

  const value: AuthContextType = {
    user,
    isCheckingAuth,
    isLoading,
    isAuthenticated,
    error,
    fieldErrors,
    login,
    register,
    logout,
    checkAuth,
    clearError,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
