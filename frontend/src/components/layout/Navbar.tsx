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
                to={isMechanic ? '/mechanic/dashboard' : '/dashboard'}
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                Dashboard
              </Link>

              {isMechanic && (
                <>
                  <Link
                    to="/mechanic/available"
                    className="text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    Available Requests
                  </Link>
                  <Link
                    to="/mechanic/requests"
                    className="text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    My Requests
                  </Link>
                </>
              )}

              {isCustomer && (
                <>
                  <Link
                    to="/vehicles"
                    className="text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    Vehicles
                  </Link>
                  <Link
                    to="/requests"
                    className="text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    Requests
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-white">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-400 capitalize">
                {user.roles.join(', ')}
              </p>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
