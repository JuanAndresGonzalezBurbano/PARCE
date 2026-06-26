import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Edit2, Trash2, Eye, Car, ChevronDown, User, Wrench } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../../controllers/AuthContext';

interface VehicleRecord {
  id: number;
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  ownerName: string;
  ownerType: 'user' | 'mechanic';
  ownerEmail: string;
  ownerPhone: string;
  servicesCount: number;
  lastService?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

const MOCK_VEHICLES: VehicleRecord[] = [
  { 
    id: 1, 
    plate: 'ABC-123', 
    brand: 'Toyota', 
    model: 'Corolla', 
    year: 2020, 
    color: 'Blanco', 
    ownerName: 'Carlos Méndez',
    ownerType: 'user',
    ownerEmail: 'carlos@email.com',
    ownerPhone: '+57 300 111 2222',
    servicesCount: 12,
    lastService: '2025-06-20',
    status: 'active',
    createdAt: '2024-03-15'
  },
  { 
    id: 2, 
    plate: 'XYZ-789', 
    brand: 'Chevrolet', 
    model: 'Spark', 
    year: 2019, 
    color: 'Gris', 
    ownerName: 'Roberto Silva',
    ownerType: 'mechanic',
    ownerEmail: 'roberto@email.com',
    ownerPhone: '+57 310 333 4444',
    servicesCount: 87,
    lastService: '2025-06-24',
    status: 'active',
    createdAt: '2024-11-01'
  },
  { 
    id: 3, 
    plate: 'PDF-456', 
    brand: 'Mazda', 
    model: '3', 
    year: 2021, 
    color: 'Rojo', 
    ownerName: 'Ana Rodríguez',
    ownerType: 'user',
    ownerEmail: 'ana@email.com',
    ownerPhone: '+57 320 555 6666',
    servicesCount: 5,
    lastService: '2025-06-18',
    status: 'active',
    createdAt: '2025-01-10'
  },
  { 
    id: 4, 
    plate: 'QRS-678', 
    brand: 'Renault', 
    model: 'Logan', 
    year: 2018, 
    color: 'Azul', 
    ownerName: 'Luis Herrera',
    ownerType: 'mechanic',
    ownerEmail: 'luis@email.com',
    ownerPhone: '+57 311 777 8888',
    servicesCount: 52,
    lastService: '2025-06-22',
    status: 'active',
    createdAt: '2024-12-15'
  },
];

export default function AdminVehiclesPage() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<VehicleRecord[]>(MOCK_VEHICLES);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'user' | 'mechanic'>('all');
  const [viewVehicle, setViewVehicle] = useState<VehicleRecord | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null);

  const filtered = vehicles.filter(v => {
    const matchSearch = 
      v.plate.toLowerCase().includes(search.toLowerCase()) ||
      v.brand.toLowerCase().includes(search.toLowerCase()) ||
      v.model.toLowerCase().includes(search.toLowerCase()) ||
      v.ownerName.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || v.ownerType === filterType;
    return matchSearch && matchType && v.status === 'active';
  });

  const handleDelete = (id: number) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, status: 'inactive' as const } : v));
    setShowDeleteModal(null);
  };

  const ownerTypeBadge = (type: VehicleRecord['ownerType']) => {
    if (type === 'mechanic') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
          <Wrench className="w-3 h-3" /> Mecánico
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
        <User className="w-3 h-3" /> Usuario
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar isAuthenticated userName={user?.name || 'Admin'} hideNavLinks />
      <Sidebar />
      <main className="ml-64 pt-16 p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Gestión de Vehículos</h1>
            <p className="text-gray-400 text-sm mt-1">Administra vehículos de usuarios y mecánicos</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                value={search} 
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por placa, marca, modelo o propietario..."
                className="input-field pl-9 text-sm" 
              />
            </div>
            <div className="relative">
              <select 
                value={filterType} 
                onChange={e => setFilterType(e.target.value as typeof filterType)}
                className="input-field pr-8 text-sm appearance-none"
              >
                <option value="all">Todos los propietarios</option>
                <option value="user">Solo usuarios</option>
                <option value="mechanic">Solo mecánicos</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Total activos', value: vehicles.filter(v => v.status === 'active').length, color: 'text-white' },
              { label: 'De usuarios', value: vehicles.filter(v => v.ownerType === 'user' && v.status === 'active').length, color: 'text-blue-400' },
              { label: 'De mecánicos', value: vehicles.filter(v => v.ownerType === 'mechanic' && v.status === 'active').length, color: 'text-purple-400' },
              { label: 'Servicios totales', value: vehicles.reduce((a, v) => a + v.servicesCount, 0), color: 'text-green-400' },
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
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Placa</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Vehículo</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Propietario</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Tipo</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Servicios</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Último servicio</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-anthracite-800">
                  {filtered.map(v => (
                    <tr key={v.id} className="hover:bg-dark-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-primary-400" />
                          <span className="text-white font-mono font-semibold">{v.plate}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-white font-medium">{v.brand} {v.model}</p>
                          <p className="text-gray-500 text-xs">{v.year} • {v.color}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-white">{v.ownerName}</p>
                          <p className="text-gray-500 text-xs">{v.ownerEmail}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">{ownerTypeBadge(v.ownerType)}</td>
                      <td className="px-4 py-3 text-gray-300 text-center">{v.servicesCount}</td>
                      <td className="px-4 py-3 text-gray-300">{v.lastService || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setViewVehicle(v)}
                            className="p-1.5 hover:bg-dark-700 rounded-lg transition-colors text-gray-400 hover:text-white"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 hover:bg-dark-700 rounded-lg transition-colors text-gray-400 hover:text-gold-400">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setShowDeleteModal(v.id)}
                            className="p-1.5 hover:bg-dark-700 rounded-lg transition-colors text-gray-400 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Car className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No se encontraron vehículos</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </main>

      {viewVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setViewVehicle(null)}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            onClick={e => e.stopPropagation()} 
            className="card p-6 max-w-lg w-full mx-4 space-y-4"
          >
            <h3 className="text-xl font-bold text-white border-b border-anthracite-700 pb-3 flex items-center gap-2">
              <Car className="w-5 h-5 text-primary-400" />
              Detalles del Vehículo
            </h3>

            <div>
              <p className="text-xs text-primary-400 uppercase tracking-wider font-semibold mb-2">Información del Vehículo</p>
              <div className="space-y-1 text-sm">
                {[
                  ['Placa', viewVehicle.plate],
                  ['Marca', viewVehicle.brand],
                  ['Modelo', viewVehicle.model],
                  ['Año', String(viewVehicle.year)],
                  ['Color', viewVehicle.color],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-1.5 border-b border-anthracite-800/50">
                    <span className="text-gray-400">{label}</span>
                    <span className="text-white font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-blue-400 uppercase tracking-wider font-semibold mb-2">Propietario</p>
              <div className="space-y-1 text-sm">
                {[
                  ['Nombre', viewVehicle.ownerName],
                  ['Tipo', viewVehicle.ownerType === 'mechanic' ? 'Mecánico' : 'Usuario'],
                  ['Email', viewVehicle.ownerEmail],
                  ['Teléfono', viewVehicle.ownerPhone],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-1.5 border-b border-anthracite-800/50">
                    <span className="text-gray-400">{label}</span>
                    <span className="text-white font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-green-400 uppercase tracking-wider font-semibold mb-2">Historial</p>
              <div className="space-y-1 text-sm">
                {[
                  ['Servicios completados', String(viewVehicle.servicesCount)],
                  ['Último servicio', viewVehicle.lastService || 'N/A'],
                  ['Registrado el', viewVehicle.createdAt],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-1.5 border-b border-anthracite-800/50">
                    <span className="text-gray-400">{label}</span>
                    <span className="text-white font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setViewVehicle(null)} className="w-full btn-primary">Cerrar</button>
          </motion.div>
        </div>
      )}

      {showDeleteModal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowDeleteModal(null)}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            onClick={e => e.stopPropagation()} 
            className="card p-6 max-w-sm w-full mx-4 text-center space-y-4"
          >
            <Trash2 className="w-12 h-12 text-red-400 mx-auto" />
            <div>
              <h3 className="text-xl font-bold text-white">¿Desactivar vehículo?</h3>
              <p className="text-gray-400 text-sm mt-1">El vehículo quedará inactivo en el sistema.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowDeleteModal(null)} className="px-4 py-2 bg-dark-700 text-white rounded-xl">Cancelar</button>
              <button onClick={() => handleDelete(showDeleteModal)} className="px-4 py-2 bg-red-600 text-white rounded-xl">Desactivar</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
