import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Edit2, Trash2, Eye, UserCheck, UserX, ChevronDown } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../../controllers/AuthContext';

interface UserRecord {
  id: number;
  name: string;
  email: string;
  phone: string;
  plate: string;
  licenseCode: string;
  status: 'active' | 'inactive' | 'deleted';
  createdAt: string;
  servicesCount: number;
}

const MOCK_USERS: UserRecord[] = [
  { id: 1, name: 'Carlos Rodríguez', email: 'carlos@email.com', phone: '+57 300 123 4567', plate: 'ABC-123', licenseCode: 'LIC-2024-001', status: 'active', createdAt: '2025-01-15', servicesCount: 5 },
  { id: 2, name: 'María González', email: 'maria@email.com', phone: '+57 301 987 6543', plate: 'XYZ-456', licenseCode: 'LIC-2024-002', status: 'active', createdAt: '2025-02-20', servicesCount: 3 },
  { id: 3, name: 'Pedro Martínez', email: 'pedro@email.com', phone: '+57 302 456 7890', plate: 'DEF-789', licenseCode: 'LIC-2024-003', status: 'inactive', createdAt: '2025-03-10', servicesCount: 1 },
  { id: 4, name: 'Ana López', email: 'ana@email.com', phone: '+57 303 321 0987', plate: 'GHI-012', licenseCode: 'LIC-2024-004', status: 'active', createdAt: '2025-04-05', servicesCount: 8 },
];

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserRecord[]>(MOCK_USERS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'deleted'>('all');
  const [viewUser, setViewUser] = useState<UserRecord | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null);

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.plate.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || u.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleSoftDelete = (id: number) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'deleted' as const } : u));
    setShowDeleteModal(null);
  };

  const handleRestore = (id: number) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'active' as const } : u));
  };

  const statusBadge = (status: UserRecord['status']) => {
    const map = {
      active: 'bg-green-500/20 text-green-400',
      inactive: 'bg-yellow-500/20 text-yellow-400',
      deleted: 'bg-red-500/20 text-red-400 line-through',
    };
    const labels = { active: 'Activo', inactive: 'Inactivo', deleted: 'Eliminado' };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[status]}`}>{labels[status]}</span>;
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar isAuthenticated userName={user?.name || 'Admin'} hideNavLinks />
      <Sidebar />
      <main className="ml-64 pt-16 p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Gestión de Usuarios</h1>
              <p className="text-gray-400 text-sm mt-1">Administra las cuentas de conductores registrados</p>
            </div>
            <button className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> Nuevo Usuario
            </button>
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nombre, email o placa..."
                className="input-field pl-9 text-sm" />
            </div>
            <div className="relative">
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}
                className="input-field pr-8 text-sm appearance-none">
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
                <option value="deleted">Eliminados</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Total', value: users.length, color: 'text-white' },
              { label: 'Activos', value: users.filter(u => u.status === 'active').length, color: 'text-green-400' },
              { label: 'Inactivos', value: users.filter(u => u.status === 'inactive').length, color: 'text-yellow-400' },
              { label: 'Eliminados', value: users.filter(u => u.status === 'deleted').length, color: 'text-red-400' },
            ].map(stat => (
              <div key={stat.label} className="card p-4 text-center">
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-gray-400 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Tabla */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-anthracite-700">
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Usuario</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Teléfono</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Placa</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Servicios</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Estado</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-anthracite-800">
                  {filtered.map(u => (
                    <tr key={u.id} className={`hover:bg-dark-800/40 transition-colors ${u.status === 'deleted' ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-white font-medium">{u.name}</p>
                          <p className="text-gray-500 text-xs">{u.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-300">{u.phone}</td>
                      <td className="px-4 py-3 text-gray-300 font-mono">{u.plate}</td>
                      <td className="px-4 py-3 text-gray-300">{u.servicesCount}</td>
                      <td className="px-4 py-3">{statusBadge(u.status)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setViewUser(u)}
                            className="p-1.5 hover:bg-dark-700 rounded-lg transition-colors text-gray-400 hover:text-white" title="Ver detalles">
                            <Eye className="w-4 h-4" />
                          </button>
                          {u.status !== 'deleted' ? (
                            <>
                              <button className="p-1.5 hover:bg-dark-700 rounded-lg transition-colors text-gray-400 hover:text-gold-400" title="Editar">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => setShowDeleteModal(u.id)}
                                className="p-1.5 hover:bg-dark-700 rounded-lg transition-colors text-gray-400 hover:text-red-400" title="Borrar lógico">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <button onClick={() => handleRestore(u.id)}
                              className="p-1.5 hover:bg-dark-700 rounded-lg transition-colors text-gray-400 hover:text-green-400" title="Restaurar">
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <UserX className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No se encontraron usuarios</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </main>

      {/* Modal ver usuario — perfil completo */}
      {viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setViewUser(null)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            onClick={e => e.stopPropagation()}
            className="card p-6 max-w-lg w-full mx-4 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white border-b border-anthracite-700 pb-3">Perfil del Usuario</h3>

            {/* Info personal */}
            <div>
              <p className="text-xs text-gold-400 uppercase tracking-wider font-semibold mb-2">Información Personal</p>
              <div className="space-y-1 text-sm">
                {[
                  ['Nombre completo', viewUser.name],
                  ['Email', viewUser.email],
                  ['Teléfono', viewUser.phone],
                  ['Cédula', '1234567890'],
                  ['Licencia de conducción', viewUser.licenseCode],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-1.5 border-b border-anthracite-800/50">
                    <span className="text-gray-400">{label}</span>
                    <span className="text-white font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Info vehículo */}
            <div>
              <p className="text-xs text-blue-400 uppercase tracking-wider font-semibold mb-2">Vehículo</p>
              <div className="space-y-1 text-sm">
                {[
                  ['Placa', viewUser.plate],
                  ['Marca / Modelo', 'Toyota Corolla'],
                  ['Año', '2020'],
                  ['Color', 'Blanco'],
                  ['SOAT', 'SOAT-2024-00123456'],
                  ['Tecnomecánica', 'TM-2024-00098765'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-1.5 border-b border-anthracite-800/50">
                    <span className="text-gray-400">{label}</span>
                    <span className="text-white font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actividad */}
            <div>
              <p className="text-xs text-green-400 uppercase tracking-wider font-semibold mb-2">Actividad</p>
              <div className="space-y-1 text-sm">
                {[
                  ['Servicios solicitados', String(viewUser.servicesCount)],
                  ['Registrado el', viewUser.createdAt],
                  ['Estado', viewUser.status === 'active' ? 'Activo' : viewUser.status === 'inactive' ? 'Inactivo' : 'Eliminado'],
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

      {/* Modal confirmación borrado lógico */}
      {showDeleteModal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setShowDeleteModal(null)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            onClick={e => e.stopPropagation()}
            className="card p-6 max-w-sm w-full mx-4 text-center space-y-4">
            <Trash2 className="w-12 h-12 text-red-400 mx-auto" />
            <div>
              <h3 className="text-xl font-bold text-white">¿Eliminar usuario?</h3>
              <p className="text-gray-400 text-sm mt-1">Esta es una eliminación lógica — el usuario puede ser restaurado después.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowDeleteModal(null)} className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-xl transition-colors">Cancelar</button>
              <button onClick={() => handleSoftDelete(showDeleteModal)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors">Eliminar</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
