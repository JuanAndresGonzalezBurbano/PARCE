import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRequests } from '@/hooks/useRequests';

export default function MyRequestsPage() {
  const navigate = useNavigate();
  const { requests, isLoading, error, loadRequests, startRequest, completeRequest } = useRequests();
  const [completingId, setCompletingId] = useState<number | null>(null);
  const [finalCost, setFinalCost] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  async function handleStart(id: number) {
    if (window.confirm('Start working on this service request?')) {
      await startRequest(id);
    }
  }

  async function handleComplete(id: number) {
    const cost = parseFloat(finalCost);
    if (isNaN(cost) || cost <= 0) {
      alert('Please enter a valid cost');
      return;
    }

    const success = await completeRequest(id, cost);
    if (success) {
      setCompletingId(null);
      setFinalCost('');
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'assigned': return 'bg-blue-900/50 border-blue-700 text-blue-200';
      case 'in_progress': return 'bg-purple-900/50 border-purple-700 text-purple-200';
      case 'completed': return 'bg-green-900/50 border-green-700 text-green-200';
      default: return 'bg-gray-900/50 border-gray-700 text-gray-200';
    }
  }

  const myRequests = requests.filter(r => 
    ['assigned', 'in_progress', 'completed'].includes(r.status)
  );

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">My Requests</h1>
          <div className="flex gap-3">
            <Link
              to="/mechanic/available"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Available Requests
            </Link>
            <Link
              to="/mechanic/dashboard"
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Dashboard
            </Link>
          </div>
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
            <p className="text-gray-400">Loading your requests...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && myRequests.length === 0 && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <p className="text-gray-400 mb-4">No assigned requests yet.</p>
            <Link
              to="/mechanic/available"
              className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Browse Available Requests
            </Link>
          </div>
        )}

        {/* Requests List */}
        {!isLoading && myRequests.length > 0 && (
          <div className="space-y-4">
            <p className="text-gray-400 mb-4">{myRequests.length} assigned request(s)</p>

            {myRequests.map((request) => (
              <div
                key={request.id}
                className="bg-gray-800 border border-gray-700 rounded-lg p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-white capitalize">
                        {request.emergencyType.replace('_', ' ')}
                      </h3>
                      <span className={`px-2 py-1 border rounded text-xs ${getStatusColor(request.status)}`}>
                        {request.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-gray-400 text-sm mb-2">{request.serviceCode}</p>
                    <p className="text-gray-300 mb-3">{request.description}</p>

                    {request.vehicle && (
                      <div className="text-gray-400 text-sm mb-2">
                        <span className="font-semibold">Vehicle:</span>{' '}
                        {request.vehicle.make} {request.vehicle.model} ({request.vehicle.year})
                      </div>
                    )}

                    {request.customer && (
                      <div className="text-gray-400 text-sm mb-2">
                        <span className="font-semibold">Customer:</span>{' '}
                        {request.customer.firstName} {request.customer.lastName}
                      </div>
                    )}

                    <div className="text-gray-500 text-sm">
                      <p>Requested: {new Date(request.requestedAt).toLocaleString()}</p>
                      {request.assignedAt && (
                        <p>Assigned: {new Date(request.assignedAt).toLocaleString()}</p>
                      )}
                      {request.startedAt && (
                        <p>Started: {new Date(request.startedAt).toLocaleString()}</p>
                      )}
                      {request.completedAt && (
                        <p>Completed: {new Date(request.completedAt).toLocaleString()}</p>
                      )}
                    </div>

                    {request.finalCost && (
                      <p className="text-green-400 font-semibold mt-2">
                        Final Cost: ${request.finalCost.toFixed(2)}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    {request.status === 'assigned' && (
                      <button
                        onClick={() => handleStart(request.id)}
                        disabled={isLoading}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                      >
                        Start Work
                      </button>
                    )}

                    {request.status === 'in_progress' && (
                      <button
                        onClick={() => setCompletingId(request.id)}
                        disabled={isLoading}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                      >
                        Complete Work
                      </button>
                    )}

                    <button
                      onClick={() => navigate(`/mechanic/requests/${request.id}`)}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>

                {/* Complete Form */}
                {completingId === request.id && (
                  <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                    <h4 className="text-white font-bold mb-3">Complete Service</h4>
                    <div className="mb-3">
                      <label className="block text-sm text-gray-300 mb-1">Final Cost ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={finalCost}
                        onChange={(e) => setFinalCost(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleComplete(request.id)}
                        disabled={isLoading}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded"
                      >
                        Confirm Complete
                      </button>
                      <button
                        onClick={() => {
                          setCompletingId(null);
                          setFinalCost('');
                        }}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
