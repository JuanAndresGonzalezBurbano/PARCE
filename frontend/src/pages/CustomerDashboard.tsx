import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

export default function CustomerDashboard() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome, {user.firstName} {user.lastName}
          </h1>
          <p className="text-gray-400">{user.email}</p>
          <p className="text-sm text-gray-500 mt-2 capitalize">
            Role: {user.roles.join(', ')}
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vehicles Card */}
          <Link
            to="/vehicles"
            className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:bg-gray-750 transition-colors"
          >
            <h2 className="text-xl font-bold text-white mb-2">My Vehicles</h2>
            <p className="text-gray-400">Manage your registered vehicles</p>
          </Link>

          {/* Service Requests Card */}
          <Link
            to="/requests"
            className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:bg-gray-750 transition-colors"
          >
            <h2 className="text-xl font-bold text-white mb-2">Service Requests</h2>
            <p className="text-gray-400">View and create service requests</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
