import { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'user' | 'mechanic' | 'admin';

interface User {
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => void;
  logout: () => void;
  selectRole: (role: UserRole) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// RAMA: Soto - Clave para guardar la sesión en localStorage
const STORAGE_KEY = 'parce_user';

// Recupera el usuario guardado al recargar la página
function getSavedUser(): User | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // RAMA: Soto - Inicializa el estado desde localStorage para persistir la sesión
  const [user, setUser] = useState<User | null>(getSavedUser());

  const login = (email: string, _password: string) => {
    const newUser: User = {
      name: 'Juan Gustavo',
      email: email,
      role: 'user', // Rol por defecto, se cambia en selectRole
    };
    setUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    // RAMA: Soto - Al cerrar sesión limpia el localStorage
    localStorage.removeItem(STORAGE_KEY);
  };

  const selectRole = (role: UserRole) => {
    if (user) {
      const updated = { ...user, role };
      setUser(updated);
      // RAMA: Soto - Actualiza el rol guardado en localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        selectRole,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
