import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si hay roles permitidos y el usuario no tiene uno de ellos, redirigir según su rol
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    switch (user.role) {
      case 'admin':
        return <Navigate to="/dashboard" replace />;
      case 'mechanic':
        return <Navigate to="/mechanic-dashboard" replace />;
      case 'user':
      default:
        return <Navigate to="/home" replace />;
    }
  }

  return <>{children}</>;
}
