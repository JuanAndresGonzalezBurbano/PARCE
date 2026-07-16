import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendientes',
  assigned: 'Asignadas',
  in_progress: 'En progreso',
  completed: 'Completadas',
  cancelled: 'Canceladas',
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const { stats, loadDashboard, isLoading, error } = useAdmin();

  useEffect(() => { loadDashboard(); }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Bienvenida */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">
                Panel de Administración
              </h1>
              <p className="text-gray-400">{user.email}</p>
              <p className="text-sm text-gray-500 mt-1">
                Bienvenido, {user.firstName} {user.lastName}
              </p>
            </div>
            <div className="hidden sm:flex items-center justify-center w-14 h-14 bg-amber-600/20 border border-amber-600/40 rounded-full">
              <span className="text-amber-400 text-xl font-bold">
                {user.firstName.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">{error}</div>
        )}

        {isLoading && !stats && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
            <p className="text-gray-400">Cargando métricas...</p>
          </div>
        )}

        {/* Métricas generales */}
        {stats && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                <p className="text-xs text-gray-400 mt-1">Usuarios totales</p>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-yellow-400">
                  {stats.averageRating !== null ? stats.averageRating.toFixed(1) : '—'}
                  {stats.averageRating !== null && <span className="text-sm ml-0.5">★</span>}
                </p>
                <p className="text-xs text-gray-400 mt-1">Calificación promedio</p>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-white">{stats.totalPqr}</p>
                <p className="text-xs text-gray-400 mt-1">Tickets PQR</p>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
                <p className={`text-2xl font-bold ${stats.pendingPqr > 0 ? 'text-yellow-400' : 'text-white'}`}>
                  {stats.pendingPqr}
                </p>
                <p className="text-xs text-gray-400 mt-1">PQR pendientes</p>
              </div>
            </div>

            {/* Solicitudes por estado */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-white mb-4">Solicitudes de servicio por estado</h2>
              {stats.requestsByStatus.length === 0 ? (
                <p className="text-gray-400 text-sm">Aún no hay solicitudes de servicio registradas.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {stats.requestsByStatus.map((row) => (
                    <div key={row.status} className="text-center">
                      <p className="text-xl font-bold text-white">{row.total}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {STATUS_LABELS[row.status] ?? row.status}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Cards de navegación */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/admin/pqr"
            className="group bg-gray-800 border border-gray-700 hover:border-amber-600 rounded-lg p-6 transition-colors"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center justify-center w-12 h-12 bg-amber-600/20 border border-amber-600/40 rounded-lg group-hover:bg-amber-600/30 transition-colors">
                <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-6l-4 4v-4z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Gestión de PQR</h2>
                <p className="text-gray-400 text-sm">Peticiones, quejas, reclamos y sugerencias</p>
              </div>
            </div>
            <p className="text-gray-500 text-sm">Revisa, responde y actualiza el estado de los tickets.</p>
          </Link>

          <Link
            to="/admin/surveys"
            className="group bg-gray-800 border border-gray-700 hover:border-amber-600 rounded-lg p-6 transition-colors"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center justify-center w-12 h-12 bg-amber-600/20 border border-amber-600/40 rounded-lg group-hover:bg-amber-600/30 transition-colors">
                <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Encuestas</h2>
                <p className="text-gray-400 text-sm">Satisfacción de clientes</p>
              </div>
            </div>
            <p className="text-gray-500 text-sm">Consulta las encuestas enviadas por los clientes.</p>
          </Link>

          <Link
            to="/admin/ratings"
            className="group bg-gray-800 border border-gray-700 hover:border-amber-600 rounded-lg p-6 transition-colors"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center justify-center w-12 h-12 bg-amber-600/20 border border-amber-600/40 rounded-lg group-hover:bg-amber-600/30 transition-colors">
                <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Calificaciones</h2>
                <p className="text-gray-400 text-sm">Historial de servicios calificados</p>
              </div>
            </div>
            <p className="text-gray-500 text-sm">Filtra por mecánico, cliente o calificación mínima.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
