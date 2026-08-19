import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMechanicApplication } from '@/hooks/useMechanicApplication';
import { MECHANIC_APPLICATION_STATUS_CONFIG as STATUS_CONFIG } from '@/constants/mechanicApplication';
import { fieldErrorFor as sharedFieldErrorFor } from '@/utils/apiErrors';

const MIN_JUSTIFICATION_LENGTH = 20;
const MAX_JUSTIFICATION_LENGTH = 2000;

export default function MechanicApplicationPage() {
  const { user } = useAuth();
  const { myApplications, isLoading, error, fieldErrors, loadMyApplications, createApplication, cancelApplication } =
    useMechanicApplication();

  const [justification, setJustification] = useState('');
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    loadMyApplications();
  }, []);

  function fieldErrorFor(name: string): string | undefined {
    return sharedFieldErrorFor(fieldErrors, name);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const success = await createApplication(justification.trim());
    if (success) {
      setJustification('');
    }
  }

  async function handleCancel(id: number) {
    setCancellingId(id);
    await cancelApplication(id);
    setCancellingId(null);
  }

  if (!user) return null;

  const isAlreadyMechanic = user.roles.includes('mechanic');
  // Los administradores no pueden solicitar el rol de mecánico — regla de
  // negocio real en MechanicApplicationService::create() (rechaza con 403).
  // Esto solo evita mostrar un formulario que el backend rechazaría; la
  // autoridad sigue siendo del backend, no de esta comprobación.
  const isAdmin = user.roles.includes('administrator') || user.roles.includes('super_admin');
  const latest = myApplications[0] ?? null;
  const hasPendingApplication = latest?.status === 'pending';

  // El usuario puede volver a solicitar si nunca ha aplicado, o si su última
  // solicitud terminó en rejected/cancelled. No puede si tiene una pending
  // (el backend ya lo rechazaría con 409), si ya es mecánico, ni si es admin.
  const canApply = !isAlreadyMechanic && !isAdmin && !hasPendingApplication;

  const licenseStatus = user.driverLicense?.status ?? 'not_set';
  const licenseIsUsable = licenseStatus === 'valid' || licenseStatus === 'expiring_soon';

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Convertirme en mecánico</h1>
          <Link to="/dashboard" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700">
            ← Dashboard
          </Link>
        </div>

        {isAlreadyMechanic && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center mb-6">
            <p className="text-green-300 text-lg font-semibold mb-2">✓ Ya eres mecánico en P.A.R.C.E</p>
            <p className="text-gray-400 text-sm">
              Puedes gestionar tus solicitudes de servicio desde tu{' '}
              <Link to="/mechanic/dashboard" className="text-blue-400 hover:underline">panel de mecánico</Link>.
            </p>
          </div>
        )}

        {isAdmin && !isAlreadyMechanic && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center mb-6">
            <p className="text-gray-300 text-sm">
              Las cuentas administrativas no pueden solicitar el rol de mecánico.
            </p>
          </div>
        )}

        {!isAlreadyMechanic && !isAdmin && (
          <>
            {/* Requisitos de licencia */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-5 mb-6">
              <h2 className="text-base font-semibold text-white mb-3">Requisitos</h2>
              <p className="text-sm text-gray-400 mb-3">
                Para solicitar el rol de mecánico necesitas tener registrada en tu perfil una licencia de
                conducción con número, fecha de vencimiento y documento — y que no esté vencida.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">Estado actual de tu licencia:</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                    licenseIsUsable
                      ? 'bg-green-900/50 border-green-700 text-green-200'
                      : 'bg-red-900/50 border-red-700 text-red-200'
                  }`}
                >
                  {licenseStatus === 'not_set' && 'Sin registrar'}
                  {licenseStatus === 'valid' && 'Vigente'}
                  {licenseStatus === 'expiring_soon' && 'Por vencer'}
                  {licenseStatus === 'expired' && 'Vencida'}
                </span>
              </div>

              {!licenseIsUsable && (
                <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-800/50 rounded-lg">
                  <p className="text-yellow-200 text-sm mb-2">
                    Debes completar o actualizar tu licencia de conducción antes de poder solicitar ser mecánico.
                  </p>
                  <Link
                    to="/profile"
                    className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Ir a completar mi perfil →
                  </Link>
                </div>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">{error}</div>
            )}

            {/* Formulario de solicitud */}
            {licenseIsUsable && canApply && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-5 mb-6">
                <h2 className="text-base font-semibold text-white mb-3">
                  {myApplications.length === 0 ? 'Enviar solicitud' : 'Enviar una nueva solicitud'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Cuéntanos tu experiencia como mecánico *
                    </label>
                    <textarea
                      required
                      value={justification}
                      onChange={(e) => setJustification(e.target.value)}
                      minLength={MIN_JUSTIFICATION_LENGTH}
                      maxLength={MAX_JUSTIFICATION_LENGTH}
                      rows={4}
                      placeholder="Describe tu experiencia, certificaciones o especialidad (mínimo 20 caracteres)..."
                      className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 resize-none ${
                        fieldErrorFor('justification') ? 'border-red-600 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                      }`}
                    />
                    <div className="flex justify-between mt-1">
                      {fieldErrorFor('justification') ? (
                        <p className="text-red-400 text-xs">{fieldErrorFor('justification')}</p>
                      ) : (
                        <p className="text-gray-500 text-xs">Mínimo {MIN_JUSTIFICATION_LENGTH} caracteres</p>
                      )}
                      <p className="text-gray-500 text-xs">{justification.length}/{MAX_JUSTIFICATION_LENGTH}</p>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || justification.trim().length < MIN_JUSTIFICATION_LENGTH}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    {isLoading ? 'Enviando...' : 'Enviar solicitud'}
                  </button>
                </form>
              </div>
            )}

            {/* Historial de solicitudes */}
            <div>
              <h2 className="text-base font-semibold text-white mb-3">Tus solicitudes</h2>

              {isLoading && myApplications.length === 0 && (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <p className="text-gray-400 text-sm">Cargando...</p>
                </div>
              )}

              {!isLoading && myApplications.length === 0 && (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
                  <p className="text-gray-400 text-sm">Aún no has enviado ninguna solicitud.</p>
                </div>
              )}

              <div className="space-y-3">
                {myApplications.map((app) => {
                  const statusCfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.pending;
                  const isBusy = cancellingId === app.id;
                  return (
                    <div key={app.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className={`px-2 py-0.5 border rounded-full text-xs font-medium ${statusCfg.cls}`}>
                              {statusCfg.label}
                            </span>
                            <span className="text-gray-500 text-xs">
                              {new Date(app.createdAt).toLocaleString('es-CO')}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm">{app.justification}</p>
                          {app.status === 'rejected' && app.rejectionReason && (
                            <div className="mt-2 p-2 bg-red-900/20 border border-red-800/50 rounded-lg">
                              <p className="text-xs text-red-300 uppercase tracking-wide mb-1">Motivo del rechazo</p>
                              <p className="text-gray-200 text-sm">{app.rejectionReason}</p>
                            </div>
                          )}
                        </div>
                        {app.status === 'pending' && (
                          <button
                            onClick={() => handleCancel(app.id)}
                            disabled={isBusy}
                            className="px-3 py-1.5 bg-red-900/40 hover:bg-red-900/70 border border-red-800 text-red-300 text-sm rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
                          >
                            {isBusy ? 'Cancelando...' : 'Cancelar'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
