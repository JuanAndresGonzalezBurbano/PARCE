import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRequests } from '@/hooks/useRequests';

const EMERGENCY_LABELS: Record<string, string> = {
  tire: 'Llanta pinchada', battery: 'Batería descargada', fuel: 'Sin combustible',
  engine: 'Falla de motor', lockout: 'Puertas bloqueadas', tow: 'Necesito grúa', other: 'Otro',
};

const PRIORITY_CONFIG: Record<string, { label: string; cls: string }> = {
  urgent: { label: 'Urgente', cls: 'bg-red-900/50 border-red-700 text-red-200' },
  normal: { label: 'Normal',  cls: 'bg-blue-900/50 border-blue-700 text-blue-200' },
  low:    { label: 'Baja',    cls: 'bg-gray-700 border-gray-600 text-gray-300' },
};

export default function AvailableRequestsPage() {
  const navigate = useNavigate();
  const { requests, isLoading, error, loadAvailableRequests, acceptRequest } = useRequests();
  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  useEffect(() => {
    // Usar geolocalización del navegador; fallback a Bogotá
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => loadAvailableRequests(pos.coords.latitude, pos.coords.longitude),
        () => loadAvailableRequests(4.7110, -74.0721),
        { timeout: 5000 }
      );
    } else {
      loadAvailableRequests(4.7110, -74.0721);
    }
  }, []);

  async function handleAccept(id: number) {
    setAcceptingId(id);
    const success = await acceptRequest(id);
    setAcceptingId(null);
    setConfirmingId(null);
    if (success) {
      navigate('/mechanic/requests');
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Solicitudes Disponibles</h1>
          <Link to="/mechanic/dashboard" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700">
            ← Dashboard
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">{error}</div>
        )}

        {isLoading && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <p className="text-gray-400">Buscando solicitudes en tu área...</p>
          </div>
        )}

        {!isLoading && requests.length === 0 && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
            <p className="text-gray-400 mb-2">No hay solicitudes disponibles en tu área.</p>
            <p className="text-gray-500 text-sm">Vuelve más tarde o amplía tu radio de búsqueda.</p>
          </div>
        )}

        {!isLoading && requests.length > 0 && (
          <div className="space-y-4">
            <p className="text-gray-400 text-sm mb-2">{requests.length} solicitud(es) disponible(s)</p>

            {requests.map((request) => {
              const priorityCfg = PRIORITY_CONFIG[request.priority] ?? PRIORITY_CONFIG['normal'];
              return (
                <div key={request.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0 mr-4">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="text-lg font-bold text-white">
                          {EMERGENCY_LABELS[request.emergencyType] ?? request.emergencyType}
                        </h3>
                        <span className={`px-2 py-0.5 border rounded-full text-xs font-medium ${priorityCfg.cls}`}>
                          {priorityCfg.label}
                        </span>
                      </div>

                      <p className="text-gray-500 text-xs mb-1">{request.serviceCode}</p>
                      <p className="text-gray-300 text-sm mb-3">{request.description}</p>

                      {request.vehicleMake && (
                        <p className="text-gray-400 text-sm mb-2">
                          <span className="text-gray-500">Vehículo:</span>{' '}
                          {request.vehicleMake} {request.vehicleModel} ({request.vehicleYear})
                        </p>
                      )}

                      <div className="text-gray-500 text-xs space-y-0.5">
                        <p>Solicitado: {new Date(request.requestedAt).toLocaleString('es-CO')}</p>
                        {request.latitudeApproximate != null && request.longitudeApproximate != null && (
                          <p>Ubicación aproximada: {request.latitudeApproximate}, {request.longitudeApproximate}</p>
                        )}
                      </div>
                    </div>

                    {/* Botón aceptar con confirmación in-page */}
                    <div className="flex-shrink-0">
                      {confirmingId === request.id ? (
                        <div className="flex flex-col gap-2 text-center">
                          <p className="text-sm text-white font-medium">¿Aceptar solicitud?</p>
                          <button
                            onClick={() => handleAccept(request.id)}
                            disabled={acceptingId === request.id}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            {acceptingId === request.id ? 'Aceptando...' : 'Confirmar'}
                          </button>
                          <button
                            onClick={() => setConfirmingId(null)}
                            disabled={acceptingId === request.id}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmingId(request.id)}
                          disabled={isLoading}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          Aceptar solicitud
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
