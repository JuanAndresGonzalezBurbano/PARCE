// Importa Navigate para redirigir al usuario a otra ruta
import { Navigate } from 'react-router-dom';
// Importa useEffect para ejecutar código cuando el componente se monta
import { useEffect } from 'react';
// Importa el hook de autenticación y el tipo UserRole
import { useAuth, UserRole } from '../../controllers/AuthContext';

// Define las propiedades del componente
interface ProtectedRouteProps {
  children: React.ReactNode; // El contenido a proteger
  allowedRoles?: UserRole[]; // Los roles que tienen acceso a esta ruta
}

// Componente que protege rutas — si el usuario no tiene acceso, lo redirige
export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  // Obtiene el usuario y si está autenticado del contexto
  const { user, isAuthenticated } = useAuth();

  // Cuando se monta una ruta protegida, prevenir que se vuelva atrás
  useEffect(() => {
    if (isAuthenticated) {
      // Agregar una entrada al historial para que el botón atrás no funcione correctamente
      window.history.pushState(null, '', window.location.href);
      
      // Escuchar intentos de volver atrás
      const handlePopState = (e: PopStateEvent) => {
        e.preventDefault();
        // Mantener al usuario en la página actual
        window.history.pushState(null, '', window.location.href);
      };
      
      window.addEventListener('popstate', handlePopState);
      
      // Limpiar el listener cuando el componente se desmonta
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isAuthenticated]);

  // Si el usuario no está autenticado, lo manda al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si la ruta tiene roles permitidos y el usuario no tiene ninguno de esos roles
  // lo redirige a la página principal de su propio rol
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    switch (user.role) {
      case 'admin':
        return <Navigate to="/dashboard" replace />;      // Admin va al dashboard
      case 'mechanic':
        return <Navigate to="/mechanic-home" replace />;
      case 'user':
      default:
        // RAMA: Soto - Usuario va a /home (su home autenticado) en vez de /services
        return <Navigate to="/home" replace />;
    }
  }

  // Si el usuario tiene acceso, renderiza el contenido protegido
  return <>{children}</>;
}
