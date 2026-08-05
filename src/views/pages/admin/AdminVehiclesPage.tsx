import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Car, ChevronDown, Loader2, AlertCircle, User } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../../controllers/AuthContext';
import { adminService, AdminVehicle } from '../../../services/adminService';

export default function AdminVehiclesPage() {
  const { user } = useAuth();
  
  // Estados
  const [vehicles, setVehicles] = useState<AdminVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Cargar vehículos
  const loadVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: any = {};
      if (search.trim()) filters.search = search.trim();

      const response = await adminService.getVehicles(filters);

      if (response.success && response.data) {
        setVehicles(response.data.vehicles);
      } else {
        setError(response.error || response.message || 'Error al cargar vehículos');
      }
    } catch (err) {
      console.error('Error loading vehicles:', err);
      setError('Error de conexión. Verifica que el servidor esté funcionando.');
    } finally {
      setLoading(false);
    }
  };

  // Cargar al montar y cuando cambie el filtro de búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadVehicles();
    }, search ? 500 : 0); // Debounce de 500ms

    return () => clearTimeout(timeoutId);
  }, [search]);

  // Badge para vehículo primario
  const primaryBadge = (isPrimary: boolean) => {
    if (!isPrimary) return null;
    return (
      <span className="px-2 py-0.5 bg-gold-500/20 text-gold-400 text-xs rounded-full border border-gold-500/30 font-medium">
        Principal
      </span>
    );
  };

  // Badge para estado
  const statusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-500/20 text-green-400 border-green-500/30',
      inactive: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    const style = status === 'active' ? styles.active : styles.inactive;
    const label = status === 'active' ? 'Activo' : 'Inactivo';
    
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${style}`}>
        {label}
      </span>
    );
  };

  // Estadísticas
  const stats = {
    total: vehicles.length,
    withSOAT: vehicles.filter(v => v.soat_number).length,
    withTecno: vehicles.filter(v => v.tecnomecanica_number).length,
    primary: vehicles.filter(v => v.is_primary).length,
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar isAuthenticated userName={user?.name || 'Admin'} hideNavLinks />
      <Sidebar />
      <main className="ml-64 pt-16 p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-white">Gestión de Vehículos</h1>
            <p className="text-gray-400 text-sm mt-1">Administra todos los vehículos registrados en la plataforma</p>
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por placa, marca, modelo o propietario..."
              className="input-field pl-9 text-sm w-full"
              disabled={loading} 
            />
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total vehículos', value: stats.total, color: 'text-white', icon: Car },
              { label: 'Primarios', value: stats.primary, color: 'text-gold-400', icon: Car },
              { label: 'Con SOAT', value: stats.withSOAT, color: 'text-green-400', icon: Car },
              { label: 'Con Tecnomecánica', value: stats.withTecno, color: 'text-blue-400', icon: Car },
            ].map(stat => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                    <p className={`text-2xl font-bold ${stat.color}`}>
                      {loading ? '...' : stat.value}
                    </p>
                  </div>
                  <p className="text-gray-400 text-xs">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* Tabla */}
          <div className="card overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-10 h-10 text-gold-400 animate-spin mb-3" />
                <span className="text-gray-400">Cargando vehículos...</span>
              </div>
            ) : vehicles.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Car className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No se encontraron vehículos</p>
                <p className="text-sm mt-1">Intenta cambiar los filtros de búsqueda</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-anthracite-700 bg-dark-800/50">
                      <th className="text-left px-4 py-3 text-gray-400 font-semibold">Vehículo</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-semibold">Propietario</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-semibold">SOAT</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-semibold">Tecnomecánica</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-semibold">Estado</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-semibold">Registro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-anthracite-800">
                    {vehicles.map(v => {
                      return (
                        <tr key={v.id} className="hover:bg-dark-800/40 transition-colors">
                          <td className="px-4 py-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-white font-bold">{v.license_plate}</p>
                                {primaryBadge(v.is_primary)}
                              </div>
                              <p className="text-gray-400 text-sm">{v.make} {v.model}</p>
                              <p className="text-gray-600 text-xs">{v.year} · {v.color}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-start gap-2">
                              <div className="flex items-center justify-center w-8 h-8 bg-gold-500/20 rounded-full text-gold-400 text-xs font-bold border border-gold-500/30 flex-shrink-0">
                                <User className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-white font-medium">{v.first_name} {v.last_name}</p>
                                <p className="text-gray-500 text-xs">{v.email}</p>
                                {v.phone && <p className="text-gray-600 text-xs">{v.phone}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {v.soat_number ? (
                              <div>
                                <p className="text-green-400 font-mono text-xs">{v.soat_number}</p>
                                <p className="text-gray-600 text-xs">✓ Registrado</p>
                              </div>
                            ) : (
                              <span className="text-gray-500 text-xs">Sin registro</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {v.tecnomecanica_number ? (
                              <div>
                                <p className="text-blue-400 font-mono text-xs">{v.tecnomecanica_number}</p>
                                <p className="text-gray-600 text-xs">✓ Registrado</p>
                              </div>
                            ) : (
                              <span className="text-gray-500 text-xs">Sin registro</span>
                            )}
                          </td>
                          <td className="px-4 py-3">{statusBadge(v.status)}</td>
                          <td className="px-4 py-3 text-gray-400 text-xs">
                            {new Date(v.created_at).toLocaleDateString('es-CO')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
