import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Edit2, EyeOff, UserCheck, UserX, ChevronDown, Loader2, AlertCircle } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../../controllers/AuthContext';
import { 
  adminService, 
  AdminUser, 
  AdminUserDetail, 
  AdminUsersFilters,
  mapAccountStatus, 
  mapStatusToBackend,
  formatUserName,
  getStatusLabel 
} from '../../../services/adminService';

type UserStatus = 'active' | 'inactive' | 'disabled';

export default function AdminUsersPage() {
  const { user } = useAuth();
  
  // Estados de datos
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  
  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | UserStatus>('all');
  const [viewUser, setViewUser] = useState<AdminUserDetail | null>(null);
  const [showDisableModal, setShowDisableModal] = useState<{ id: number; name: string } | null>(null);
  const [loadingUserDetail, setLoadingUserDetail] = useState<number | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  // Función para cargar usuarios
  const loadUsers = useCallback(async (filters: AdminUsersFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const finalFilters: AdminUsersFilters = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      };

      if (search.trim()) finalFilters.search = search.trim();
      if (filterStatus !== 'all') finalFilters.status = mapStatusToBackend(filterStatus);

      const response = await adminService.getUsers(finalFilters);

      if (response.success && response.data) {
        setUsers(response.data.users);
        setPagination(response.data.pagination);
      } else {
        setError(response.error || response.message || 'Error al cargar usuarios');
      }
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Error de conexión. Verifica que el servidor esté funcionando.');
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus, pagination.page, pagination.limit]);

  // Cargar usuarios al montar el componente y cuando cambien los filtros
  useEffect(() => {
    loadUsers();
  }, []);

  // Recargar cuando cambien filtros (con debounce para search)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 })); // Reset a página 1 cuando cambian filtros
      loadUsers({ page: 1 });
    }, search ? 500 : 0); // Debounce de 500ms para búsqueda

    return () => clearTimeout(timeoutId);
  }, [search, filterStatus]);

  // Función para ver detalles de usuario
  const handleViewUser = async (userId: number) => {
    try {
      setLoadingUserDetail(userId);
      setError(null);

      const response = await adminService.getUser(userId);

      if (response.success && response.data) {
        setViewUser(response.data);
      } else {
        setError(response.error || response.message || 'Error al cargar usuario');
      }
    } catch (err) {
      console.error('Error loading user detail:', err);
      setError('Error al cargar detalles del usuario');
    } finally {
      setLoadingUserDetail(null);
    }
  };

  // Función para cambiar estado de usuario
  const handleStatusChange = async (userId: number, newStatus: UserStatus) => {
    try {
      setUpdatingStatus(userId);
      setError(null);

      const backendStatus = mapStatusToBackend(newStatus);
      const response = await adminService.updateUserStatus(userId, backendStatus);

      if (response.success) {
        // Actualizar estado local
        setUsers(prev => prev.map(u => 
          u.id === userId 
            ? { ...u, accountStatus: backendStatus }
            : u
        ));
        
        // Cerrar modales
        setShowDisableModal(null);
      } else {
        setError(response.error || response.message || 'Error al actualizar estado');
      }
    } catch (err) {
      console.error('Error updating user status:', err);
      setError('Error al actualizar estado del usuario');
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Cambiar página
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    loadUsers({ page: newPage });
  };

  const statusBadge = (status: string) => {
    const mappedStatus = mapAccountStatus(status);
    const map = {
      active: 'bg-green-500/20 text-green-400',
      inactive: 'bg-yellow-500/20 text-yellow-400',
      disabled: 'bg-gray-500/20 text-gray-400 line-through',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[mappedStatus]}`}>
        {getStatusLabel(status)}
      </span>
    );
  };

  // Estadísticas calculadas
  const stats = {
    total: pagination.total,
    active: users.filter(u => u.accountStatus === 'active').length,
    inactive: users.filter(u => ['suspended', 'deactivated'].includes(u.accountStatus)).length,
    disabled: users.filter(u => u.accountStatus === 'deactivated').length,
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar isAuthenticated userName={user?.name || 'Admin'} hideNavLinks />
      <Sidebar />
      <main className="ml-64 pt-16 p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Gestión de Usuarios</h1>
              <p className="text-gray-400 text-sm mt-1">Administra las cuentas de conductores registrados</p>
            </div>
            <button className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> Nuevo Usuario
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
              <button 
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                ×
              </button>
            </div>
          )}

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                value={search} 
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nombre, email, cédula o teléfono..."
                className="input-field pl-9 text-sm"
                disabled={loading} 
              />
            </div>
            <div className="relative">
              <select 
                value={filterStatus} 
                onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}
                className="input-field pr-8 text-sm appearance-none"
                disabled={loading}
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
                <option value="disabled">Deshabilitados</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Total', value: stats.total, color: 'text-white' },
              { label: 'Activos', value: stats.active, color: 'text-green-400' },
              { label: 'Inactivos', value: stats.inactive, color: 'text-yellow-400' },
              { label: 'Deshabilitados', value: stats.disabled, color: 'text-gray-400' },
            ].map(stat => (
              <div key={stat.label} className="card p-4 text-center">
                <p className={`text-2xl font-bold ${stat.color}`}>
                  {loading ? '...' : stat.value}
                </p>
                <p className="text-gray-400 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Tabla */}
          <div className="card overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
                <span className="ml-3 text-gray-400">Cargando usuarios...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-anthracite-700">
                      <th className="text-left px-4 py-3 text-gray-400 font-medium">Usuario</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-medium">Teléfono</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-medium">Cédula</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-medium">Roles</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-medium">Estado</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-anthracite-800">
                    {users.map(u => {
                      const mappedStatus = mapAccountStatus(u.accountStatus);
                      const isDisabled = mappedStatus === 'disabled';
                      
                      return (
                        <tr key={u.id} className={`hover:bg-dark-800/40 transition-colors ${isDisabled ? 'opacity-50' : ''}`}>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-white font-medium">{formatUserName(u)}</p>
                              <p className="text-gray-500 text-xs">{u.email}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-300">{u.phone || '-'}</td>
                          <td className="px-4 py-3 text-gray-300 font-mono">{u.idNumber || '-'}</td>
                          <td className="px-4 py-3 text-gray-300">
                            {u.roles.length > 0 ? u.roles.join(', ') : '-'}
                          </td>
                          <td className="px-4 py-3">{statusBadge(u.accountStatus)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {/* Ver detalles */}
                              <button 
                                onClick={() => handleViewUser(u.id)}
                                disabled={loadingUserDetail === u.id}
                                className="p-1.5 hover:bg-dark-700 rounded-lg transition-colors text-gray-400 hover:text-gold-400 disabled:opacity-50" 
                                title="Ver detalles"
                              >
                                {loadingUserDetail === u.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Search className="w-4 h-4" />
                                )}
                              </button>
                              
                              {!isDisabled ? (
                                <>
                                  <button className="p-1.5 hover:bg-dark-700 rounded-lg transition-colors text-gray-400 hover:text-gold-400" title="Editar">
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => setShowDisableModal({ id: u.id, name: formatUserName(u) })}
                                    disabled={updatingStatus === u.id}
                                    className="p-1.5 hover:bg-dark-700 rounded-lg transition-colors text-gray-400 hover:text-gray-300 disabled:opacity-50" 
                                    title="Deshabilitar"
                                  >
                                    {updatingStatus === u.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <EyeOff className="w-4 h-4" />
                                    )}
                                  </button>
                                </>
                              ) : (
                                <button 
                                  onClick={() => handleStatusChange(u.id, 'active')}
                                  disabled={updatingStatus === u.id}
                                  className="p-1.5 hover:bg-dark-700 rounded-lg transition-colors text-gray-400 hover:text-green-400 disabled:opacity-50" 
                                  title="Restaurar"
                                >
                                  {updatingStatus === u.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <UserCheck className="w-4 h-4" />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                
                {users.length === 0 && !loading && (
                  <div className="text-center py-12 text-gray-500">
                    <UserX className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No se encontraron usuarios</p>
                  </div>
                )}
              </div>
            )}

            {/* Paginación */}
            {pagination.totalPages > 1 && (
              <div className="border-t border-anthracite-700 px-4 py-3 flex items-center justify-between text-sm">
                <p className="text-gray-400">
                  Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} usuarios
                </p>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrev || loading}
                    className="px-3 py-1 bg-dark-700 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    Anterior
                  </button>
                  <span className="text-gray-400">
                    Página {pagination.page} de {pagination.totalPages}
                  </span>
                  <button 
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNext || loading}
                    className="px-3 py-1 bg-dark-700 hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </main>

      {/* Modal ver usuario */}
      {viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setViewUser(null)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            onClick={e => e.stopPropagation()}
            className="card p-6 max-w-lg w-full mx-4 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white border-b border-anthracite-700 pb-3">Perfil del Usuario</h3>

            <div>
              <p className="text-xs text-gold-400 uppercase tracking-wider font-semibold mb-2">Información Personal</p>
              <div className="space-y-1 text-sm">
                {[
                  ['Nombre completo', formatUserName(viewUser)],
                  ['Email', viewUser.email],
                  ['Teléfono', viewUser.phone || 'No registrado'],
                  ['Cédula', viewUser.idNumber || 'No registrada'],
                  ['Licencia de conducción', viewUser.driverLicense.number || 'No registrada'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-1.5 border-b border-anthracite-800/50">
                    <span className="text-gray-400">{label}</span>
                    <span className="text-white font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {viewUser.vehicles && viewUser.vehicles.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Vehículos</p>
                {viewUser.vehicles.map((vehicle, idx) => (
                  <div key={vehicle.id} className="mb-3">
                    <p className="text-xs text-gold-400 mb-1">
                      Vehículo {idx + 1} {vehicle.isPrimary && '(Principal)'}
                    </p>
                    <div className="space-y-1 text-sm">
                      {[
                        ['Placa', vehicle.licensePlate],
                        ['Marca / Modelo', `${vehicle.make} ${vehicle.model}`],
                        ['Año', String(vehicle.year)],
                        ['Color', vehicle.color],
                        ['SOAT', vehicle.soat.number || 'No registrado'],
                        ['Tecnomecánica', vehicle.tecnomecanica.number || 'No registrada'],
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between py-1.5 border-b border-anthracite-800/50">
                          <span className="text-gray-400">{label}</span>
                          <span className="text-white font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {viewUser.mechanicCertification.title && (
              <div>
                <p className="text-xs text-gold-400 uppercase tracking-wider font-semibold mb-2">Certificación</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between py-1.5 border-b border-anthracite-800/50">
                    <span className="text-gray-400">Título</span>
                    <span className="text-white font-medium">{viewUser.mechanicCertification.title}</span>
                  </div>
                </div>
              </div>
            )}

            <div>
              <p className="text-xs text-gold-400 uppercase tracking-wider font-semibold mb-2">Actividad</p>
              <div className="space-y-1 text-sm">
                {[
                  ['Roles', viewUser.roles.join(', ')],
                  ['Registrado', new Date(viewUser.createdAt).toLocaleDateString('es-CO')],
                  ['Último ingreso', viewUser.lastLoginAt ? new Date(viewUser.lastLoginAt).toLocaleDateString('es-CO') : 'Nunca'],
                  ['Estado', getStatusLabel(viewUser.accountStatus)],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-1.5 border-b border-anthracite-800/50">
                    <span className="text-gray-400">{label}</span>
                    <span className="text-white font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setViewUser(null)} className="w-full btn-primary">Cerrar</button>
          </motion.div>
        </div>
      )}

      {/* Modal confirmación deshabilitar */}
      {showDisableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setShowDisableModal(null)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            onClick={e => e.stopPropagation()}
            className="card p-6 max-w-sm w-full mx-4 text-center space-y-4">
            <EyeOff className="w-12 h-12 text-gray-400 mx-auto" />
            <div>
              <h3 className="text-xl font-bold text-white">¿Deshabilitar usuario?</h3>
              <p className="text-gray-400 text-sm mt-1">
                <strong>{showDisableModal.name}</strong> quedará inactivo — puede ser reactivado en cualquier momento.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setShowDisableModal(null)} 
                disabled={updatingStatus !== null}
                className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-xl transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button 
                onClick={() => handleStatusChange(showDisableModal.id, 'disabled')} 
                disabled={updatingStatus !== null}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {updatingStatus === showDisableModal.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deshabilitando...
                  </>
                ) : (
                  'Deshabilitar'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
