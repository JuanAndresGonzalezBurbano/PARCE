import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';

export default function AdminSurveysPage() {
  const { surveys, isLoading, error, loadSurveys } = useAdmin();

  useEffect(() => { loadSurveys(); }, []);

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Encuestas de Satisfacción</h1>
          <Link to="/admin/dashboard" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700">
            ← Dashboard
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">{error}</div>
        )}

        {isLoading && surveys.length === 0 && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <p className="text-gray-400">Cargando encuestas...</p>
          </div>
        )}

        {!isLoading && surveys.length === 0 && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
            <p className="text-gray-400">Aún no hay encuestas enviadas por los clientes.</p>
          </div>
        )}

        <div className="space-y-4">
          {surveys.length > 0 && <p className="text-gray-400 text-sm">{surveys.length} encuesta(s)</p>}

          {surveys.map((survey) => (
            <div key={survey.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                <div>
                  <p className="text-gray-500 text-xs mb-1">{survey.serviceCode}</p>
                  <p className="text-gray-400 text-sm">
                    Cliente: <span className="text-white">{survey.customerFirstName} {survey.customerLastName}</span>
                  </p>
                  {survey.mechanicFirstName && (
                    <p className="text-gray-400 text-sm">
                      Mecánico: <span className="text-white">{survey.mechanicFirstName} {survey.mechanicLastName}</span>
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-yellow-400 text-lg">
                    {'★'.repeat(survey.overallSatisfaction)}{'☆'.repeat(5 - survey.overallSatisfaction)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(survey.createdAt).toLocaleDateString('es-CO')}
                  </p>
                </div>
              </div>

              <p className="text-sm mb-2">
                <span className="text-gray-500">¿Recomendaría el servicio?</span>{' '}
                <span className={survey.wouldRecommend ? 'text-green-400' : 'text-red-400'}>
                  {survey.wouldRecommend ? 'Sí' : 'No'}
                </span>
              </p>

              {survey.comments && (
                <p className="text-gray-300 text-sm italic mt-2">"{survey.comments}"</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
