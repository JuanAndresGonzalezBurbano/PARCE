import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: string | string[];
}

export default function ProtectedRoute({ children, requireRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role if required
  if (requireRole && user) {
    const requiredRoles = Array.isArray(requireRole) ? requireRole : [requireRole];
    const hasRequiredRole = requiredRoles.some(role => user.roles.includes(role));

    if (!hasRequiredRole) {
      // User doesn't have required role - redirect to appropriate dashboard
      if (user.roles.includes('administrator') || user.roles.includes('super_admin')) {
        return <Navigate to="/admin/dashboard" replace />;
      }
      if (user.roles.includes('mechanic')) {
        return <Navigate to="/mechanic/dashboard" replace />;
      }
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}
