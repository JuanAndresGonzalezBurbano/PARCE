import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import type { RatingFilters } from '@/types/admin';
import Pagination from '@/components/common/Pagination';

const EMERGENCY_LABELS: Record<string, string> = {
  tire: 'Llanta pinchada', battery: 'Batería descargada', fuel: 'Sin combustible',
  engine: 'Falla de motor', lockout: 'Puertas bloqueadas', tow: 'Necesito grúa', other: 'Otro',
};

export default function AdminRatingsPage() {
  const { ratings, ratingsPagination, isLoading, error, loadRatings } = useAdmin();

  const [minRating, setMinRating] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Filtros realmente aplicados — separados del estado de los inputs para que
  // cambiar de página no reenvíe un filtro editado pero no confirmado.
  const [appliedFilters, setAppliedFilters] = useState<RatingFilters>({});

  useEffect(() => { loadRatings(); }, []);

  function applyFilters() {
    const filters: RatingFilters = {
      minRating: minRating ? Number(minRating) : undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    };
    setAppliedFilters(filters);
    // Un cambio de filtro siempre vuelve a la página 1.
    loadRatings(filters, 1);
  }

  function clearFilters() {
    setMinRating('');
    setDateFrom('');
    setDateTo('');
    setAppliedFilters({});
    loadRatings({}, 1);
  }

  function goToPage(page: number) {
    loadRatings(appliedFilters, page);
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Calificaciones</h1>
          <Link to="/admin/dashboard" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700">
            ← Dashboard
          </Link>
        </div>

        {/* Filtros */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6 flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Calificación mínima</label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Cualquiera</option>
              <option value="5">5 estrellas</option>
              <option value="4">4 o más</option>
              <option value="3">3 o más</option>
              <option value="2">2 o más</option>
              <option value="1">1 o más</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Desde</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Hasta</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Filtrar
          </button>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
          >
            Limpiar
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">{error}</div>
        )}

        {isLoading && ratings.length === 0 && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <p className="text-gray-400">Cargando calificaciones...</p>
          </div>
        )}

        {!isLoading && ratings.length === 0 && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
            <p className="text-gray-400">No hay calificaciones con estos filtros.</p>
          </div>
        )}

        <div className="space-y-4">
          {ratings.length > 0 && <p className="text-gray-400 text-sm">{ratings.length} calificación(es)</p>}

          {ratings.map((rating) => (
            <div key={rating.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                <div>
                  <h3 className="text-white font-semibold">
                    {EMERGENCY_LABELS[rating.emergencyType] ?? rating.emergencyType}
                  </h3>
                  <p className="text-gray-500 text-xs">{rating.serviceCode}</p>
                </div>
                <p className="text-yellow-400 text-lg">
                  {'★'.repeat(rating.customerRating)}{'☆'.repeat(5 - rating.customerRating)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-2">
                <p className="text-gray-400 text-sm">
                  Cliente: <span className="text-white">{rating.customerFirstName} {rating.customerLastName}</span>
                </p>
                {rating.mechanicFirstName && (
                  <p className="text-gray-400 text-sm">
                    Mecánico: <span className="text-white">{rating.mechanicFirstName} {rating.mechanicLastName}</span>
                  </p>
                )}
              </div>

              {(rating.punctualityRating || rating.serviceQualityRating) && (
                <div className="flex gap-4 text-xs text-gray-400 mb-2">
                  {rating.punctualityRating && (
                    <span>Puntualidad: {'★'.repeat(rating.punctualityRating)}{'☆'.repeat(5 - rating.punctualityRating)}</span>
                  )}
                  {rating.serviceQualityRating && (
                    <span>Calidad: {'★'.repeat(rating.serviceQualityRating)}{'☆'.repeat(5 - rating.serviceQualityRating)}</span>
                  )}
                </div>
              )}

              {rating.customerFeedback && (
                <p className="text-gray-300 text-sm italic">"{rating.customerFeedback}"</p>
              )}

              {rating.completedAt && (
                <p className="text-gray-500 text-xs mt-2">
                  Completado: {new Date(rating.completedAt).toLocaleString('es-CO')}
                </p>
              )}
            </div>
          ))}
        </div>

        <Pagination
          page={ratingsPagination.page}
          totalPages={ratingsPagination.totalPages}
          total={ratingsPagination.total}
          onPageChange={goToPage}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
