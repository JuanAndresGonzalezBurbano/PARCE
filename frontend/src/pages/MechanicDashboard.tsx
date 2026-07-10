import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

export default function MechanicDashboard() {
  const { user } = useAuth();

  if (!user) return null;

  // Verificar estado de la licencia de conducción si el tipo de usuario lo tiene
  const driverLicense = (user as any).driverLicense;
  const licenseStatus = driverLicense?.status as string | undefined;

  const licenseExpired = licenseStatus === 'expired';
  const licenseExpiringSoon = licenseStatus === 'expiring_soon';
  const showLicenseWarning = licenseExpired || licenseExpiringSoon;

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Aviso de licencia vencida o por vencer */}
        {showLicenseWarning && (
          <div
            className={`mb-6 p-4 rounded-lg border flex items-start gap-3 ${
              licenseExpired
                ? 'bg-red-900/40 border-red-700 text-red-200'
                : 'bg-yellow-900/40 border-yellow-700 text-yellow-200'
            }`}
          >
            <svg
              className="w-5 h-5 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>
            <div>
              <p className="font-semibold">
                {licenseExpired ? 'Licencia de conducción vencida' : 'Licencia próxima a vencer'}
              </p>
              <p className="text-sm mt-0.5">
                {licenseExpired
                  ? 'Tu licencia de conducción ha vencido. Actualízala en tu perfil para continuar operando.'
                  : 'Tu licencia de conducción está próxima a vencer. Renuévala pronto para evitar interrupciones.'}
              </p>
              <Link
                to="/profile"
                className="inline-block mt-2 text-sm underline hover:no-underline"
              >
                Actualizar en mi perfil
              </Link>
            </div>
          </div>
        )}

        {/* Bienvenida */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">
                Bienvenido, {user.firstName} {user.lastName}
              </h1>
              <p className="text-gray-400">{user.email}</p>
              <p className="text-sm text-gray-500 mt-1">
                Panel de mecánico – PARCE Asistencia Vial
              </p>
            </div>
            <div className="hidden sm:flex items-center justify-center w-14 h-14 bg-purple-600/20 border border-purple-600/40 rounded-full">
              <span className="text-purple-400 text-xl font-bold">
                {user.firstName.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Cards de navegación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Solicitudes Disponibles */}
          <Link
            to="/mechanic/available"
            className="group bg-gray-800 border border-gray-700 hover:border-blue-600 rounded-lg p-6 transition-colors"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-600/20 border border-blue-600/40 rounded-lg group-hover:bg-blue-600/30 transition-colors">
                <svg
                  className="w-6 h-6 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Solicitudes Disponibles</h2>
                <p className="text-gray-400 text-sm">Ver solicitudes cercanas a tu ubicación</p>
              </div>
            </div>
            <p className="text-gray-500 text-sm">
              Explora y acepta solicitudes de asistencia vial en tu zona.
            </p>
          </Link>

          {/* Mis Solicitudes Activas */}
          <Link
            to="/mechanic/requests"
            className="group bg-gray-800 border border-gray-700 hover:border-purple-600 rounded-lg p-6 transition-colors"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-600/20 border border-purple-600/40 rounded-lg group-hover:bg-purple-600/30 transition-colors">
                <svg
                  className="w-6 h-6 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Mis Solicitudes Activas</h2>
                <p className="text-gray-400 text-sm">Gestiona tus solicitudes asignadas</p>
              </div>
            </div>
            <p className="text-gray-500 text-sm">
              Consulta y actualiza el estado de los trabajos que tienes en curso o completados.
            </p>
          </Link>
        </div>

        {/* Acceso rápido al perfil */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">Mi Perfil</p>
              <p className="text-gray-400 text-sm">
                Actualiza tu información, licencia y datos de operación
              </p>
            </div>
            <Link
              to="/profile"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
            >
              Ver perfil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
