import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRequests } from '@/hooks/useRequests';

export default function AvailableRequestsPage() {
  const navigate = useNavigate();
  const { requests, isLoading, error, loadAvailableRequests, acceptRequest } = useRequests();

  useEffect(() => {
    // Use default NYC coordinates
    loadAvailableRequests(40.7128, -74.0060);
  }, []);

  async function handleAccept(id: number) {
    if (window.confirm('Accept this service request?')) {
      const success = await acceptRequest(id);
      if (success) {
        navigate('/mechanic/requests');
      }
    }
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'urgent': return 'bg-red-900/50 border-red-700 text-red-200';
      case 'normal': return 'bg-blue-900/50 border-blue-700 text-blue-200';
      case 'low': return 'bg-gray-700 border-gray-600 text-gray-300';
      default: return 'bg-gray-700 border-gray-600 text-gray-300';
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Available Requests</h1>
          <Link
            to="/mechanic/dashboard"
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <p className="text-gray-400">Loading available requests...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && requests.length === 0 && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <p className="text-gray-400">No available service requests in your area.</p>
          </div>
        )}

        {/* Requests List */}
        {!isLoading && requests.length > 0 && (
          <div className="space-y-4">
            <p className="text-gray-400 mb-4">{requests.length} available request(s)</p>

            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-white capitalize">
                        {request.emergencyType.replace('_', ' ')}
                      </h3>
                      <span className={`px-2 py-1 border rounded text-xs ${getPriorityColor(request.priority)}`}>
                        {request.priority}
                      </span>
                    </div>

                    <p className="text-gray-400 text-sm mb-2">{request.serviceCode}</p>
                    <p className="text-gray-300 mb-3">{request.description}</p>

                    {request.vehicle && (
                      <div className="text-gray-400 text-sm mb-2">
                        <span className="font-semibold">Vehicle:</span>{' '}
                        {request.vehicle.make} {request.vehicle.model} ({request.vehicle.year})
                        {' • '}{request.vehicle.licensePlate}
                      </div>
                    )}

                    <div className="text-gray-500 text-sm">
                      <p>Requested: {new Date(request.requestedAt).toLocaleString()}</p>
                      <p>Location: {request.latitude.toFixed(4)}, {request.longitude.toFixed(4)}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAccept(request.id)}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Accept Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
