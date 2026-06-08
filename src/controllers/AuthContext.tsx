// Importa las funciones necesarias de React para crear contextos y manejar estado
import { createContext, useContext, useState, ReactNode } from 'react';

// Define los roles posibles en la plataforma
export type UserRole = 'user' | 'mechanic' | 'admin';

// Define la estructura de un usuario autenticado
interface User {
  name: string;       // Nombre del usuario
  email: string;      // Correo electrónico
  role: UserRole;     // Rol actual del usuario
  avatar?: string;    // URL del avatar (opcional)
}

// Define las funciones y datos que expone el contexto de autenticación
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role?: UserRole, name?: string) => void;
  logout: () => void;
  selectRole: (role: UserRole) => void;
  isAuthenticated: boolean;
}

// Crea el contexto con valor inicial undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// RAMA: Soto - Clave usada para guardar y recuperar la sesión en localStorage
const STORAGE_KEY = 'parce_user';

// Función que intenta recuperar el usuario guardado en localStorage al recargar la página
function getSavedUser(): User | null {
  try {
    // Lee el valor guardado en localStorage con la clave definida
    const saved = localStorage.getItem(STORAGE_KEY);
    // Si existe, lo convierte de JSON a objeto. Si no, retorna null
    return saved ? JSON.parse(saved) : null;
  } catch {
    // Si hay error (ej: JSON inválido), retorna null sin romper la app
    return null;
  }
}

// Proveedor del contexto — envuelve la app y da acceso a la autenticación
export function AuthProvider({ children }: { children: ReactNode }) {
  // RAMA: Soto - Inicializa el estado con el usuario guardado para persistir sesión al recargar
  const [user, setUser] = useState<User | null>(getSavedUser());

  // Función de login: acepta rol y nombre opcionales para accesos directos por rol
  const login = (email: string, _password: string, role?: UserRole, name?: string) => {
    const newUser: User = {
      name: name || 'Juan Gustavo',
      email: email,
      role: role || 'user',
    };
    setUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
  };

  // Función de logout: limpia el usuario del estado y del localStorage
  const logout = () => {
    setUser(null); // Elimina el usuario del estado de React
    // RAMA: Soto - Al cerrar sesión también limpia el localStorage para no persistir más
    localStorage.removeItem(STORAGE_KEY);
  };

  // Función para asignar el rol elegido en RoleSelectionPage al usuario actual
  const selectRole = (role: UserRole) => {
    if (user) {
      const updated = { ...user, role }; // Crea una copia del usuario con el nuevo rol
      setUser(updated); // Actualiza el estado de React
      // RAMA: Soto - Actualiza también el localStorage para que el rol persista al recargar
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  };

  return (
    // Provee el contexto con todos los valores y funciones a los componentes hijos
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        selectRole,
        isAuthenticated: !!user, // Convierte el usuario a boolean: true si existe, false si es null
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar el contexto de autenticación fácilmente en cualquier componente
export function useAuth() {
  const context = useContext(AuthContext);
  // Si se usa fuera del AuthProvider, lanza un error para facilitar el debugging
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
