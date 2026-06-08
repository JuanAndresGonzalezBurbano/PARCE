import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Edit2, Trash2, Eye, UserCheck, UserX, Star, ChevronDown, Award } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../../controllers/AuthContext';

interface MechanicRecord {
  id: number;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  plate: string;
  certTitle: string;
  rating: number;
  servicesCompleted: number;
  status: 'active' | 'inactive' | 'deleted';
  createdAt: string;
}

const MOCK_MECHANICS: MechanicRecord[] = [
  { id: 1, name: 'Roberto Silva', email: 'roberto@email.com', phone: '+57 310 111 2222', specialty: 'Mecánica General', plate: 'PDF-345', certTitle: 'Técnico en Mecánica Automotriz', rating: 4.9, servicesCompleted: 87, status: 'active', createdAt: '2024-11-01' },
  { id: 2, name: 'Luis Herrera', email: 'luis@email.com', phone: '+57 311 333 4444', specialty: 'Electricidad Automotriz', plate: 'QRS-678', certTitle: 'Tecnólogo Electromecánico', rating: 4.6, servicesCompleted: 52, status: 'active', createdAt: '2024-12-15' },
  { id: 3, name: 'Jorge Vargas', email: 'jorge@email.com', phone: '+57 312 555 6666', specialty: 'Neumáticos y Frenos', plate: 'TUV-901', certTitle: 'Técnico en Mecánica', rating: 4.3, servicesCompleted: 31, status: 'inactive', createdAt: '2025-01-20' },
];

export default function AdminMechanicsPage() {
  const { user } = useAuth();
  const [mechanics, setMechanics] = useState<MechanicRecord[]>(MOCK_MECHANICS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'deleted'>('all');
  const [viewMechanic, setViewMechanic] = useState<MechanicRecord | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null);

  const filtered = mechanics.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.specialty.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || m.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleSoftDelete = (id: number) => {
    setMechanics(prev => prev.map(m => m.id === id ? { ...m, status: 'deleted' as const } : m));
    setShowDeleteModal(null);
  };

  const handleRestore = (id: number) => {
    setMechanics(prev => prev.map(m => m.id === id ? { ...m, status: 'active' as const } : m));
  };

  const statusBadge = (status: MechanicRecord['status']) => {
    const map = { active: 'bg-green-500/20 text-green-400', inactive: 'bg-yellow-500/20 text-yellow-400', deleted: 'bg-red-500/20 text-red-400' };
    const labels = { active: 'Activo', inactive: 'Inactivo', deleted: 'Eliminado' };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[status]}`}>{labels[status]}</span>;
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={`w-3 h-3 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
      ))}
      <span className="text-xs text-gray-400 ml-1">{rating}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar isAuthenticated userName={user?.name || 'Admin'} hideNavLinks />
      <Sidebar />
      <main className="ml-64 pt-16 p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Gestión de Mecánicos</h1>
            <p className="text-gray-400 text-sm mt-1">Administra los perfiles y cuentas de mecánicos</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nombre, email o especialidad..."
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

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Total', value: mechanics.length, color: 'text-white' },
              { label: 'Activos', value: mechanics.filter(m => m.status === 'active').length, color: 'text-green-400' },
              { label: 'Promedio ★', value: (mechanics.reduce((a, m) => a + m.rating, 0) / mechanics.length).toFixed(1), color: 'text-yellow-400' },
              { label: 'Servicios totales', value: mechanics.reduce((a, m) => a + m.servicesCompleted, 0), color: 'text-blue-400' },
            ].map(stat => (
              <div key={stat.label} className="card p-4 text-center">
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-gray-400 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-anthracite-700">
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Mecánico</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Especialidad</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Calificación</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Servicios</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Estado</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-anthracite-800">
                  {filtered.map(m => (
                    <tr key={m.id} className={`hover:bg-dark-800/40 transition-colors ${m.status === 'deleted' ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-white font-medium">{m.name}</p>
                          <p className="text-gray-500 text-xs">{m.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-gold-500" />
                          <span className="text-gray-300 text-xs">{m.specialty}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">{renderStars(m.rating)}</td>
                      <td className="px-4 py-3 text-gray-300">{m.servicesCompleted}</td>
                      <td className="px-4 py-3">{statusBadge(m.status)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setViewMechanic(m)}
                            className="p-1.5 hover:bg-dark-700 rounded-lg transition-colors text-gray-400 hover:text-white">
                            <Eye className="w-4 h-4" />
                          </button>
                          {m.status !== 'deleted' ? (
                            <>
                              <button className="p-1.5 hover:bg-dark-700 rounded-lg transition-colors text-gray-400 hover:text-gold-400">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => setShowDeleteModal(m.id)}
                                className="p-1.5 hover:bg-dark-700 rounded-lg transition-colors text-gray-400 hover:text-red-400">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <button onClick={() => handleRestore(m.id)}
                              className="p-1.5 hover:bg-dark-700 rounded-lg transition-colors text-gray-400 hover:text-green-400">
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
                  <p>No se encontraron mecánicos</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </main>

      {viewMechanic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setViewMechanic(null)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            onClick={e => e.stopPropagation()} className="card p-6 max-w-lg w-full mx-4 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white border-b border-anthracite-700 pb-3">Perfil del Mecánico</h3>

            <div>
              <p className="text-xs text-gold-400 uppercase tracking-wider font-semibold mb-2">Información Personal</p>
              <div className="space-y-1 text-sm">
                {[
                  ['Nombre completo', viewMechanic.name],
                  ['Email', viewMechanic.email],
                  ['Teléfono', viewMechanic.phone],
                  ['Cédula', '9876543210'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-1.5 border-b border-anthracite-800/50">
                    <span className="text-gray-400">{label}</span>
                    <span className="text-white font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-blue-400 uppercase tracking-wider font-semibold mb-2">Vehículo de Trabajo</p>
              <div className="space-y-1 text-sm">
                {[
                  ['Placa', viewMechanic.plate],
                  ['Marca / Modelo', 'Chevrolet Spark'],
                  ['Año', '2019'],
                  ['Color', 'Gris'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-1.5 border-b border-anthracite-800/50">
                    <span className="text-gray-400">{label}</span>
                    <span className="text-white font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-purple-400 uppercase tracking-wider font-semibold mb-2">Certificación Profesional</p>
              <div className="space-y-1 text-sm">
                {[
                  ['Título', viewMechanic.certTitle],
                  ['Especialidad', viewMechanic.specialty],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-1.5 border-b border-anthracite-800/50">
                    <span className="text-gray-400">{label}</span>
                    <span className="text-white font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-green-400 uppercase tracking-wider font-semibold mb-2">Desempeño</p>
              <div className="space-y-1 text-sm">
                {[
                  ['Calificación', `${viewMechanic.rating} / 5`],
                  ['Servicios completados', String(viewMechanic.servicesCompleted)],
                  ['Registrado el', viewMechanic.createdAt],
                  ['Estado', viewMechanic.status === 'active' ? 'Activo' : viewMechanic.status === 'inactive' ? 'Inactivo' : 'Eliminado'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-1.5 border-b border-anthracite-800/50">
                    <span className="text-gray-400">{label}</span>
                    <span className="text-white font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setViewMechanic(null)} className="w-full btn-primary">Cerrar</button>
          </motion.div>
        </div>
      )}

      {showDeleteModal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowDeleteModal(null)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            onClick={e => e.stopPropagation()} className="card p-6 max-w-sm w-full mx-4 text-center space-y-4">
            <Trash2 className="w-12 h-12 text-red-400 mx-auto" />
            <div>
              <h3 className="text-xl font-bold text-white">¿Eliminar mecánico?</h3>
              <p className="text-gray-400 text-sm mt-1">Borrado lógico — puede restaurarse después.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowDeleteModal(null)} className="px-4 py-2 bg-dark-700 text-white rounded-xl">Cancelar</button>
              <button onClick={() => handleSoftDelete(showDeleteModal)} className="px-4 py-2 bg-red-600 text-white rounded-xl">Eliminar</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
