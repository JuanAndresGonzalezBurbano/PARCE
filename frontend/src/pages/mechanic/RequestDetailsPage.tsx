import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useRequests } from '@/hooks/useRequests';

export default function RequestDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentRequest, isLoading, error, startRequest, completeRequest } = useRequests();

  useEffect(() => {
    // In a real app, we would fetch the specific request
    // For now, we'll rely on the context having loaded requests
    if (id) {
      // TODO: Implement getRequest(id) in context if needed
    }
  }, [id]);

  async function handleStart() {
    if (currentRequest && window.confirm('Start working on this service request?')) {
      const success = await startRequest(currentRequest.id);
      if (success) {
        navigate('/mechanic/requests');
      }
    }
  }

  async function handleComplete() {
    if (currentRequest) {
      const cost = prompt('Enter final cost:');
      if (cost) {
        const finalCost = parseFloat(cost);
        if (!isNaN(finalCost) && finalCost > 0) {
          const success = await completeRequest(currentRequest.id, finalCost);
          if (success) {
            navigate('/mechanic/requests');
          }
        }
      }
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'pending': return 'bg-yellow-900/50 border-yellow-700 text-yellow-200';
      case 'assigned': return 'bg-blue-900/50 border-blue-700 text-blue-200';
      case 'in_progress': return 'bg-purple-900/50 border-purple-700 text-purple-200';
      case 'completed': return 'bg-green-900/50 border-green-700 text-green-200';
      default: return 'bg-gray-900/50 border-gray-700 text-gray-200';
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <p className="text-gray-400">Loading request details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !currentRequest) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-6">
            <p className="text-red-200">{error || 'Request not found'}</p>
            <Link
              to="/mechanic/requests"
              className="inline-block mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
            >
              Back to Requests
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Request Details</h1>
          <Link
            to="/mechanic/requests"
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Back to Requests
          </Link>
        </div>

        {/* Request Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          {/* Status and Code */}
          <div className="flex items-center gap-3 mb-6">
            <span className={`px-3 py-1 border rounded text-sm font-semibold ${getStatusColor(currentRequest.status)}`}>
              {currentRequest.status.replace('_', ' ').toUpperCase()}
            </span>
            <span className="text-gray-400 text-sm">{currentRequest.serviceCode}</span>
          </div>

          {/* Emergency Type */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white capitalize mb-2">
              {currentRequest.emergencyType.replace('_', ' ')}
            </h2>
            <span className="px-2 py-1 bg-yellow-900/50 border border-yellow-700 text-yellow-200 text-xs rounded capitalize">
              {currentRequest.priority}
            </span>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
            <p className="text-gray-300">{currentRequest.description}</p>
          </div>

          {/* Customer Info */}
          {currentRequest.customer && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">Customer</h3>
              <div className="text-gray-300">
                <p>{currentRequest.customer.firstName} {currentRequest.customer.lastName}</p>
                <p className="text-gray-400 text-sm">{currentRequest.customer.email}</p>
              </div>
            </div>
          )}

          {/* Vehicle Info */}
          {currentRequest.vehicle && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">Vehicle</h3>
              <div className="text-gray-300">
                <p>{currentRequest.vehicle.make} {currentRequest.vehicle.model} ({currentRequest.vehicle.year})</p>
                <p className="text-gray-400 text-sm">License Plate: {currentRequest.vehicle.licensePlate}</p>
              </div>
            </div>
          )}

          {/* Location */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">Location</h3>
            <p className="text-gray-300">
              Lat: {currentRequest.latitude.toFixed(4)}, Lng: {currentRequest.longitude.toFixed(4)}
            </p>
          </div>

          {/* Timeline */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">Timeline</h3>
            <div className="space-y-2 text-gray-300">
              <p>
                <span className="font-semibold">Requested:</span>{' '}
                {new Date(currentRequest.requestedAt).toLocaleString()}
              </p>
              {currentRequest.assignedAt && (
                <p>
                  <span className="font-semibold">Assigned:</span>{' '}
                  {new Date(currentRequest.assignedAt).toLocaleString()}
                </p>
              )}
              {currentRequest.startedAt && (
                <p>
                  <span className="font-semibold">Started:</span>{' '}
                  {new Date(currentRequest.startedAt).toLocaleString()}
                </p>
              )}
              {currentRequest.completedAt && (
                <p>
                  <span className="font-semibold">Completed:</span>{' '}
                  {new Date(currentRequest.completedAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/* Cost */}
          {currentRequest.finalCost && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">Cost</h3>
              <p className="text-green-400 text-xl font-bold">
                ${currentRequest.finalCost.toFixed(2)}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            {currentRequest.status === 'assigned' && (
              <button
                onClick={handleStart}
                disabled={isLoading}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
              >
                Start Work
              </button>
            )}

            {currentRequest.status === 'in_progress' && (
              <button
                onClick={handleComplete}
                disabled={isLoading}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
              >
                Complete Work
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
