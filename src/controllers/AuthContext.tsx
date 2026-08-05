import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, mapApiRoleToAppRole, getFullName, ApiUser } from '../services/authService';

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type UserRole = 'user' | 'mechanic' | 'admin';

interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;            // true mientras verifica sesión al arrancar
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  selectRole: (role: UserRole) => void;
  clearError: () => void;
  // Mantiene compatibilidad con LoginPage anterior (acepta rol/nombre mock)
  loginMock: (email: string, password: string, role?: UserRole, name?: string) => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const STORAGE_KEY = 'parce_user';

function getSavedUser(): User | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function apiUserToAppUser(apiUser: ApiUser): User {
  return {
    id: apiUser.id,
    name: getFullName(apiUser),
    email: apiUser.email,
    role: mapApiRoleToAppRole(apiUser.roles),
    avatar: apiUser.profile_picture_url ?? undefined,
  };
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getSavedUser());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Al montar: verificar si la cookie de sesión PHP sigue activa
  useEffect(() => {
    (async () => {
      try {
        const res = await authService.me();
        if (res.success && res.data) {
          const appUser = apiUserToAppUser(res.data);
          setUser(appUser);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(appUser));
        } else {
          // Sesión expirada o inválida — limpiar local
          setUser(null);
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        // Si el backend no está disponible, conservar sesión local
        // para no desloguear al usuario en modo offline
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // ── Login real via API PHP ─────────────────────────────────────────────────
  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    try {
      const res = await authService.login({ email, password });
      if (res.success && res.data?.user) {
        const appUser = apiUserToAppUser(res.data.user);
        setUser(appUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appUser));
        return true;
      } else {
        setError(res.error || res.message || 'Credenciales incorrectas');
        return false;
      }
    } catch {
      setError('Error de conexión con el servidor');
      return false;
    }
  };

  // ── Logout real via API PHP ────────────────────────────────────────────────
  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Si falla el logout en el servidor, limpiar igual en el cliente
    } finally {
      setUser(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // ── Mantiene compatibilidad: login mock para accesos de prueba locales ─────
  const loginMock = (email: string, _password: string, role?: UserRole, name?: string) => {
    const mockUser: User = {
      id: 0,
      name: name || 'Usuario',
      email,
      role: role || 'user',
    };
    setUser(mockUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
  };

  // ── Cambiar rol sin re-autenticar (RoleSelectionPage) ─────────────────────
  const selectRole = (role: UserRole) => {
    if (user) {
      const updated = { ...user, role };
      setUser(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        logout,
        selectRole,
        clearError,
        loginMock,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
