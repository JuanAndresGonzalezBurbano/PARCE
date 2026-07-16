import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useVehicles } from '@/hooks/useVehicles';
import VehicleForm from '@/components/vehicles/VehicleForm';
import type { Vehicle } from '@/types/vehicle';

function getDocumentStatus(date: string | null): 'not_set' | 'expired' | 'expiring_soon' | 'valid' {
  if (!date) return 'not_set';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(date + 'T00:00:00');
  if (expiry < today) return 'expired';
  const thirtyDays = new Date(today);
  thirtyDays.setDate(thirtyDays.getDate() + 30);
  if (expiry <= thirtyDays) return 'expiring_soon';
  return 'valid';
}

const DOC_STATUS = {
  not_set:       { label: 'Sin registrar', cls: 'border bg-gray-700/50 text-gray-400 border-gray-600' },
  valid:         { label: 'Vigente',       cls: 'border bg-green-900/40 text-green-300 border-green-700' },
  expiring_soon: { label: 'Por vencer',    cls: 'border bg-yellow-900/40 text-yellow-300 border-yellow-700' },
  expired:       { label: 'Vencido',       cls: 'border bg-red-900/40 text-red-300 border-red-700' },
};

const VEHICLE_TYPE_LABELS: Record<string, string> = {
  sedan: 'Sedán', suv: 'SUV', truck: 'Camioneta', motorcycle: 'Moto', van: 'Furgoneta', other: 'Otro',
};

const FUEL_TYPE_LABELS: Record<string, string> = {
  gasoline: 'Gasolina', diesel: 'Diésel', electric: 'Eléctrico', hybrid: 'Híbrido', other: 'Otro',
};

export default function VehiclesPage() {
  const {
    vehicles, isLoading, error, fieldErrors,
    loadVehicles, createVehicle, updateVehicle, deleteVehicle, clearError,
  } = useVehicles();
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deletingConfirmId, setDeletingConfirmId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => { loadVehicles(); }, []);

  function handleAddClick() { clearError(); setEditingVehicle(null); setShowForm(true); }
  function handleEditClick(v: Vehicle) { clearError(); setEditingVehicle(v); setShowForm(true); }
  function handleCloseForm() { setShowForm(false); setEditingVehicle(null); clearError(); }

  async function handleDeleteConfirm(id: number) {
    setDeletingId(id);
    setDeletingConfirmId(null);
    await deleteVehicle(id);
    setDeletingId(null);
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Cabecera */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Mis Vehículos</h1>
          <Link to="/dashboard" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700">
            ← Dashboard
          </Link>
        </div>

        {error && !showForm && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">{error}</div>
        )}

        {isLoading && !deletingId && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <p className="text-gray-400">Cargando vehículos...</p>
          </div>
        )}

        {!isLoading && !error && vehicles.length === 0 && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
            <p className="text-gray-400 mb-4">Aún no tienes vehículos registrados.</p>
            <button onClick={handleAddClick} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              Agregar tu primer vehículo
            </button>
          </div>
        )}

        {vehicles.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-gray-400 text-sm">{vehicles.length} vehículo(s) registrado(s)</p>
              <button onClick={handleAddClick} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm">
                + Agregar vehículo
              </button>
            </div>

            {vehicles.map((vehicle) => {
              const soatStatus = getDocumentStatus(vehicle.soatExpirationDate);
              const tecnoStatus = getDocumentStatus(vehicle.tecnomecanicaExpirationDate);

              return (
                <div key={vehicle.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      {/* Nombre y estado */}
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-xl font-bold text-white">
                          {vehicle.make} {vehicle.model}
                        </h3>
                        {vehicle.isPrimary && (
                          <span className="px-2 py-0.5 bg-blue-900/50 border border-blue-700 rounded-full text-xs text-blue-300 font-medium">
                            Principal
                          </span>
                        )}
                        <span className="px-2 py-0.5 bg-gray-700 border border-gray-600 rounded-full text-xs text-gray-400 capitalize">
                          {vehicle.status === 'active' ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>

                      <p className="text-gray-400 text-sm mb-1">
                        {vehicle.year} • {vehicle.licensePlate}
                      </p>

                      <p className="text-gray-500 text-sm mb-3">
                        {VEHICLE_TYPE_LABELS[vehicle.vehicleType] ?? vehicle.vehicleType}
                        {' · '}
                        {FUEL_TYPE_LABELS[vehicle.fuelType] ?? vehicle.fuelType}
                        {vehicle.color ? ` · ${vehicle.color}` : ''}
                      </p>

                      {/* Badges de documentos colombianos */}
                      <div className="flex flex-wrap gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-gray-500">SOAT:</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DOC_STATUS[soatStatus].cls}`}>
                            {DOC_STATUS[soatStatus].label}
                          </span>
                          {vehicle.soatExpirationDate && (
                            <span className="text-xs text-gray-600">
                              {new Date(vehicle.soatExpirationDate + 'T00:00:00').toLocaleDateString('es-CO')}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-gray-500">Tecnomecánica:</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DOC_STATUS[tecnoStatus].cls}`}>
                            {DOC_STATUS[tecnoStatus].label}
                          </span>
                          {vehicle.tecnomecanicaExpirationDate && (
                            <span className="text-xs text-gray-600">
                              {new Date(vehicle.tecnomecanicaExpirationDate + 'T00:00:00').toLocaleDateString('es-CO')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => handleEditClick(vehicle)}
                        disabled={deletingId === vehicle.id}
                        className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                      >
                        Editar
                      </button>

                      {deletingConfirmId === vehicle.id ? (
                        <div className="flex flex-col gap-1">
                          <p className="text-xs text-red-400 text-center">¿Eliminar?</p>
                          <button
                            onClick={() => handleDeleteConfirm(vehicle.id)}
                            disabled={deletingId === vehicle.id}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors"
                          >
                            {deletingId === vehicle.id ? 'Eliminando...' : 'Confirmar'}
                          </button>
                          <button
                            onClick={() => setDeletingConfirmId(null)}
                            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded-lg transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeletingConfirmId(vehicle.id)}
                          disabled={deletingId === vehicle.id}
                          className="px-3 py-1.5 bg-red-900/40 hover:bg-red-900/70 border border-red-800 text-red-300 text-sm rounded-lg transition-colors disabled:opacity-50"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showForm && (
          <VehicleForm
            vehicle={editingVehicle || undefined}
            onSubmit={editingVehicle
              ? (data) => updateVehicle(editingVehicle.id, data as any)
              : (data) => createVehicle(data as any)
            }
            onCancel={handleCloseForm}
            isLoading={isLoading}
            error={error}
            fieldErrors={fieldErrors}
          />
        )}
      </div>
    </div>
  );
}
