import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import type { PQRStatus, PQRType, PQRFilters } from '@/types/pqr';
import { PQR_TYPE_LABELS as TYPE_LABELS, PQR_STATUS_CONFIG as STATUS_CONFIG } from '@/constants/pqr';
import Pagination from '@/components/common/Pagination';

export default function AdminPQRPage() {
  const { pqrTickets, pqrPagination, isLoading, error, loadPqr, updatePqrStatus, respondPqr, clearError } = useAdmin();

  const [statusFilter, setStatusFilter] = useState<PQRStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<PQRType | ''>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtros realmente aplicados (los que ya se enviaron al backend) — separados
  // del estado de los inputs para que cambiar de página no reenvíe por error
  // un filtro editado pero aún no confirmado con el botón "Filtrar".
  const [appliedFilters, setAppliedFilters] = useState<PQRFilters>({});

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [responseText, setResponseText] = useState('');
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  useEffect(() => { loadPqr(); }, []);

  function applyFilters() {
    clearError();
    const filters: PQRFilters = {
      status: statusFilter || undefined,
      type: typeFilter || undefined,
      q: searchQuery.trim() || undefined,
    };
    setAppliedFilters(filters);
    // Un cambio de filtro/búsqueda siempre vuelve a la página 1 — la página
    // actual puede no existir más bajo el nuevo filtro.
    loadPqr(filters, 1);
  }

  function goToPage(page: number) {
    loadPqr(appliedFilters, page);
  }

  function handleToggleExpand(id: number) {
    setExpandedId(expandedId === id ? null : id);
    setResponseText('');
    clearError();
  }

  async function handleRespond(id: number) {
    if (!responseText.trim()) return;
    setSubmittingId(id);
    const success = await respondPqr(id, responseText.trim());
    setSubmittingId(null);
    if (success) {
      setResponseText('');
      setExpandedId(null);
    }
  }

  async function handleStatusChange(id: number, status: PQRStatus) {
    setSubmittingId(id);
    await updatePqrStatus(id, status);
    setSubmittingId(null);
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Gestión de PQR</h1>
          <Link to="/admin/dashboard" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700">
            ← Dashboard
          </Link>
        </div>

        {/* Filtros */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6 flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Estado</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PQRStatus | '')}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              {Object.entries(STATUS_CONFIG).map(([value, cfg]) => (
                <option key={value} value={value}>{cfg.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Tipo</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as PQRType | '')}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-400 mb-1">Buscar</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Asunto, descripción o código de ticket..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Filtrar
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">{error}</div>
        )}

        {isLoading && pqrTickets.length === 0 && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <p className="text-gray-400">Cargando tickets...</p>
          </div>
        )}

        {!isLoading && pqrTickets.length === 0 && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
            <p className="text-gray-400">No hay tickets PQR con estos filtros.</p>
          </div>
        )}

        <div className="space-y-4">
          <p className="text-gray-400 text-sm">{pqrTickets.length} ticket(s)</p>

          {pqrTickets.map((ticket) => {
            const statusCfg = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.pending;
            const isExpanded = expandedId === ticket.id;
            const isBusy = submittingId === ticket.id;

            return (
              <div key={ticket.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-lg font-bold text-white">{ticket.subject}</h3>
                      <span className={`px-2 py-0.5 border rounded-full text-xs font-medium ${statusCfg.cls}`}>
                        {statusCfg.label}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-700 border border-gray-600 rounded-full text-xs text-gray-300">
                        {TYPE_LABELS[ticket.type] ?? ticket.type}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs mb-1">{ticket.ticketCode}</p>
                    <p className="text-gray-400 text-sm">
                      {ticket.reporterFirstName} {ticket.reporterLastName} · {ticket.reporterEmail}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      {new Date(ticket.createdAt).toLocaleString('es-CO')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleExpand(ticket.id)}
                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors flex-shrink-0"
                  >
                    {isExpanded ? 'Ocultar' : 'Ver detalle'}
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-700 space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Descripción</p>
                      <p className="text-gray-300 text-sm">{ticket.description}</p>
                    </div>

                    {ticket.adminResponse && (
                      <div className="p-3 bg-green-900/20 border border-green-800/50 rounded-lg">
                        <p className="text-xs text-green-300 uppercase tracking-wide mb-1">Respuesta del administrador</p>
                        <p className="text-gray-200 text-sm">{ticket.adminResponse}</p>
                        {ticket.respondedAt && (
                          <p className="text-gray-500 text-xs mt-1">
                            {new Date(ticket.respondedAt).toLocaleString('es-CO')}
                          </p>
                        )}
                      </div>
                    )}

                    {!ticket.adminResponse && (
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Responder al usuario</label>
                        <textarea
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          placeholder="Escribe una respuesta..."
                        />
                        <button
                          onClick={() => handleRespond(ticket.id)}
                          disabled={isBusy || !responseText.trim()}
                          className="mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          {isBusy ? 'Enviando...' : 'Responder y marcar resuelto'}
                        </button>
                      </div>
                    )}

                    {(ticket.status === 'pending' || ticket.status === 'in_review') && (
                      <div className="flex gap-2 pt-2 border-t border-gray-700/50">
                        {ticket.status === 'pending' && (
                          <button
                            onClick={() => handleStatusChange(ticket.id, 'in_review')}
                            disabled={isBusy}
                            className="px-3 py-1.5 bg-blue-900/40 hover:bg-blue-900/70 border border-blue-800 text-blue-300 text-sm rounded-lg transition-colors disabled:opacity-50"
                          >
                            Marcar en revisión
                          </button>
                        )}
                        <button
                          onClick={() => handleStatusChange(ticket.id, 'rejected')}
                          disabled={isBusy}
                          className="px-3 py-1.5 bg-red-900/40 hover:bg-red-900/70 border border-red-800 text-red-300 text-sm rounded-lg transition-colors disabled:opacity-50"
                        >
                          Rechazar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <Pagination
          page={pqrPagination.page}
          totalPages={pqrPagination.totalPages}
          total={pqrPagination.total}
          onPageChange={goToPage}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
