import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

export default function CustomerDashboard() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Bienvenida */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">
                Bienvenido, {user.firstName} {user.lastName}
              </h1>
              <p className="text-gray-400">{user.email}</p>
              <p className="text-sm text-gray-500 mt-1">
                Plataforma de asistencia vial PARCE
              </p>
            </div>
            <div className="hidden sm:flex items-center justify-center w-14 h-14 bg-orange-600/20 border border-orange-600/40 rounded-full">
              <span className="text-orange-400 text-xl font-bold">
                {user.firstName.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Cards de navegación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Mis Vehículos */}
          <Link
            to="/vehicles"
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
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Mis Vehículos</h2>
                <p className="text-gray-400 text-sm">Administra tus vehículos registrados</p>
              </div>
            </div>
            <p className="text-gray-500 text-sm">
              Agrega, edita o elimina los vehículos asociados a tu cuenta.
            </p>
          </Link>

          {/* Mis Solicitudes */}
          <Link
            to="/requests"
            className="group bg-gray-800 border border-gray-700 hover:border-orange-600 rounded-lg p-6 transition-colors"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-600/20 border border-orange-600/40 rounded-lg group-hover:bg-orange-600/30 transition-colors">
                <svg
                  className="w-6 h-6 text-orange-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Mis Solicitudes</h2>
                <p className="text-gray-400 text-sm">Ver y crear solicitudes de asistencia</p>
              </div>
            </div>
            <p className="text-gray-500 text-sm">
              Solicita ayuda en carretera o consulta el estado de tus solicitudes activas.
            </p>
          </Link>
        </div>

        {/* Acceso rápido al perfil */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">Mi Perfil</p>
              <p className="text-gray-400 text-sm">
                Actualiza tu información personal y contraseña
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
