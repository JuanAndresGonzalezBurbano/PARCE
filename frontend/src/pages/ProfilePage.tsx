import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import DriverLicenseSection from '@/components/auth/DriverLicenseSection';
import PasswordSection from '@/components/auth/PasswordSection';

const ROLE_LABELS: Record<string, string> = {
  customer: 'Cliente',
  mechanic: 'Mecánico',
  admin: 'Administrador',
};

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'No disponible';
  return new Date(dateStr).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function ProfilePage() {
  const { user, isLoading, error, fieldErrors, clearError, updateProfile } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const isMechanic = user.roles.includes('mechanic');
  const isAdmin = user.roles.includes('administrator') || user.roles.includes('super_admin');
  const dashboardPath = isAdmin ? '/admin/dashboard' : isMechanic ? '/mechanic/dashboard' : '/dashboard';

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Mi Perfil</h1>
          <button
            onClick={() => navigate(dashboardPath)}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors border border-gray-700"
          >
            ← Volver al dashboard
          </button>
        </div>

        {/* User overview card */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-4">
            {/* Avatar placeholder */}
            <div className="w-16 h-16 rounded-full bg-blue-900/60 border border-blue-700 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-blue-300">
                {user.firstName.charAt(0).toUpperCase()}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-semibold text-white">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-gray-400 mt-1">{user.email}</p>

              {/* Roles */}
              <div className="flex flex-wrap gap-2 mt-3">
                {user.roles.map((role) => (
                  <span
                    key={role}
                    className="px-2 py-1 bg-blue-900/40 border border-blue-700 rounded text-xs text-blue-300 capitalize"
                  >
                    {ROLE_LABELS[role] ?? role}
                  </span>
                ))}
              </div>

              {/* Account meta */}
              <div className="flex flex-wrap gap-6 mt-4">
                {user.createdAt && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Miembro desde</p>
                    <p className="text-sm text-gray-300 mt-0.5">{formatDate(user.createdAt)}</p>
                  </div>
                )}
                {user.lastLoginAt && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Último acceso</p>
                    <p className="text-sm text-gray-300 mt-0.5">{formatDate(user.lastLoginAt)}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Estado</p>
                  <p className={`text-sm mt-0.5 capitalize ${
                    user.accountStatus === 'active' ? 'text-green-400' :
                    user.accountStatus === 'suspended' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {user.accountStatus === 'active' ? 'Activo' :
                     user.accountStatus === 'suspended' ? 'Suspendido' : 'Eliminado'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Personal data section */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Datos Personales</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Nombre</p>
              <p className="text-white">{user.firstName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Apellido</p>
              <p className="text-white">{user.lastName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Correo electrónico</p>
              <p className="text-white">{user.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Teléfono</p>
              <p className="text-white">{user.phone ?? <span className="text-gray-500">No registrado</span>}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Para actualizar tus datos personales, contacta al soporte de PARCE.
          </p>
        </div>

        {/* Driver license section — visible para cualquier usuario, no solo
            mecánicos: el sistema bloquea la aceptación de solicitudes si la
            licencia de un mecánico está vencida, pero además un cliente
            necesita poder completarla aquí ANTES de tener el rol, para poder
            solicitar convertirse en mecánico (ver /mechanic-application,
            que exige licencia completa y vigente ya en el perfil). El
            backend (PUT /auth/profile) ya acepta estos campos de cualquier
            rol autenticado — esto solo ajusta cuándo se muestra en la UI. */}
        <DriverLicenseSection
          license={user.driverLicense}
          onSave={updateProfile}
          isLoading={isLoading}
          error={error}
          fieldErrors={fieldErrors}
          clearError={clearError}
        />

        <div className="mt-6">
          <PasswordSection />
        </div>
      </div>
    </div>
  );
}
