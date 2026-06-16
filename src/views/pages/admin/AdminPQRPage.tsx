import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Eye, MessageSquare, User, Wrench, Clock, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../../controllers/AuthContext';

type PQRType = 'peticion' | 'queja' | 'reclamo';
type PQRRole = 'users' | 'mechanics';

interface PQRRecord {
  id: number;
  authorName: string;
  authorEmail: string;
  type: PQRType;
  subject: string;
  description: string;
  status: 'open' | 'in_review' | 'resolved';
  createdAt: string;
  response?: string;
}

const MOCK_USER_PQR: PQRRecord[] = [
  { id: 1, authorName: 'Carlos Rodríguez', authorEmail: 'carlos@email.com', type: 'queja', subject: 'Mecánico llegó tarde', description: 'El mecánico indicó 20 minutos y llegó después de una hora.', status: 'in_review', createdAt: '2026-06-07 09:00' },
  { id: 2, authorName: 'María González', authorEmail: 'maria@email.com', type: 'reclamo', subject: 'Cobro incorrecto', description: 'Me cobraron repuestos que no se usaron.', status: 'open', createdAt: '2026-06-07 11:30' },
  { id: 3, authorName: 'Ana López', authorEmail: 'ana@email.com', type: 'peticion', subject: 'Agregar servicio de AC', description: 'Sería útil tener servicio de aire acondicionado.', status: 'resolved', createdAt: '2026-06-05 14:00', response: 'Gracias por tu sugerencia. Lo evaluaremos para una próxima versión.' },
];

const MOCK_MECHANIC_PQR: PQRRecord[] = [
  { id: 101, authorName: 'Roberto Silva', authorEmail: 'roberto@email.com', type: 'peticion', subject: 'Ampliar radio de servicio', description: 'Quisiera poder aceptar servicios en un radio mayor de 10km.', status: 'open', createdAt: '2026-06-06 10:00' },
  { id: 102, authorName: 'Luis Herrera', authorEmail: 'luis@email.com', type: 'queja', subject: 'Usuario calificó injustamente', description: 'El usuario me dio 1 estrella pero el servicio fue correcto.', status: 'in_review', createdAt: '2026-06-07 08:00' },
];

const typeConfig = {
  peticion: { label: 'Petición', color: 'bg-blue-500/20 text-blue-400' },
  queja: { label: 'Queja', color: 'bg-orange-500/20 text-orange-400' },
  reclamo: { label: 'Reclamo', color: 'bg-red-500/20 text-red-400' },
};

const statusConfig = {
  open: { label: 'Abierto', color: 'bg-yellow-500/20 text-yellow-400', icon: AlertCircle },
  in_review: { label: 'En revisión', color: 'bg-purple-500/20 text-purple-400', icon: Clock },
  resolved: { label: 'Resuelto', color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
};

export default function AdminPQRPage({ view = 'users' }: { view?: PQRRole }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<PQRRole>(view);
  useEffect(() => { setActiveView(view); }, [view]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | PQRType>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | PQRRecord['status']>('all');
  const [viewDetail, setViewDetail] = useState<PQRRecord | null>(null);
  const [responseText, setResponseText] = useState('');

  const data = activeView === 'users' ? MOCK_USER_PQR : MOCK_MECHANIC_PQR;
  const filtered = data.filter(p => {
    const matchSearch = p.authorName.toLowerCase().includes(search.toLowerCase()) ||
      p.subject.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || p.type === filterType;
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar isAuthenticated userName={user?.name || 'Admin'} hideNavLinks />
      <Sidebar />
      <main className="ml-64 pt-16 p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white">PQR — Peticiones, Quejas y Reclamos</h1>
            <p className="text-gray-400 text-sm mt-1">Gestiona y responde las solicitudes de soporte</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-dark-800 rounded-xl w-fit">
            {(['users', 'mechanics'] as PQRRole[]).map(v => (
              <button key={v} onClick={() => {
                setActiveView(v);
                navigate(v === 'users' ? '/admin/pqr/users' : '/admin/pqr/mechanics');
              }}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeView === v ? 'bg-gold-500 text-anthracite-950' : 'text-gray-400 hover:text-white'
                }`}>
                {v === 'users' ? <><User className="w-4 h-4" /> PQR Usuarios</> : <><Wrench className="w-4 h-4" /> PQR Mecánicos</>}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(statusConfig).map(([key, cfg]) => {
              const StatusIcon = cfg.icon;
              return (
                <div key={key} className="card p-4 flex items-center gap-3">
                  <StatusIcon className="w-6 h-6 text-gray-400" />
                  <div>
                    <p className="text-xl font-bold text-white">{data.filter(p => p.status === key).length}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por autor o asunto..."
                className="input-field pl-9 text-sm" />
            </div>
            <div className="relative">
              <select value={filterType} onChange={e => setFilterType(e.target.value as typeof filterType)}
                className="input-field pr-8 text-sm appearance-none">
                <option value="all">Todos los tipos</option>
                <option value="peticion">Petición</option>
                <option value="queja">Queja</option>
                <option value="reclamo">Reclamo</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
            <div className="relative">
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}
                className="input-field pr-8 text-sm appearance-none">
                <option value="all">Todos los estados</option>
                <option value="open">Abiertos</option>
                <option value="in_review">En revisión</option>
                <option value="resolved">Resueltos</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Lista */}
          <div className="space-y-3">
            {filtered.map(p => {
              const tCfg = typeConfig[p.type];
              const sCfg = statusConfig[p.status];
              const StatusIcon = sCfg.icon;
              return (
                <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="card p-4 hover:ring-1 hover:ring-anthracite-600 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-white font-bold">{p.subject}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tCfg.color}`}>{tCfg.label}</span>
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sCfg.color}`}>
                          <StatusIcon className="w-3 h-3" /> {sCfg.label}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs">{p.authorName} · {p.authorEmail} · {p.createdAt}</p>
                      <p className="text-gray-300 text-sm line-clamp-2">{p.description}</p>
                    </div>
                    <button onClick={() => { setViewDetail(p); setResponseText(''); }}
                      className="p-2 hover:bg-dark-700 rounded-lg transition-colors text-gray-400 hover:text-white flex-shrink-0">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No se encontraron PQR</p>
              </div>
            )}
          </div>
        </motion.div>
      </main>

      {/* Modal detalle + respuesta */}
      {viewDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setViewDetail(null)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            onClick={e => e.stopPropagation()} className="card p-6 max-w-lg w-full mx-4 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Detalle PQR</h3>
              <div className="flex gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs ${typeConfig[viewDetail.type].color}`}>{typeConfig[viewDetail.type].label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${statusConfig[viewDetail.status].color}`}>{statusConfig[viewDetail.status].label}</span>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-dark-800 rounded-lg">
                <p className="text-gray-400 text-xs mb-1">De: {viewDetail.authorName} · {viewDetail.createdAt}</p>
                <p className="text-white font-bold mb-2">{viewDetail.subject}</p>
                <p className="text-gray-300">{viewDetail.description}</p>
              </div>
              {viewDetail.response && (
                <div className="p-3 bg-gold-500/10 border border-gold-500/20 rounded-lg">
                  <p className="text-gold-400 text-xs mb-1 font-medium">Respuesta del administrador:</p>
                  <p className="text-gray-300 text-sm">{viewDetail.response}</p>
                </div>
              )}
              {viewDetail.status !== 'resolved' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Responder</label>
                  <textarea value={responseText} onChange={e => setResponseText(e.target.value)}
                    placeholder="Escribe tu respuesta..."
                    className="input-field resize-none h-24 text-sm" />
                  <button
                    onClick={() => setViewDetail(null)}
                    disabled={!responseText.trim()}
                    className="w-full btn-primary disabled:opacity-40">
                    Enviar respuesta y marcar resuelto
                  </button>
                </div>
              )}
            </div>
            <button onClick={() => setViewDetail(null)} className="w-full px-4 py-2 bg-dark-700 text-white rounded-xl hover:bg-dark-600 transition-colors text-sm">
              Cerrar
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
