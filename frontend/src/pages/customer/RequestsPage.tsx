import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useRequests } from '@/hooks/useRequests';
import { useVehicles } from '@/hooks/useVehicles';
import { serviceRequestService } from '@/services/serviceRequestService';
import EvidenceUpload from '@/components/vehicles/EvidenceUpload';
import type { ServiceRequestEvidence } from '@/types/serviceRequest';

const POLL_INTERVAL_MS = 20000;

const STATUS_CHANGE_MESSAGES: Record<string, string> = {
  assigned: 'Un mecánico aceptó tu solicitud',
  in_progress: 'El mecánico inició el servicio',
  completed: 'Tu servicio fue completado',
  cancelled: 'Tu solicitud fue cancelada',
};

const EMERGENCY_LABELS: Record<string, string> = {
  tire: 'Llanta pinchada', battery: 'Batería descargada', fuel: 'Sin combustible',
  engine: 'Falla de motor', lockout: 'Puertas bloqueadas', tow: 'Necesito grúa', other: 'Otro',
};

const PRIORITY_LABELS: Record<string, string> = { normal: 'Normal', urgent: 'Urgente', critical: 'Crítica' };

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  pending:     { label: 'Pendiente',   cls: 'bg-yellow-900/50 border-yellow-700 text-yellow-200' },
  assigned:    { label: 'Asignado',    cls: 'bg-blue-900/50 border-blue-700 text-blue-200' },
  in_progress: { label: 'En progreso', cls: 'bg-purple-900/50 border-purple-700 text-purple-200' },
  completed:   { label: 'Completado',  cls: 'bg-green-900/50 border-green-700 text-green-200' },
  cancelled:   { label: 'Cancelado',   cls: 'bg-red-900/50 border-red-700 text-red-200' },
};

const inputCls = 'w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500';
const inputErrorCls = 'w-full px-3 py-2 bg-gray-700 border border-red-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500';

// El backend convierte las claves de error a camelCase (ver ResponseFormatter::convertToCamelCase)
function toCamelCase(snakeKey: string): string {
  return snakeKey.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export default function RequestsPage() {
  const { requests, isLoading, error, fieldErrors, loadRequests, refreshRequestsSilently, createRequest, cancelRequest, rateRequest, clearError } = useRequests();
  const { vehicles, loadVehicles } = useVehicles();

  function fieldErrorFor(snakeKey: string): string | undefined {
    return fieldErrors?.[toCamelCase(snakeKey)];
  }

  const FieldError = ({ name }: { name: string }) => {
    const message = fieldErrorFor(name);
    if (!message) return null;
    return <p className="text-red-400 text-xs mt-1">{message}</p>;
  };

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showRateForm, setShowRateForm] = useState<number | null>(null);

  // Form crear
  const [vehicleId, setVehicleId] = useState<number>(0);
  const [emergencyType, setEmergencyType] = useState('tire');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('normal');
  const [requestLat, setRequestLat] = useState(4.7110);
  const [requestLng, setRequestLng] = useState(-74.0721);
  const [locatingUser, setLocatingUser] = useState(false);
  const [usedRealLocation, setUsedRealLocation] = useState(false);

  // Form calificar (3 ratings)
  const [customerRating, setCustomerRating] = useState(5);
  const [punctualityRating, setPunctualityRating] = useState(5);
  const [serviceQualityRating, setServiceQualityRating] = useState(5);
  const [feedback, setFeedback] = useState('');

  // Evidencias fotográficas (solo lectura para el cliente)
  const [showEvidencesFor, setShowEvidencesFor] = useState<number | null>(null);
  const [evidencesByRequest, setEvidencesByRequest] = useState<Record<number, ServiceRequestEvidence[]>>({});
  const [evidenceLoading, setEvidenceLoading] = useState(false);

  // Filtro de estado (client-side; la lista completa ya está cargada en memoria)
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const filteredRequests = statusFilter === 'all'
    ? requests
    : requests.filter((r) => r.status === statusFilter);

  const [statusChangeBanner, setStatusChangeBanner] = useState<string | null>(null);
  const knownStatusesRef = useRef<Map<number, string> | null>(null);

  useEffect(() => { loadRequests(); loadVehicles(); }, []);

  // Sondeo periódico en segundo plano: detecta cambios de estado (ej. mecánico asignado)
  // sin que el cliente tenga que recargar manualmente la página.
  useEffect(() => {
    const interval = setInterval(async () => {
      const updated = await refreshRequestsSilently();
      if (updated === null) return;

      if (knownStatusesRef.current !== null) {
        for (const r of updated) {
          const previousStatus = knownStatusesRef.current.get(r.id);
          if (previousStatus && previousStatus !== r.status) {
            const message = STATUS_CHANGE_MESSAGES[r.status];
            if (message) {
              setStatusChangeBanner(`${r.serviceCode}: ${message}`);
              setTimeout(() => setStatusChangeBanner(null), 8000);
            }
          }
        }
      }
      knownStatusesRef.current = new Map(updated.map((r) => [r.id, r.status]));
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  // Mantener el mapa de estados conocidos sincronizado con la carga inicial
  useEffect(() => {
    if (knownStatusesRef.current === null && !isLoading && requests.length >= 0) {
      knownStatusesRef.current = new Map(requests.map((r) => [r.id, r.status]));
    }
  }, [requests, isLoading]);

  async function handleToggleEvidences(id: number) {
    if (showEvidencesFor === id) {
      setShowEvidencesFor(null);
      return;
    }
    setShowEvidencesFor(id);
    if (evidencesByRequest[id]) return; // ya cargadas
    setEvidenceLoading(true);
    try {
      const response = await serviceRequestService.getMyRequestEvidences(id);
      if (response.success) {
        setEvidencesByRequest((prev) => ({ ...prev, [id]: response.data.evidences }));
      }
    } catch {
      // Silencioso: la sección simplemente mostrará "sin evidencias"
    } finally {
      setEvidenceLoading(false);
    }
  }

  function handleOpenCreateForm() {
    clearError();
    setUsedRealLocation(false);
    setRequestLat(4.7110);
    setRequestLng(-74.0721);
    if (navigator.geolocation) {
      setLocatingUser(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setRequestLat(pos.coords.latitude);
          setRequestLng(pos.coords.longitude);
          setUsedRealLocation(true);
          setLocatingUser(false);
        },
        () => { setLocatingUser(false); },
        { timeout: 5000 }
      );
    }
    setShowCreateForm(true);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const success = await createRequest({
      vehicle_id: vehicleId,
      emergency_type: emergencyType as any,
      description,
      latitude: requestLat,
      longitude: requestLng,
      priority: priority as any,
    });
    if (success) {
      setShowCreateForm(false);
      setDescription('');
      setVehicleId(0);
    }
  }

  async function handleCancelConfirm(id: number) {
    if (!cancelReason.trim()) return;
    const success = await cancelRequest(id, cancelReason.trim());
    if (success) {
      setCancellingId(null);
      setCancelReason('');
    }
  }

  async function handleRate(e: React.FormEvent, id: number) {
    e.preventDefault();
    const success = await rateRequest(id, customerRating, punctualityRating, serviceQualityRating, feedback || undefined);
    if (success) {
      setShowRateForm(null);
      setCustomerRating(5); setPunctualityRating(5); setServiceQualityRating(5); setFeedback('');
    }
  }

  const RatingInput = ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="text-xs font-medium text-gray-400">{label}</label>
        <span className="text-yellow-400 font-bold">{'★'.repeat(value)}{'☆'.repeat(5 - value)}</span>
      </div>
      <input
        type="range" min={1} max={5} value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full accent-yellow-400"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      {/* Notificación de cambio de estado (toast en pantalla, no bloqueante) */}
      {statusChangeBanner && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-blue-600 border border-blue-500 rounded-lg shadow-lg text-white text-sm font-medium flex items-center gap-2 animate-pulse">
          🔔 {statusChangeBanner}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Mis Solicitudes</h1>
          <Link to="/dashboard" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700">
            ← Dashboard
          </Link>
        </div>

        {error && !showCreateForm && cancellingId === null && showRateForm === null && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">{error}</div>
        )}

        {isLoading && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <p className="text-gray-400">Cargando solicitudes...</p>
          </div>
        )}

        {!isLoading && requests.length === 0 && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
            <p className="text-gray-400 mb-4">Aún no tienes solicitudes de servicio.</p>
            <button onClick={handleOpenCreateForm} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              Crear tu primera solicitud
            </button>
          </div>
        )}

        {!isLoading && requests.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2 flex-wrap gap-3">
              <p className="text-gray-400 text-sm">{filteredRequests.length} solicitud(es)</p>
              <button onClick={handleOpenCreateForm} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
                + Nueva Solicitud
              </button>
            </div>

            {/* Filtro de estado */}
            <div className="flex flex-wrap gap-2 mb-2">
              {(['all', 'pending', 'assigned', 'in_progress', 'completed', 'cancelled'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    statusFilter === status
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {status === 'all' ? 'Todos' : STATUS_CONFIG[status].label}
                </button>
              ))}
            </div>

            {filteredRequests.length === 0 && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
                <p className="text-gray-400">No hay solicitudes con este estado.</p>
              </div>
            )}

            {filteredRequests.map((request) => {
              const statusCfg = STATUS_CONFIG[request.status] ?? STATUS_CONFIG['pending'];
              return (
                <div key={request.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-lg font-bold text-white">
                          {EMERGENCY_LABELS[request.emergencyType] ?? request.emergencyType}
                        </h3>
                        <span className={`px-2 py-0.5 border rounded-full text-xs font-medium ${statusCfg.cls}`}>
                          {statusCfg.label}
                        </span>
                        <span className="px-2 py-0.5 bg-gray-700 border border-gray-600 rounded-full text-xs text-gray-300">
                          {PRIORITY_LABELS[request.priority] ?? request.priority}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs mb-1">{request.serviceCode}</p>
                      <p className="text-gray-300 text-sm mb-2">{request.description}</p>
                      <p className="text-gray-500 text-xs">
                        Solicitado: {new Date(request.requestedAt).toLocaleString('es-CO')}
                      </p>
                      {request.finalCost && (
                        <p className="text-green-400 text-sm font-medium mt-1">
                          Costo: COP ${request.finalCost.toLocaleString('es-CO')}
                        </p>
                      )}
                      {request.customerRating && (
                        <p className="text-yellow-400 text-sm mt-1">
                          Tu calificación: {'★'.repeat(request.customerRating)}{'☆'.repeat(5 - request.customerRating)}
                        </p>
                      )}

                      {['assigned', 'in_progress', 'completed'].includes(request.status) && request.mechanicFirstName && (
                        <div className="mt-3 p-3 bg-blue-900/20 border border-blue-800/50 rounded-lg">
                          <p className="text-xs text-blue-300 uppercase tracking-wide mb-1">Mecánico asignado</p>
                          <p className="text-white font-medium">
                            {request.mechanicFirstName} {request.mechanicLastName}
                          </p>
                          {request.mechanicPhone && (
                            <a
                              href={`tel:${request.mechanicPhone}`}
                              className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-sm mt-1"
                            >
                              📞 {request.mechanicPhone}
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4 flex-shrink-0">
                      {['pending', 'assigned'].includes(request.status) && (
                        <button
                          onClick={() => { clearError(); setCancellingId(request.id); setCancelReason(''); }}
                          className="px-3 py-1.5 bg-red-900/40 hover:bg-red-900/70 border border-red-800 text-red-300 text-sm rounded-lg transition-colors"
                        >
                          Cancelar
                        </button>
                      )}
                      {request.status === 'completed' && !request.customerRating && (
                        <button
                          onClick={() => { clearError(); setShowRateForm(request.id); }}
                          className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg transition-colors"
                        >
                          Calificar
                        </button>
                      )}
                      {['assigned', 'in_progress', 'completed'].includes(request.status) && (
                        <button
                          onClick={() => handleToggleEvidences(request.id)}
                          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-200 text-sm rounded-lg transition-colors"
                        >
                          {showEvidencesFor === request.id ? 'Ocultar evidencias' : 'Ver evidencias'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Evidencias fotográficas (solo lectura) */}
                  {showEvidencesFor === request.id && (
                    <div className="mt-4 p-4 bg-gray-700/60 border border-gray-600 rounded-lg">
                      <h4 className="text-white font-semibold mb-4">Evidencias fotográficas</h4>
                      {evidenceLoading && !evidencesByRequest[request.id] ? (
                        <p className="text-gray-400 text-sm">Cargando evidencias...</p>
                      ) : (
                        <EvidenceUpload
                          serviceRequestId={request.id}
                          existingEvidences={evidencesByRequest[request.id] ?? []}
                          readOnly
                        />
                      )}
                    </div>
                  )}

                  {/* Formulario de calificación */}
                  {showRateForm === request.id && (
                    <form onSubmit={(e) => handleRate(e, request.id)} className="mt-4 p-4 bg-gray-700/60 border border-gray-600 rounded-lg">
                      <h4 className="text-white font-semibold mb-4">Calificar el servicio</h4>
                      {error && (
                        <div className="mb-3 p-2.5 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-xs">{error}</div>
                      )}
                      <div className="space-y-3 mb-4">
                        <RatingInput label="Calidad general (1-5)" value={customerRating} onChange={setCustomerRating} />
                        <FieldError name="customer_rating" />
                        <RatingInput label="Puntualidad (1-5)" value={punctualityRating} onChange={setPunctualityRating} />
                        <FieldError name="punctuality_rating" />
                        <RatingInput label="Calidad del servicio (1-5)" value={serviceQualityRating} onChange={setServiceQualityRating} />
                        <FieldError name="service_quality_rating" />
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">Comentario (opcional)</label>
                          <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className={(fieldErrorFor('customer_feedback') ? inputErrorCls : inputCls) + ' resize-none'}
                            rows={2}
                            placeholder="¿Cómo fue tu experiencia?"
                          />
                          <FieldError name="customer_feedback" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" disabled={isLoading} className="flex-1 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors">
                          {isLoading ? 'Enviando...' : 'Enviar calificación'}
                        </button>
                        <button type="button" onClick={() => { clearError(); setShowRateForm(null); }} className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors">
                          Cancelar
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Modal crear solicitud */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-lg w-full shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-2">Nueva Solicitud de Servicio</h2>
              <p className="text-xs text-gray-400 mb-4">
                {locatingUser
                  ? '📍 Detectando tu ubicación...'
                  : usedRealLocation
                    ? '📍 Se usará tu ubicación actual para conectarte con mecánicos cercanos.'
                    : '📍 No se pudo detectar tu ubicación exacta; se usará una ubicación aproximada.'}
              </p>
              {error && (
                <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">{error}</div>
              )}
              {vehicles.length === 0 ? (
                <div className="p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg text-center">
                  <p className="text-yellow-200 text-sm mb-3">
                    Necesitas registrar al menos un vehículo antes de crear una solicitud.
                  </p>
                  <Link
                    to="/vehicles"
                    className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                  >
                    Agregar un vehículo
                  </Link>
                </div>
              ) : (
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Vehículo *</label>
                  <select required value={vehicleId} onChange={(e) => setVehicleId(parseInt(e.target.value))} className={fieldErrorFor('vehicle_id') ? inputErrorCls : inputCls}>
                    <option value="0">Selecciona un vehículo</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>{v.make} {v.model} — {v.licensePlate}</option>
                    ))}
                  </select>
                  <FieldError name="vehicle_id" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Tipo de emergencia *</label>
                  <select required value={emergencyType} onChange={(e) => setEmergencyType(e.target.value)} className={fieldErrorFor('emergency_type') ? inputErrorCls : inputCls}>
                    {Object.entries(EMERGENCY_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                  <FieldError name="emergency_type" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Descripción *</label>
                  <textarea required value={description} onChange={(e) => setDescription(e.target.value)}
                    className={(fieldErrorFor('description') ? inputErrorCls : inputCls) + ' resize-none'} rows={3} placeholder="Describe el problema con tu vehículo..." />
                  <FieldError name="description" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Prioridad</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)} className={fieldErrorFor('priority') ? inputErrorCls : inputCls}>
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgente</option>
                    <option value="critical">Crítica</option>
                  </select>
                  <FieldError name="priority" />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="submit" disabled={isLoading || locatingUser || vehicleId === 0}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors">
                    {locatingUser ? 'Detectando ubicación...' : isLoading ? 'Creando...' : 'Crear Solicitud'}
                  </button>
                  <button type="button" onClick={() => { clearError(); setShowCreateForm(false); }}
                    className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                    Cancelar
                  </button>
                </div>
              </form>
              )}
            </div>
          </div>
        )}

        {/* Modal cancelar solicitud */}
        {cancellingId !== null && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-2">Cancelar Solicitud</h2>
              <p className="text-gray-400 text-sm mb-4">Por favor indica el motivo de cancelación.</p>
              {error && (
                <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">{error}</div>
              )}
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className={(fieldErrorFor('cancellation_reason') ? inputErrorCls : inputCls) + ' resize-none mb-1'}
                rows={3}
                placeholder="Motivo de cancelación..."
              />
              <div className="mb-4"><FieldError name="cancellation_reason" /></div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleCancelConfirm(cancellingId)}
                  disabled={isLoading || !cancelReason.trim()}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                >
                  {isLoading ? 'Cancelando...' : 'Confirmar cancelación'}
                </button>
                <button onClick={() => { clearError(); setCancellingId(null); setCancelReason(''); }}
                  className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                  Volver
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
