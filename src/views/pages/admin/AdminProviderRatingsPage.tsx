// RF 6.4 – Consultar calificaciones del proveedor
// Permite a los administradores revisar calificaciones de repartidores/mecánicos
// para control de desempeño
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, Search, TrendingUp, TrendingDown,
  Eye, X, ChevronDown, Award, AlertTriangle,
  CheckCircle, Wrench
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../../controllers/AuthContext';

interface ProviderRating {
  id: number;
  mechanicName: string;
  specialty: string;
  userName: string;
  serviceType: string;
  rating: number;
  comment: string;
  date: string;
  serviceId: string;
}

const MOCK_RATINGS: ProviderRating[] = [
  { id: 1,  mechanicName: 'Roberto Silva',  specialty: 'Mecánica General',          userName: 'Carlos Rodríguez', serviceType: 'Cambio de llanta',           rating: 5, comment: 'Excelente servicio, muy rápido y profesional.',        date: '2026-06-07', serviceId: 'SRV-001' },
  { id: 2,  mechanicName: 'Luis Herrera',   specialty: 'Electricidad Automotriz',   userName: 'María González',   serviceType: 'Diagnóstico mecánico',        rating: 4, comment: 'Buen trabajo, llegó en el tiempo estimado.',           date: '2026-06-07', serviceId: 'SRV-002' },
  { id: 3,  mechanicName: 'Roberto Silva',  specialty: 'Mecánica General',          userName: 'Ana López',        serviceType: 'Carga de batería',            rating: 5, comment: 'Muy amable y resolvió el problema rápido.',            date: '2026-06-06', serviceId: 'SRV-003' },
  { id: 4,  mechanicName: 'Jorge Vargas',   specialty: 'Neumáticos y Frenos',       userName: 'Pedro Martínez',   serviceType: 'Grúa y remolque',             rating: 3, comment: 'Demoró un poco más de lo esperado.',                  date: '2026-06-06', serviceId: 'SRV-004' },
  { id: 5,  mechanicName: 'Luis Herrera',   specialty: 'Electricidad Automotriz',   userName: 'Sara Gómez',       serviceType: 'Cerrajería',                  rating: 5, comment: 'Increíble, llegó en 15 minutos.',                     date: '2026-06-05', serviceId: 'SRV-005' },
  { id: 6,  mechanicName: 'Jorge Vargas',   specialty: 'Neumáticos y Frenos',       userName: 'Camilo Torres',    serviceType: 'Cambio de llantas',           rating: 2, comment: 'No trajo el repuesto correcto, tuvo que ir a buscarlo.', date: '2026-06-05', serviceId: 'SRV-006' },
  { id: 7,  mechanicName: 'Roberto Silva',  specialty: 'Mecánica General',          userName: 'Valentina Cruz',   serviceType: 'Suministro de combustible',   rating: 5, comment: 'Perfecto, puntual y muy cordial.',                   date: '2026-06-04', serviceId: 'SRV-007' },
  { id: 8,  mechanicName: 'Ana Torres',     specialty: 'Mecánica General',          userName: 'Diego Ramírez',    serviceType: 'Cambio de aceite',            rating: 4, comment: 'Buena atención, rápida y eficiente.',                 date: '2026-06-04', serviceId: 'SRV-008' },
  { id: 9,  mechanicName: 'Ana Torres',     specialty: 'Mecánica General',          userName: 'Laura Jiménez',    serviceType: 'Revisión de frenos',          rating: 1, comment: 'Llegó tarde y dejó el área sucia.',                   date: '2026-06-03', serviceId: 'SRV-009' },
  { id: 10, mechanicName: 'Luis Herrera',   specialty: 'Electricidad Automotriz',   userName: 'Andrés Mejía',     serviceType: 'Cambio de batería',           rating: 4, comment: 'Muy profesional aunque un poco costoso.',            date: '2026-06-03', serviceId: 'SRV-010' },
];

interface ProviderSummary {
  name: string;
  specialty: string;
  totalRatings: number;
  avg: number;
  distribution: Record<number, number>;
  recent: ProviderRating[];
  trend: 'up' | 'down' | 'stable';
}

function buildSummaries(ratings: ProviderRating[]): ProviderSummary[] {
  const groups: Record<string, ProviderRating[]> = {};
  ratings.forEach(r => {
    if (!groups[r.mechanicName]) groups[r.mechanicName] = [];
    groups[r.mechanicName].push(r);
  });
  return Object.entries(groups).map(([name, rs]) => {
    const avg = rs.reduce((a, r) => a + r.rating, 0) / rs.length;
    const sorted = [...rs].sort((a, b) => b.date.localeCompare(a.date));
    const recent3 = sorted.slice(0, 3);
    const older = sorted.slice(3);
    const recentAvg = recent3.reduce((a, r) => a + r.rating, 0) / (recent3.length || 1);
    const olderAvg = older.length ? older.reduce((a, r) => a + r.rating, 0) / older.length : recentAvg;
    const trend: 'up' | 'down' | 'stable' = recentAvg > olderAvg + 0.3 ? 'up' : recentAvg < olderAvg - 0.3 ? 'down' : 'stable';
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    rs.forEach(r => distribution[r.rating]++);
    return { name, specialty: rs[0].specialty, totalRatings: rs.length, avg, distribution, recent: sorted, trend };
  }).sort((a, b) => b.avg - a.avg);
}

const StarRow = ({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) => {
  const w = size === 'md' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={`${w} ${i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
      ))}
    </div>
  );
};

const PERF_BADGE = (avg: number) => {
  if (avg >= 4.5) return { label: 'Excelente', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle };
  if (avg >= 3.5) return { label: 'Bueno',     color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',    icon: Award       };
  if (avg >= 2.5) return { label: 'Regular',   color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: AlertTriangle };
  return              { label: 'Bajo',      color: 'bg-red-500/20 text-red-400 border-red-500/30',        icon: AlertTriangle };
};

export default function AdminProviderRatingsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [filterRating, setFilterRating] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');
  const [selectedProvider, setSelectedProvider] = useState<ProviderSummary | null>(null);

  const summaries = buildSummaries(MOCK_RATINGS);
  const globalAvg = (MOCK_RATINGS.reduce((a, r) => a + r.rating, 0) / MOCK_RATINGS.length).toFixed(1);

  const filteredSummaries = summaries.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.specialty.toLowerCase().includes(search.toLowerCase())
  );

  const allFiltered = MOCK_RATINGS.filter(r => {
    const ms = search.toLowerCase();
    const matchSearch = r.mechanicName.toLowerCase().includes(ms) || r.userName.toLowerCase().includes(ms);
    const matchRating = filterRating === 'all' || r.rating === parseInt(filterRating);
    return matchSearch && matchRating;
  });

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar isAuthenticated userName={user?.name || 'Admin'} hideNavLinks />
      <Sidebar />
      <main className="ml-64 pt-16 p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

          <div>
            <h1 className="text-3xl font-bold text-white">Calificaciones del Proveedor</h1>
            <p className="text-gray-400 text-sm mt-1">RF 6.4 — Control de desempeño de mecánicos/repartidores</p>
          </div>

          {/* Resumen global */}
          <div className="grid grid-cols-4 gap-4">
            <div className="card p-5 flex items-center gap-4">
              <div className="w-14 h-14 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Star className="w-7 h-7 text-yellow-400 fill-yellow-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{globalAvg}</p>
                <p className="text-gray-400 text-xs">Promedio global</p>
              </div>
            </div>
            <div className="card p-5 flex items-center gap-4">
              <Wrench className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-3xl font-bold text-white">{summaries.length}</p>
                <p className="text-gray-400 text-xs">Proveedores evaluados</p>
              </div>
            </div>
            <div className="card p-5 flex items-center gap-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-3xl font-bold text-white">{MOCK_RATINGS.length}</p>
                <p className="text-gray-400 text-xs">Calificaciones totales</p>
              </div>
            </div>
            <div className="card p-5 flex items-center gap-4">
              <AlertTriangle className="w-8 h-8 text-red-400" />
              <div>
                <p className="text-3xl font-bold text-white">{summaries.filter(s => s.avg < 3).length}</p>
                <p className="text-gray-400 text-xs">Con desempeño bajo</p>
              </div>
            </div>
          </div>

          {/* Ranking de proveedores */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-gold-400" />
                <h3 className="text-white font-bold">Ranking de Proveedores</h3>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar mecánico..."
                  className="input-field pl-9 text-sm w-56" />
              </div>
            </div>

            <div className="space-y-2">
              {filteredSummaries.map((s, i) => {
                const perf = PERF_BADGE(s.avg);
                const PerfIcon = perf.icon;
                return (
                  <motion.div key={s.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-dark-800/50 transition-colors">
                    {/* Posición */}
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      i === 0 ? 'bg-yellow-500 text-anthracite-950' :
                      i === 1 ? 'bg-gray-400 text-anthracite-950' :
                      i === 2 ? 'bg-amber-700 text-white' : 'bg-dark-700 text-gray-400'
                    }`}>{i + 1}</span>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-semibold text-sm">{s.name}</p>
                        {s.trend === 'up'   && <TrendingUp   className="w-3.5 h-3.5 text-green-400" />}
                        {s.trend === 'down' && <TrendingDown  className="w-3.5 h-3.5 text-red-400"   />}
                      </div>
                      <p className="text-gray-500 text-xs">{s.specialty} · {s.totalRatings} calificaciones</p>
                    </div>

                    {/* Stars */}
                    <div className="flex items-center gap-2">
                      <StarRow rating={s.avg} />
                      <span className="text-white font-bold text-sm w-8">{s.avg.toFixed(1)}</span>
                    </div>

                    {/* Badge desempeño */}
                    <span className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${perf.color}`}>
                      <PerfIcon className="w-3 h-3" /> {perf.label}
                    </span>

                    {/* Ver detalle */}
                    <button onClick={() => setSelectedProvider(s)}
                      className="p-1.5 hover:bg-dark-700 rounded-lg text-gray-400 hover:text-white transition-colors flex-shrink-0">
                      <Eye className="w-4 h-4" />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Lista de todas las calificaciones con filtros */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold">Todas las calificaciones</h3>
              <div className="relative">
                <select value={filterRating} onChange={e => setFilterRating(e.target.value as typeof filterRating)}
                  className="input-field pr-8 text-sm appearance-none bg-dark-800">
                  <option value="all">Todas las estrellas</option>
                  {[5, 4, 3, 2, 1].map(n => <option key={n} value={String(n)}>{n} estrella{n !== 1 ? 's' : ''}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
            {allFiltered.map(r => (
              <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="card p-4 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-bold text-sm">{r.mechanicName}</p>
                      <span className="text-gray-500 text-xs">·</span>
                      <p className="text-gray-400 text-xs">{r.serviceType}</p>
                    </div>
                    <p className="text-gray-500 text-xs mt-0.5">Por: {r.userName} · {r.date} · Ref: {r.serviceId}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <StarRow rating={r.rating} />
                  </div>
                </div>
                {r.comment && (
                  <p className="text-gray-300 text-sm bg-dark-800/50 rounded-lg p-3 italic">"{r.comment}"</p>
                )}
              </motion.div>
            ))}
            {allFiltered.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No se encontraron calificaciones</p>
              </div>
            )}
          </div>

        </motion.div>
      </main>

      {/* ── MODAL DETALLE PROVEEDOR ── */}
      <AnimatePresence>
        {selectedProvider && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setSelectedProvider(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()} className="card p-6 max-w-lg w-full mx-4 space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedProvider.name}</h3>
                  <p className="text-gray-400 text-sm">{selectedProvider.specialty}</p>
                </div>
                <button onClick={() => setSelectedProvider(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              {/* Resumen */}
              <div className="flex items-center gap-4 p-4 bg-dark-800/60 rounded-xl">
                <div className="text-center">
                  <p className="text-4xl font-bold text-white">{selectedProvider.avg.toFixed(1)}</p>
                  <StarRow rating={selectedProvider.avg} size="md" />
                  <p className="text-gray-500 text-xs mt-1">{selectedProvider.totalRatings} reseñas</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map(stars => {
                    const count = selectedProvider.distribution[stars] || 0;
                    const pct = (count / selectedProvider.totalRatings) * 100;
                    return (
                      <div key={stars} className="flex items-center gap-2">
                        <span className="text-gray-500 text-xs w-3">{stars}</span>
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                        <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-gray-500 text-xs w-4">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tendencia */}
              <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-semibold ${
                selectedProvider.trend === 'up'   ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                selectedProvider.trend === 'down' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                'bg-dark-800/60 text-gray-400 border border-anthracite-700'
              }`}>
                    {selectedProvider.trend === 'up'   && <><TrendingUp   className="w-4 h-4" /> Tendencia positiva en los últimos servicios</>}
                {selectedProvider.trend === 'down' && <><TrendingDown  className="w-4 h-4" /> Tendencia negativa — requiere seguimiento</>}
                {selectedProvider.trend === 'stable' && <>Desempeño estable</>}
              </div>

              {/* Últimas reseñas */}
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Últimas reseñas</p>
                <div className="space-y-3">
                  {selectedProvider.recent.slice(0, 5).map(r => (
                    <div key={r.id} className="border-b border-anthracite-800/50 pb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-400 text-xs">{r.userName} · {r.date}</span>
                        <StarRow rating={r.rating} />
                      </div>
                      <p className="text-gray-300 text-sm italic">"{r.comment}"</p>
                      <p className="text-gray-600 text-xs mt-1">{r.serviceType} · {r.serviceId}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={() => setSelectedProvider(null)} className="w-full btn-primary">Cerrar</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
