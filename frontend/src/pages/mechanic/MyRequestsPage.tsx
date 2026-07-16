import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRequests } from '@/hooks/useRequests';

const EMERGENCY_LABELS: Record<string, string> = {
  tire: 'Llanta pinchada', battery: 'Batería descargada', fuel: 'Sin combustible',
  engine: 'Falla de motor', lockout: 'Puertas bloqueadas', tow: 'Necesito grúa', other: 'Otro',
};

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  assigned:    { label: 'Asignado',    cls: 'bg-blue-900/50 border-blue-700 text-blue-200' },
  in_progress: { label: 'En progreso', cls: 'bg-purple-900/50 border-purple-700 text-purple-200' },
  completed:   { label: 'Completado',  cls: 'bg-green-900/50 border-green-700 text-green-200' },
};

export default function MyRequestsPage() {
  const navigate = useNavigate();
  const { requests, isLoading, error, loadMechanicRequests, startRequest, completeRequest } = useRequests();

  const [completingId, setCompletingId] = useState<number | null>(null);
  const [finalCost, setFinalCost] = useState('');
  const [costError, setCostError] = useState<string | null>(null);
  const [startConfirmId, setStartConfirmId] = useState<number | null>(null);
  const [startingId, setStartingId] = useState<number | null>(null);

  useEffect(() => { loadMechanicRequests(); }, []);

  async function handleStart(id: number) {
    setStartingId(id);
    setStartConfirmId(null);
    await startRequest(id);
    setStartingId(null);
  }

  async function handleComplete(id: number) {
    const cost = parseFloat(finalCost);
    if (isNaN(cost) || cost <= 0) {
      setCostError('Ingresa un costo válido mayor a 0');
      return;
    }
    setCostError(null);
    const success = await completeRequest(id, cost);
    if (success) {
      setCompletingId(null);
      setFinalCost('');
    }
  }

  const myRequests = requests.filter(r => ['assigned', 'in_progress', 'completed'].includes(r.status));

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Mis Solicitudes</h1>
          <div className="flex gap-3">
            <Link to="/mechanic/available" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
              Solicitudes Disponibles
            </Link>
            <Link to="/mechanic/dashboard" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors border border-gray-700">
              ← Dashboard
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">{error}</div>
        )}

        {isLoading && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <p className="text-gray-400">Cargando tus solicitudes...</p>
          </div>
        )}

        {!isLoading && myRequests.length === 0 && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
            <p className="text-gray-400 mb-4">Aún no tienes solicitudes asignadas.</p>
            <Link to="/mechanic/available" className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              Ver solicitudes disponibles
            </Link>
          </div>
        )}

        {myRequests.length > 0 && (
          <div className="space-y-4">
            <p className="text-gray-400 text-sm mb-2">{myRequests.length} solicitud(es) asignada(s)</p>

            {myRequests.map((request) => {
              const statusCfg = STATUS_CONFIG[request.status] ?? STATUS_CONFIG['assigned'];
              return (
                <div key={request.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0 mr-4">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-lg font-bold text-white">
                          {EMERGENCY_LABELS[request.emergencyType] ?? request.emergencyType}
                        </h3>
                        <span className={`px-2 py-0.5 border rounded-full text-xs font-medium ${statusCfg.cls}`}>
                          {statusCfg.label}
                        </span>
                      </div>

                      <p className="text-gray-500 text-xs mb-1">{request.serviceCode}</p>
                      <p className="text-gray-300 text-sm mb-3">{request.description}</p>

                      {request.vehicleMake && (
                        <p className="text-gray-400 text-sm mb-1">
                          <span className="text-gray-500">Vehículo:</span>{' '}
                          {request.vehicleMake} {request.vehicleModel}
                        </p>
                      )}
                      {request.customerFirstName && (
                        <p className="text-gray-400 text-sm mb-2">
                          <span className="text-gray-500">Cliente:</span>{' '}
                          {request.customerFirstName} {request.customerLastName}
                        </p>
                      )}

                      <div className="text-gray-500 text-xs space-y-0.5">
                        <p>Solicitado: {new Date(request.requestedAt).toLocaleString('es-CO')}</p>
                        {request.assignedAt && <p>Asignado: {new Date(request.assignedAt).toLocaleString('es-CO')}</p>}
                        {request.startedAt && <p>Iniciado: {new Date(request.startedAt).toLocaleString('es-CO')}</p>}
                        {request.completedAt && <p>Completado: {new Date(request.completedAt).toLocaleString('es-CO')}</p>}
                      </div>

                      {request.finalCost && (
                        <p className="text-green-400 font-semibold text-sm mt-2">
                          Costo final: COP ${request.finalCost.toLocaleString('es-CO')}
                        </p>
                      )}

                      {request.customerRating && (
                        <div className="mt-3 p-3 bg-gray-700/40 border border-gray-600 rounded-lg">
                          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">
                            Calificación del cliente
                          </p>
                          <p className="text-yellow-400 text-sm">
                            {'★'.repeat(request.customerRating)}{'☆'.repeat(5 - request.customerRating)}
                            <span className="text-gray-400 ml-2">Calidad general</span>
                          </p>
                          {request.punctualityRating && (
                            <p className="text-yellow-400 text-sm mt-1">
                              {'★'.repeat(request.punctualityRating)}{'☆'.repeat(5 - request.punctualityRating)}
                              <span className="text-gray-400 ml-2">Puntualidad</span>
                            </p>
                          )}
                          {request.serviceQualityRating && (
                            <p className="text-yellow-400 text-sm mt-1">
                              {'★'.repeat(request.serviceQualityRating)}{'☆'.repeat(5 - request.serviceQualityRating)}
                              <span className="text-gray-400 ml-2">Calidad del servicio</span>
                            </p>
                          )}
                          {request.customerFeedback && (
                            <p className="text-gray-300 text-sm mt-2 italic">"{request.customerFeedback}"</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {/* Cómo llegar a la ubicación del cliente */}
                      {['assigned', 'in_progress'].includes(request.status) && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${request.latitude},${request.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors text-center"
                        >
                          🧭 Cómo llegar
                        </a>
                      )}

                      {/* Iniciar trabajo con confirmación in-page */}
                      {request.status === 'assigned' && (
                        startConfirmId === request.id ? (
                          <div className="flex flex-col gap-1 text-center">
                            <p className="text-xs text-white">¿Iniciar trabajo?</p>
                            <button
                              onClick={() => handleStart(request.id)}
                              disabled={startingId === request.id}
                              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                              {startingId === request.id ? 'Iniciando...' : 'Confirmar'}
                            </button>
                            <button
                              onClick={() => setStartConfirmId(null)}
                              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded-lg transition-colors"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setStartConfirmId(request.id)}
                            disabled={isLoading}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            Iniciar trabajo
                          </button>
                        )
                      )}

                      {request.status === 'in_progress' && (
                        <button
                          onClick={() => { setCompletingId(request.id); setFinalCost(''); setCostError(null); }}
                          disabled={isLoading}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          Completar servicio
                        </button>
                      )}

                      <button
                        onClick={() => navigate(`/mechanic/requests/${request.id}`)}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                      >
                        Ver detalles
                      </button>
                    </div>
                  </div>

                  {/* Formulario completar */}
                  {completingId === request.id && (
                    <div className="mt-4 p-4 bg-gray-700/60 border border-gray-600 rounded-lg">
                      <h4 className="text-white font-semibold mb-3">Completar Servicio</h4>
                      <div className="mb-3">
                        <label className="block text-sm text-gray-300 mb-1">Costo final (COP)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={finalCost}
                          onChange={(e) => { setFinalCost(e.target.value); setCostError(null); }}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="0.00"
                        />
                        {costError && <p className="text-red-400 text-xs mt-1">{costError}</p>}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleComplete(request.id)}
                          disabled={isLoading}
                          className="flex-1 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          {isLoading ? 'Guardando...' : 'Confirmar finalización'}
                        </button>
                        <button
                          onClick={() => { setCompletingId(null); setFinalCost(''); setCostError(null); }}
                          className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
