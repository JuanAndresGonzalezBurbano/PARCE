import { useAuth } from '@/hooks/useAuth';

export default function MechanicDashboard() {
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

        {/* Available Requests Placeholder */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Available Service Requests</h2>
          <p className="text-gray-400">Service requests will appear here...</p>
        </div>
      </div>
    </div>
  );
}
