import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useRequests } from '@/hooks/useRequests';
import { useVehicles } from '@/hooks/useVehicles';

export default function RequestsPage() {
  const { requests, isLoading, error, loadRequests, createRequest, cancelRequest, rateRequest } = useRequests();
  const { vehicles, loadVehicles } = useVehicles();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showRateForm, setShowRateForm] = useState<number | null>(null);
  
  // Form states
  const [vehicleId, setVehicleId] = useState<number>(0);
  const [emergencyType, setEmergencyType] = useState('tire');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('normal');
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    loadRequests();
    loadVehicles();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    
    // Use default location (NYC)
    const success = await createRequest({
      vehicle_id: vehicleId,
      emergency_type: emergencyType as any,
      description,
      latitude: 40.7128,
      longitude: -74.0060,
      priority: priority as any,
    });

    if (success) {
      setShowCreateForm(false);
      setDescription('');
    }
  }

  async function handleCancel(id: number) {
    const reason = prompt('Please provide a cancellation reason:');
    if (reason) {
      await cancelRequest(id, reason);
    }
  }

  async function handleRate(e: React.FormEvent, id: number) {
    e.preventDefault();
    const success = await rateRequest(id, rating, feedback);
    if (success) {
      setShowRateForm(null);
      setRating(5);
      setFeedback('');
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'pending': return 'bg-yellow-900/50 border-yellow-700 text-yellow-200';
      case 'assigned': return 'bg-blue-900/50 border-blue-700 text-blue-200';
      case 'in_progress': return 'bg-purple-900/50 border-purple-700 text-purple-200';
      case 'completed': return 'bg-green-900/50 border-green-700 text-green-200';
      case 'cancelled': return 'bg-red-900/50 border-red-700 text-red-200';
      default: return 'bg-gray-900/50 border-gray-700 text-gray-200';
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Service Requests</h1>
          <Link
            to="/dashboard"
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

        {/* Loading */}
        {isLoading && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <p className="text-gray-400">Loading requests...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && requests.length === 0 && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <p className="text-gray-400 mb-4">No service requests yet.</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Create Your First Request
            </button>
          </div>
        )}

        {/* Requests List */}
        {!isLoading && requests.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-400">{requests.length} request(s)</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                New Request
              </button>
            </div>

            {requests.map((request) => (
              <div key={request.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-white capitalize">
                        {request.emergencyType.replace('_', ' ')}
                      </h3>
                      <span className={`px-2 py-1 border rounded text-xs ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                      <span className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300 capitalize">
                        {request.priority}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">{request.serviceCode}</p>
                    <p className="text-gray-300">{request.description}</p>
                    <p className="text-gray-500 text-sm mt-2">
                      Requested: {new Date(request.requestedAt).toLocaleString()}
                    </p>
                    {request.finalCost && (
                      <p className="text-gray-400 mt-2">Cost: ${request.finalCost.toFixed(2)}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {request.status === 'pending' && (
                      <button
                        onClick={() => handleCancel(request.id)}
                        className="px-3 py-1 bg-red-900/50 hover:bg-red-900 border border-red-700 text-red-200 text-sm rounded transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                    {request.status === 'completed' && !request.customerRating && (
                      <button
                        onClick={() => setShowRateForm(request.id)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                      >
                        Rate Service
                      </button>
                    )}
                    {request.customerRating && (
                      <div className="text-yellow-400 text-sm">
                        ★ {request.customerRating}/5
                      </div>
                    )}
                  </div>
                </div>

                {/* Rate Form */}
                {showRateForm === request.id && (
                  <form onSubmit={(e) => handleRate(e, request.id)} className="mt-4 p-4 bg-gray-700 rounded-lg">
                    <h4 className="text-white font-bold mb-3">Rate this service</h4>
                    <div className="mb-3">
                      <label className="block text-sm text-gray-300 mb-1">Rating (1-5)</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={rating}
                        onChange={(e) => setRating(parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm text-gray-300 mb-1">Feedback (optional)</label>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
                        Submit Rating
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowRateForm(null)}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Create Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-lg w-full">
              <h2 className="text-2xl font-bold text-white mb-4">New Service Request</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Vehicle *</label>
                  <select
                    required
                    value={vehicleId}
                    onChange={(e) => setVehicleId(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  >
                    <option value="0">Select a vehicle</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.make} {v.model} - {v.licensePlate}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Emergency Type *</label>
                  <select
                    required
                    value={emergencyType}
                    onChange={(e) => setEmergencyType(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  >
                    <option value="tire">Tire Issue</option>
                    <option value="battery">Battery Problem</option>
                    <option value="fuel">Out of Fuel</option>
                    <option value="engine">Engine Problem</option>
                    <option value="lockout">Locked Out</option>
                    <option value="tow">Need Towing</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Description *</label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                    rows={3}
                    placeholder="Describe the issue..."
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isLoading || vehicleId === 0}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded"
                  >
                    Create Request
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
