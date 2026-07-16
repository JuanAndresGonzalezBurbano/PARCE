import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useRequests } from '@/hooks/useRequests';
import { serviceRequestService } from '@/services/serviceRequestService';
import EvidenceUpload from '@/components/vehicles/EvidenceUpload';
import type { ServiceRequestEvidence, AddEvidenceRequest } from '@/types/serviceRequest';

type ConfirmAction = 'start' | 'complete' | null;

// Estados de la solicitud que permiten agregar/ver evidencias (debe coincidir con
// ServiceRequestEvidenceService::VALID_STATUSES en el backend)
const EVIDENCE_VISIBLE_STATUSES = ['assigned', 'in_progress', 'completed'];

export default function RequestDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    currentRequest, isLoading, error,
    loadMechanicRequestDetails, startRequest, completeRequest,
  } = useRequests();

  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [finalCostInput, setFinalCostInput] = useState('');
  const [costError, setCostError] = useState('');

  // Estado de evidencias
  const [evidences, setEvidences] = useState<ServiceRequestEvidence[]>([]);
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [evidenceUploading, setEvidenceUploading] = useState(false);

  const requestId = id ? parseInt(id) : null;

  useEffect(() => {
    if (requestId) {
      loadMechanicRequestDetails(requestId);
      loadEvidences(requestId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  async function loadEvidences(reqId: number) {
    setEvidenceLoading(true);
    try {
      const response = await serviceRequestService.getEvidences(reqId);
      if (response.success) {
        setEvidences(response.data.evidences);
      }
    } catch {
      // La solicitud puede no tener evidencias todavía; no bloquear la UI
    } finally {
      setEvidenceLoading(false);
    }
  }

  async function handleAddEvidence(data: AddEvidenceRequest): Promise<boolean> {
    if (!requestId) return false;

    setEvidenceUploading(true);
    try {
      const response = await serviceRequestService.addEvidence(requestId, data);
      if (response.success) {
        await loadEvidences(requestId);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setEvidenceUploading(false);
    }
  }

  async function handleStart() {
    if (!currentRequest) return;
    const success = await startRequest(currentRequest.id);
    if (success) {
      setConfirmAction(null);
      navigate('/mechanic/requests');
    }
  }

  async function handleComplete() {
    if (!currentRequest) return;
    setCostError('');
    const cost = parseFloat(finalCostInput);
    if (isNaN(cost) || cost <= 0) {
      setCostError('Ingresa un costo válido mayor a cero.');
      return;
    }
    const success = await completeRequest(currentRequest.id, cost);
    if (success) {
      setConfirmAction(null);
      setFinalCostInput('');
      navigate('/mechanic/requests');
    }
  }

  function getStatusLabel(status: string) {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      assigned: 'Asignada',
      in_progress: 'En progreso',
      completed: 'Completada',
      cancelled: 'Cancelada',
    };
    return labels[status] ?? status;
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

  function getEmergencyLabel(type: string) {
    const labels: Record<string, string> = {
      tire: 'Llanta',
      battery: 'Batería',
      fuel: 'Combustible',
      engine: 'Motor',
      lockout: 'Bloqueo',
      tow: 'Remolque',
      other: 'Otro',
    };
    return labels[type] ?? type;
  }

  function getPriorityLabel(priority: string) {
    const labels: Record<string, string> = {
      low: 'Baja',
      normal: 'Normal',
      urgent: 'Urgente',
    };
    return labels[priority] ?? priority;
  }

  if (isLoading && !currentRequest) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <p className="text-gray-400">Cargando detalles de la solicitud...</p>
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
            <p className="text-red-200">{error || 'Solicitud no encontrada'}</p>
            <Link
              to="/mechanic/requests"
              className="inline-block mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
            >
              Volver a solicitudes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const showEvidences = EVIDENCE_VISIBLE_STATUSES.includes(currentRequest.status);

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Cabecera */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Detalle de solicitud</h1>
          <Link
            to="/mechanic/requests"
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Volver a solicitudes
          </Link>
        </div>

        {/* Tarjeta principal */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
          {/* Estado y código */}
          <div className="flex items-center gap-3 mb-6">
            <span
              className={`px-3 py-1 border rounded text-sm font-semibold ${getStatusColor(currentRequest.status)}`}
            >
              {getStatusLabel(currentRequest.status)}
            </span>
            <span className="text-gray-400 text-sm">{currentRequest.serviceCode}</span>
          </div>

          {/* Tipo de emergencia */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              {getEmergencyLabel(currentRequest.emergencyType)}
            </h2>
            <span className="px-2 py-1 bg-yellow-900/50 border border-yellow-700 text-yellow-200 text-xs rounded">
              Prioridad: {getPriorityLabel(currentRequest.priority)}
            </span>
          </div>

          {/* Descripción */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">Descripción</h3>
            <p className="text-gray-300">{currentRequest.description}</p>
          </div>

          {/* Cliente */}
          {currentRequest.customerFirstName && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">Cliente</h3>
              <div className="text-gray-300">
                <p>
                  {currentRequest.customerFirstName} {currentRequest.customerLastName}
                </p>
                {currentRequest.customerPhone && (
                  <p className="text-gray-400 text-sm">{currentRequest.customerPhone}</p>
                )}
              </div>
            </div>
          )}

          {/* Vehículo */}
          {currentRequest.vehicleMake && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">Vehículo</h3>
              <div className="text-gray-300">
                <p>
                  {currentRequest.vehicleMake} {currentRequest.vehicleModel} (
                  {currentRequest.vehicleYear})
                </p>
                <p className="text-gray-400 text-sm">
                  Placa: {currentRequest.vehicleLicensePlate}
                </p>
              </div>
            </div>
          )}

          {/* Ubicación */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">Ubicación</h3>
            <p className="text-gray-300 text-sm mb-2">
              {Number(currentRequest.latitude).toFixed(5)}, {Number(currentRequest.longitude).toFixed(5)}
            </p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${currentRequest.latitude},${currentRequest.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
            >
              🧭 Cómo llegar
            </a>
          </div>

          {/* Línea de tiempo */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">Historial</h3>
            <div className="space-y-2 text-gray-300">
              <p>
                <span className="font-semibold">Solicitada:</span>{' '}
                {new Date(currentRequest.requestedAt).toLocaleString('es-CO')}
              </p>
              {currentRequest.assignedAt && (
                <p>
                  <span className="font-semibold">Asignada:</span>{' '}
                  {new Date(currentRequest.assignedAt).toLocaleString('es-CO')}
                </p>
              )}
              {currentRequest.startedAt && (
                <p>
                  <span className="font-semibold">Iniciada:</span>{' '}
                  {new Date(currentRequest.startedAt).toLocaleString('es-CO')}
                </p>
              )}
              {currentRequest.completedAt && (
                <p>
                  <span className="font-semibold">Completada:</span>{' '}
                  {new Date(currentRequest.completedAt).toLocaleString('es-CO')}
                </p>
              )}
            </div>
          </div>

          {/* Costo final */}
          {currentRequest.finalCost != null && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">Costo final</h3>
              <p className="text-green-400 text-xl font-bold">
                COP ${Number(currentRequest.finalCost).toLocaleString('es-CO')}
              </p>
            </div>
          )}

          {/* Calificación del cliente */}
          {currentRequest.customerRating && (
            <div className="mb-6 p-4 bg-gray-700/40 border border-gray-600 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">Calificación del cliente</h3>
              <p className="text-yellow-400 text-sm">
                {'★'.repeat(currentRequest.customerRating)}{'☆'.repeat(5 - currentRequest.customerRating)}
                <span className="text-gray-400 ml-2">Calidad general</span>
              </p>
              {currentRequest.punctualityRating && (
                <p className="text-yellow-400 text-sm mt-1">
                  {'★'.repeat(currentRequest.punctualityRating)}{'☆'.repeat(5 - currentRequest.punctualityRating)}
                  <span className="text-gray-400 ml-2">Puntualidad</span>
                </p>
              )}
              {currentRequest.serviceQualityRating && (
                <p className="text-yellow-400 text-sm mt-1">
                  {'★'.repeat(currentRequest.serviceQualityRating)}{'☆'.repeat(5 - currentRequest.serviceQualityRating)}
                  <span className="text-gray-400 ml-2">Calidad del servicio</span>
                </p>
              )}
              {currentRequest.customerFeedback && (
                <p className="text-gray-300 text-sm mt-2 italic">"{currentRequest.customerFeedback}"</p>
              )}
            </div>
          )}

          {/* Acciones */}
          <div className="pt-4 border-t border-gray-700">
            {/* Confirmar inicio */}
            {currentRequest.status === 'assigned' && confirmAction !== 'start' && (
              <button
                onClick={() => setConfirmAction('start')}
                disabled={isLoading}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
              >
                Iniciar trabajo
              </button>
            )}

            {confirmAction === 'start' && (
              <div className="p-4 bg-gray-700 border border-gray-600 rounded-lg">
                <p className="text-white font-semibold mb-4">
                  ¿Estás seguro de que quieres iniciar este trabajo?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleStart}
                    disabled={isLoading}
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                  >
                    {isLoading ? 'Iniciando...' : 'Sí, iniciar'}
                  </button>
                  <button
                    onClick={() => setConfirmAction(null)}
                    disabled={isLoading}
                    className="px-5 py-2 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Formulario de completar */}
            {currentRequest.status === 'in_progress' && confirmAction !== 'complete' && (
              <button
                onClick={() => setConfirmAction('complete')}
                disabled={isLoading}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
              >
                Completar trabajo
              </button>
            )}

            {confirmAction === 'complete' && (
              <div className="p-4 bg-gray-700 border border-gray-600 rounded-lg">
                <h4 className="text-white font-semibold mb-3">Completar servicio</h4>
                {error && (
                  <div className="mb-3 p-2.5 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-xs">{error}</div>
                )}
                <div className="mb-3">
                  <label className="block text-sm text-gray-300 mb-1">Costo final (COP)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={finalCostInput}
                    onChange={(e) => {
                      setFinalCostInput(e.target.value);
                      setCostError('');
                    }}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                    placeholder="0.00"
                  />
                  {costError && (
                    <p className="mt-1 text-red-400 text-sm">{costError}</p>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleComplete}
                    disabled={isLoading}
                    className="px-5 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                  >
                    {isLoading ? 'Guardando...' : 'Completar'}
                  </button>
                  <button
                    onClick={() => {
                      setConfirmAction(null);
                      setFinalCostInput('');
                      setCostError('');
                    }}
                    disabled={isLoading}
                    className="px-5 py-2 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sección de evidencias fotográficas */}
        {showEvidences && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Evidencias fotográficas</h3>
            {evidenceLoading ? (
              <p className="text-gray-400 text-sm">Cargando evidencias...</p>
            ) : (
              <EvidenceUpload
                serviceRequestId={currentRequest.id}
                existingEvidences={evidences}
                onAdd={handleAddEvidence}
                isLoading={evidenceUploading}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
