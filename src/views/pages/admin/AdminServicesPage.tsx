import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Clock, User, Wrench, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../../controllers/AuthContext';

type ServiceView = 'users' | 'mechanics';

interface ServiceRecord {
  id: number;
  type: string;
  userName: string;
  userPhone: string;
  mechanicName?: string;
  mechanicPhone?: string;
  location: string;
  requestedAt: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  amount?: number;
}

const MOCK_USER_SERVICES: ServiceRecord[] = [
  { id: 1, type: 'Cambio de llanta', userName: 'Carlos Rodríguez', userPhone: '+57 300 123 4567', mechanicName: 'Roberto Silva', location: 'Calle 72 #10-34, Bogotá', requestedAt: '2026-06-07 09:15', status: 'completed', amount: 80000 },
  { id: 2, type: 'Carga de batería', userName: 'María González', userPhone: '+57 301 987 6543', mechanicName: 'Luis Herrera', location: 'Av. Caracas #45-67, Bogotá', requestedAt: '2026-06-07 10:30', status: 'in_progress', amount: 60000 },
  { id: 3, type: 'Suministro de combustible', userName: 'Ana López', userPhone: '+57 303 321 0987', location: 'Calle 100 #15-20, Bogotá', requestedAt: '2026-06-07 11:45', status: 'pending' },
  { id: 4, type: 'Grúa y remolque', userName: 'Pedro Martínez', userPhone: '+57 302 456 7890', mechanicName: 'Jorge Vargas', location: 'Carrera 7 #32-16, Bogotá', requestedAt: '2026-06-06 14:00', status: 'cancelled' },
];

const MOCK_MECHANIC_SERVICES: ServiceRecord[] = [
  { id: 101, type: 'Cambio de llanta', userName: 'Carlos Rodríguez', userPhone: '+57 300 123 4567', mechanicName: 'Roberto Silva', location: 'Calle 72 #10-34, Bogotá', requestedAt: '2026-06-07 09:15', status: 'completed', amount: 80000 },
  { id: 102, type: 'Diagnóstico mecánico', userName: 'Sara Gómez', userPhone: '+57 305 789 0123', mechanicName: 'Luis Herrera', location: 'Cra. 30 #45-22, Bogotá', requestedAt: '2026-06-07 13:00', status: 'in_progress', amount: 120000 },
  { id: 103, type: 'Cerrajería automotriz', userName: 'Jorge Ramírez', userPhone: '+57 306 012 3456', mechanicName: 'Roberto Silva', location: 'Calle 80 #20-10, Bogotá', requestedAt: '2026-06-06 16:30', status: 'completed', amount: 75000 },
];

// Colores grises/dorados en lugar de azul/morado
const statusConfig = {
  pending:     { label: 'Pendiente',   color: 'bg-yellow-500/20 text-yellow-400',  icon: AlertCircle },
  accepted:    { label: 'Aceptado',    color: 'bg-gold-500/20 text-gold-400',      icon: CheckCircle },
  in_progress: { label: 'En progreso', color: 'bg-gray-500/20 text-gray-300',      icon: Clock },
  completed:   { label: 'Completado',  color: 'bg-green-500/20 text-green-400',    icon: CheckCircle },
  cancelled:   { label: 'Cancelado',   color: 'bg-red-500/20 text-red-400',        icon: XCircle },
};

export default function AdminServicesPage({ view = 'users' }: { view?: ServiceView }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<ServiceView>(view);
  useEffect(() => { setActiveView(view); }, [view]);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | ServiceRecord['status']>('all');
  const [viewDetail, setViewDetail] = useState<ServiceRecord | null>(null);

  const data = activeView === 'users' ? MOCK_USER_SERVICES : MOCK_MECHANIC_SERVICES;
  const filtered = data.filter(s => {
    const matchSearch = s.type.toLowerCase().includes(search.toLowerCase()) ||
      s.userName.toLowerCase().includes(search.toLowerCase()) ||
      (s.mechanicName || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar isAuthenticated userName={user?.name || 'Admin'} hideNavLinks />
      <Sidebar />
      <main className="ml-64 pt-16 p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Servicios</h1>
            <p className="text-gray-400 text-sm mt-1">Monitorea todos los servicios solicitados y aceptados</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-dark-800 rounded-xl w-fit">
            {(['users', 'mechanics'] as ServiceView[]).map(v => (
              <button key={v} onClick={() => {
                setActiveView(v);
                navigate(v === 'users' ? '/admin/services/users' : '/admin/services/mechanics');
              }}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeView === v ? 'bg-gold-500 text-anthracite-950' : 'text-gray-400 hover:text-white'
                }`}>
                {v === 'users'
                  ? <><User className="w-4 h-4" /> Servicios de Usuarios</>
                  : <><Wrench className="w-4 h-4" /> Servicios de Mecánicos</>}
              </button>
            ))}
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por tipo de servicio, usuario o mecánico..."
                className="input-field pl-9 text-sm" />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}
              className="input-field text-sm">
              <option value="all">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="accepted">Aceptado</option>
              <option value="in_progress">En progreso</option>
              <option value="completed">Completado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-5 gap-3">
            {Object.entries(statusConfig).map(([key, cfg]) => (
              <div key={key} className="card p-3 text-center">
                <p className="text-xl font-bold text-white">{data.filter(s => s.status === key).length}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
              </div>
            ))}
          </div>

          {/* Lista */}
          <div className="space-y-3">
            {filtered.map(s => {
              const cfg = statusConfig[s.status];
              const StatusIcon = cfg.icon;
              return (
                <motion.div key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="card p-4 hover:ring-1 hover:ring-anthracite-600 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-white font-bold">{s.type}</h3>
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                          <StatusIcon className="w-3 h-3" /> {cfg.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-400">
                          <User className="w-3.5 h-3.5" />
                          <span>{s.userName}</span>
                        </div>
                        {s.mechanicName && (
                          <div className="flex items-center gap-2 text-gray-400">
                            <Wrench className="w-3.5 h-3.5" />
                            <span>{s.mechanicName}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-gray-400 col-span-2">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="text-xs">{s.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{s.requestedAt}</span>
                        {s.amount && <span className="text-green-400 font-medium">${s.amount.toLocaleString()}</span>}
                      </div>
                    </div>
                    {/* Ver detalle → lupa */}
                    <button onClick={() => setViewDetail(s)}
                      className="p-2 hover:bg-dark-700 rounded-lg transition-colors text-gray-400 hover:text-gold-400 flex-shrink-0"
                      title="Ver detalle">
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No se encontraron servicios</p>
              </div>
            )}
          </div>
        </motion.div>
      </main>

      {/* Modal detalle */}
      {viewDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setViewDetail(null)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            onClick={e => e.stopPropagation()} className="card p-6 max-w-md w-full mx-4 space-y-4">
            <h3 className="text-xl font-bold text-white">Detalle del Servicio</h3>
            <div className="space-y-2 text-sm">
              {[
                ['Tipo', viewDetail.type],
                ['Usuario', viewDetail.userName],
                ['Tel. Usuario', viewDetail.userPhone],
                ['Mecánico', viewDetail.mechanicName || '—'],
                ['Ubicación', viewDetail.location],
                ['Fecha', viewDetail.requestedAt],
                ['Estado', statusConfig[viewDetail.status].label],
                ['Monto', viewDetail.amount ? `$${viewDetail.amount.toLocaleString()}` : '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-2 border-b border-anthracite-800">
                  <span className="text-gray-400">{label}</span>
                  <span className="text-white font-medium">{value}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setViewDetail(null)} className="w-full btn-primary">Cerrar</button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
