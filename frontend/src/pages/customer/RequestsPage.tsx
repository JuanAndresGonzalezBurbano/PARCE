import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useRequests } from '@/hooks/useRequests';
import { useVehicles } from '@/hooks/useVehicles';
import { serviceRequestService } from '@/services/serviceRequestService';
import EvidenceUpload from '@/components/vehicles/EvidenceUpload';
import type { ServiceRequestEvidence } from '@/types/serviceRequest';

const EMERGENCY_LABELS: Record<string, string> = {
  tire: 'Llanta pinchada', battery: 'Batería descargada', fuel: 'Sin combustible',
  engine: 'Falla de motor', lockout: 'Puertas bloqueadas', tow: 'Necesito grúa', other: 'Otro',
};

const PRIORITY_LABELS: Record<string, string> = { low: 'Baja', normal: 'Normal', urgent: 'Urgente' };

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
  const { requests, isLoading, error, fieldErrors, loadRequests, createRequest, cancelRequest, rateRequest, clearError } = useRequests();
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

  // Form calificar (3 ratings)
  const [customerRating, setCustomerRating] = useState(5);
  const [punctualityRating, setPunctualityRating] = useState(5);
  const [serviceQualityRating, setServiceQualityRating] = useState(5);
  const [feedback, setFeedback] = useState('');

  // Evidencias fotográficas (solo lectura para el cliente)
  const [showEvidencesFor, setShowEvidencesFor] = useState<number | null>(null);
  const [evidencesByRequest, setEvidencesByRequest] = useState<Record<number, ServiceRequestEvidence[]>>({});
  const [evidenceLoading, setEvidenceLoading] = useState(false);

  useEffect(() => { loadRequests(); loadVehicles(); }, []);

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

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const success = await createRequest({
      vehicle_id: vehicleId,
      emergency_type: emergencyType as any,
      description,
      latitude: 4.7110,
      longitude: -74.0721,
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
            <button onClick={() => { clearError(); setShowCreateForm(true); }} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              Crear tu primera solicitud
            </button>
          </div>
        )}

        {!isLoading && requests.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-gray-400 text-sm">{requests.length} solicitud(es)</p>
              <button onClick={() => { clearError(); setShowCreateForm(true); }} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
                + Nueva Solicitud
              </button>
            </div>

            {requests.map((request) => {
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
                    </div>

                    <div className="flex gap-2 ml-4 flex-shrink-0">
                      {request.status === 'pending' && (
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
              <h2 className="text-xl font-bold text-white mb-4">Nueva Solicitud de Servicio</h2>
              {error && (
                <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">{error}</div>
              )}
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
                    <option value="low">Baja</option>
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgente</option>
                  </select>
                  <FieldError name="priority" />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="submit" disabled={isLoading || vehicleId === 0}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors">
                    {isLoading ? 'Creando...' : 'Crear Solicitud'}
                  </button>
                  <button type="button" onClick={() => { clearError(); setShowCreateForm(false); }}
                    className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                    Cancelar
                  </button>
                </div>
              </form>
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
