import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Search, TrendingUp } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../../controllers/AuthContext';

interface RatingRecord {
  id: number;
  mechanicName: string;
  userName: string;
  serviceType: string;
  rating: number;
  comment: string;
  date: string;
}

const MOCK_RATINGS: RatingRecord[] = [
  { id: 1, mechanicName: 'Roberto Silva', userName: 'Carlos Rodríguez', serviceType: 'Cambio de llanta', rating: 5, comment: 'Excelente servicio, muy rápido y profesional.', date: '2026-06-07' },
  { id: 2, mechanicName: 'Luis Herrera', userName: 'María González', serviceType: 'Diagnóstico mecánico', rating: 4, comment: 'Buen trabajo, llegó en el tiempo estimado.', date: '2026-06-07' },
  { id: 3, mechanicName: 'Roberto Silva', userName: 'Ana López', serviceType: 'Carga de batería', rating: 5, comment: 'Muy amable y resolvió el problema rápido.', date: '2026-06-06' },
  { id: 4, mechanicName: 'Jorge Vargas', userName: 'Pedro Martínez', serviceType: 'Grúa y remolque', rating: 3, comment: 'Demoró un poco más de lo esperado.', date: '2026-06-06' },
  { id: 5, mechanicName: 'Luis Herrera', userName: 'Sara Gómez', serviceType: 'Cerrajería', rating: 5, comment: 'Increíble, llegó en 15 minutos.', date: '2026-06-05' },
];

// Calcula promedio por mecánico
function getMechanicAverages(ratings: RatingRecord[]) {
  const grouped: Record<string, number[]> = {};
  ratings.forEach(r => {
    if (!grouped[r.mechanicName]) grouped[r.mechanicName] = [];
    grouped[r.mechanicName].push(r.rating);
  });
  return Object.entries(grouped).map(([name, values]) => ({
    name,
    avg: values.reduce((a, b) => a + b, 0) / values.length,
    count: values.length,
  })).sort((a, b) => b.avg - a.avg);
}

const StarRow = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[...Array(5)].map((_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
    ))}
  </div>
);

export default function AdminRatingsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [filterRating, setFilterRating] = useState<'all' | '1' | '2' | '3' | '4' | '5'>('all');

  const filtered = MOCK_RATINGS.filter(r => {
    const matchSearch = r.mechanicName.toLowerCase().includes(search.toLowerCase()) ||
      r.userName.toLowerCase().includes(search.toLowerCase());
    const matchRating = filterRating === 'all' || r.rating === parseInt(filterRating);
    return matchSearch && matchRating;
  });

  const averages = getMechanicAverages(MOCK_RATINGS);
  const globalAvg = (MOCK_RATINGS.reduce((a, r) => a + r.rating, 0) / MOCK_RATINGS.length).toFixed(1);

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar isAuthenticated userName={user?.name || 'Admin'} hideNavLinks />
      <Sidebar />
      <main className="ml-64 pt-16 p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Calificaciones</h1>
            <p className="text-gray-400 text-sm mt-1">Puntuaciones de los usuarios a los mecánicos</p>
          </div>

          {/* Promedio general */}
          <div className="grid grid-cols-3 gap-4">
            <div className="card p-5 col-span-1 flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Star className="w-8 h-8 text-white fill-white" />
              </div>
              <div>
                <p className="text-4xl font-bold text-white">{globalAvg}</p>
                <p className="text-gray-400 text-sm">Promedio general</p>
                <p className="text-gray-500 text-xs">{MOCK_RATINGS.length} calificaciones</p>
              </div>
            </div>
            {/* Ranking de mecánicos */}
            <div className="card p-5 col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-gold-500" />
                <h3 className="text-white font-bold text-sm">Ranking de mecánicos</h3>
              </div>
              <div className="space-y-2">
                {averages.map((m, i) => (
                  <div key={m.name} className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      i === 0 ? 'bg-yellow-500 text-anthracite-950' :
                      i === 1 ? 'bg-gray-400 text-anthracite-950' :
                      i === 2 ? 'bg-amber-700 text-white' : 'bg-dark-700 text-gray-400'
                    }`}>{i + 1}</span>
                    <span className="text-gray-300 text-sm flex-1">{m.name}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      <span className="text-white text-sm font-bold">{m.avg.toFixed(1)}</span>
                      <span className="text-gray-500 text-xs">({m.count})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Distribución por estrellas */}
          <div className="card p-5">
            <h3 className="text-white font-bold mb-4">Distribución de calificaciones</h3>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(stars => {
                const count = MOCK_RATINGS.filter(r => r.rating === stars).length;
                const pct = (count / MOCK_RATINGS.length) * 100;
                return (
                  <div key={stars} className="flex items-center gap-3">
                    <div className="flex items-center gap-0.5 w-24 flex-shrink-0">
                      {[...Array(stars)].map((_, i) => <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />)}
                    </div>
                    <div className="flex-1 h-3 bg-dark-700 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}
                        className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full" />
                    </div>
                    <span className="text-gray-400 text-xs w-8">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por mecánico o usuario..."
                className="input-field pl-9 text-sm" />
            </div>
            <select value={filterRating} onChange={e => setFilterRating(e.target.value as typeof filterRating)}
              className="input-field text-sm">
              <option value="all">Todas las estrellas</option>
              {[5, 4, 3, 2, 1].map(n => <option key={n} value={String(n)}>{n} estrella{n !== 1 ? 's' : ''}</option>)}
            </select>
          </div>

          {/* Lista de calificaciones */}
          <div className="space-y-3">
            {filtered.map(r => (
              <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="card p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white font-bold">{r.mechanicName}</p>
                    <p className="text-gray-400 text-xs">{r.serviceType} · por {r.userName}</p>
                  </div>
                  <div className="text-right">
                    <StarRow rating={r.rating} />
                    <p className="text-gray-500 text-xs mt-1">{r.date}</p>
                  </div>
                </div>
                {r.comment && (
                  <p className="text-gray-300 text-sm bg-dark-800/50 rounded-lg p-3 italic">"{r.comment}"</p>
                )}
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No se encontraron calificaciones</p>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
