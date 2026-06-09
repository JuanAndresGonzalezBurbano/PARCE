import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useVehicles } from '@/hooks/useVehicles';
import VehicleForm from '@/components/vehicles/VehicleForm';
import type { Vehicle } from '@/types/vehicle';

export default function VehiclesPage() {
  const { vehicles, isLoading, error, loadVehicles, createVehicle, updateVehicle, deleteVehicle, clearError } = useVehicles();
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    loadVehicles();
  }, []);

  function handleAddClick() {
    setEditingVehicle(null);
    setShowForm(true);
  }

  function handleEditClick(vehicle: Vehicle) {
    setEditingVehicle(vehicle);
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditingVehicle(null);
    clearError();
  }

  async function handleDeleteClick(id: number) {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      setDeletingId(id);
      await deleteVehicle(id);
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">My Vehicles</h1>
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

        {/* Loading State */}
        {isLoading && !deletingId && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <p className="text-gray-400">Loading vehicles...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && vehicles.length === 0 && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <p className="text-gray-400 mb-4">No vehicles registered yet.</p>
            <button
              onClick={handleAddClick}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Add Your First Vehicle
            </button>
          </div>
        )}

        {/* Vehicle List */}
        {!isLoading && !error && vehicles.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-400">{vehicles.length} vehicle(s) registered</p>
              <button
                onClick={handleAddClick}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Add Vehicle
              </button>
            </div>

            {vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-white">
                        {vehicle.make} {vehicle.model}
                      </h3>
                      {vehicle.isPrimary && (
                        <span className="px-2 py-1 bg-blue-900/50 border border-blue-700 rounded text-xs text-blue-200">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 mb-1">
                      {vehicle.year} • {vehicle.licensePlate}
                    </p>
                    {vehicle.color && (
                      <p className="text-gray-500 text-sm capitalize">{vehicle.color}</p>
                    )}
                    {vehicle.nickname && (
                      <p className="text-gray-500 text-sm italic">"{vehicle.nickname}"</p>
                    )}
                    <p className="text-gray-500 text-sm mt-2 capitalize">
                      {vehicle.vehicleType} • {vehicle.fuelType}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(vehicle)}
                      disabled={deletingId === vehicle.id}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 text-white text-sm rounded transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(vehicle.id)}
                      disabled={deletingId === vehicle.id}
                      className="px-3 py-1 bg-red-900/50 hover:bg-red-900 border border-red-700 text-red-200 text-sm rounded transition-colors disabled:opacity-50"
                    >
                      {deletingId === vehicle.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Vehicle Form Modal */}
        {showForm && (
          <VehicleForm
            vehicle={editingVehicle || undefined}
            onSubmit={editingVehicle 
              ? (data) => updateVehicle(editingVehicle.id, data as any) 
              : (data) => createVehicle(data as any)
            }
            onCancel={handleCloseForm}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}
