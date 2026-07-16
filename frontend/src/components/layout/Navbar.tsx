import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  if (!user) return null;

  const isMechanic = user.roles.includes('mechanic');
  const isCustomer = user.roles.includes('customer');
  const isAdmin = user.roles.includes('administrator') || user.roles.includes('super_admin');

  return (
    <nav className="bg-gray-900 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Navigation */}
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold text-white">P.A.R.C.E</h1>

            {/* Navigation Links */}
            <div className="flex items-center gap-4">
              <Link
                to={isAdmin ? '/admin/dashboard' : isMechanic ? '/mechanic/dashboard' : '/dashboard'}
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                Dashboard
              </Link>

              {isAdmin && (
                <>
                  <Link
                    to="/admin/pqr"
                    className="text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    PQR
                  </Link>
                  <Link
                    to="/admin/surveys"
                    className="text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    Encuestas
                  </Link>
                  <Link
                    to="/admin/ratings"
                    className="text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    Calificaciones
                  </Link>
                </>
              )}

              {isMechanic && (
                <>
                  <Link
                    to="/mechanic/available"
                    className="text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    Solicitudes Disponibles
                  </Link>
                  <Link
                    to="/mechanic/requests"
                    className="text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    Mis Solicitudes
                  </Link>
                </>
              )}

              {isCustomer && (
                <>
                  <Link
                    to="/vehicles"
                    className="text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    Mis Vehículos
                  </Link>
                  <Link
                    to="/requests"
                    className="text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    Solicitudes
                  </Link>
                </>
              )}

              <Link
                to="/profile"
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                Mi Perfil
              </Link>
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-4">
            <Link to="/profile" className="text-right hover:opacity-80 transition-opacity">
              <p className="text-sm font-medium text-white">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-400 capitalize">
                {user.roles.join(', ')}
              </p>
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
