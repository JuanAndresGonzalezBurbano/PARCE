import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePqr } from '@/hooks/usePqr';
import type { PQRStatus, PQRType } from '@/types/pqr';
import { PQR_TYPE_LABELS, PQR_STATUS_CONFIG } from '@/constants/pqr';
import { fieldErrorFor as sharedFieldErrorFor } from '@/utils/apiErrors';

const inputCls = 'w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500';
const inputErrorCls = 'w-full px-3 py-2 bg-gray-700 border border-red-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500';

export default function PQRPage() {
  const { tickets, isLoading, error, fieldErrors, loadTickets, createTicket, clearError } = usePqr();

  function fieldErrorFor(snakeKey: string): string | undefined {
    return sharedFieldErrorFor(fieldErrors, snakeKey);
  }

  const FieldError = ({ name }: { name: string }) => {
    const message = fieldErrorFor(name);
    if (!message) return null;
    return <p className="text-red-400 text-xs mt-1">{message}</p>;
  };

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<PQRStatus | ''>('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [type, setType] = useState<PQRType>('peticion');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => { loadTickets(); }, []);

  function handleFilterChange(status: PQRStatus | '') {
    setStatusFilter(status);
    clearError();
    loadTickets(status ? { status } : {});
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const success = await createTicket({ type, subject, description });
    if (success) {
      setShowCreateForm(false);
      setType('peticion');
      setSubject('');
      setDescription('');
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Mis PQR</h1>
          <Link to="/dashboard" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700">
            ← Dashboard
          </Link>
        </div>

        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex flex-wrap gap-2">
            {(['', 'pending', 'in_review', 'resolved', 'rejected'] as const).map((status) => (
              <button
                key={status || 'all'}
                onClick={() => handleFilterChange(status)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  statusFilter === status
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                {status === '' ? 'Todos' : PQR_STATUS_CONFIG[status].label}
              </button>
            ))}
          </div>
          <button
            onClick={() => { clearError(); setShowCreateForm(true); }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
          >
            + Nuevo ticket
          </button>
        </div>

        {error && !showCreateForm && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">{error}</div>
        )}

        {isLoading && tickets.length === 0 && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <p className="text-gray-400">Cargando tus tickets...</p>
          </div>
        )}

        {!isLoading && tickets.length === 0 && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
            <p className="text-gray-400 mb-4">Aún no has creado ningún ticket PQR.</p>
            <button
              onClick={() => { clearError(); setShowCreateForm(true); }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Crear tu primer ticket
            </button>
          </div>
        )}

        <div className="space-y-3">
          {tickets.map((ticket) => {
            const statusCfg = PQR_STATUS_CONFIG[ticket.status] ?? PQR_STATUS_CONFIG.pending;
            const isExpanded = expandedId === ticket.id;
            return (
              <div key={ticket.id} className="bg-gray-800 border border-gray-700 rounded-lg p-5">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-white font-semibold">{ticket.subject}</h3>
                      <span className={`px-2 py-0.5 border rounded-full text-xs font-medium ${statusCfg.cls}`}>
                        {statusCfg.label}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-700 border border-gray-600 rounded-full text-xs text-gray-300">
                        {PQR_TYPE_LABELS[ticket.type] ?? ticket.type}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs">{ticket.ticketCode} · {new Date(ticket.createdAt).toLocaleString('es-CO')}</p>
                  </div>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : ticket.id)}
                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors flex-shrink-0"
                  >
                    {isExpanded ? 'Ocultar' : 'Ver detalle'}
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-700 space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Descripción</p>
                      <p className="text-gray-300 text-sm">{ticket.description}</p>
                    </div>
                    {ticket.adminResponse ? (
                      <div className="p-3 bg-green-900/20 border border-green-800/50 rounded-lg">
                        <p className="text-xs text-green-300 uppercase tracking-wide mb-1">Respuesta de P.A.R.C.E</p>
                        <p className="text-gray-200 text-sm">{ticket.adminResponse}</p>
                        {ticket.respondedAt && (
                          <p className="text-gray-500 text-xs mt-1">{new Date(ticket.respondedAt).toLocaleString('es-CO')}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm italic">Aún sin respuesta.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal crear ticket */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-lg w-full shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-4">Nuevo ticket PQR</h2>
              {error && (
                <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">{error}</div>
              )}
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Tipo *</label>
                  <select required value={type} onChange={(e) => setType(e.target.value as PQRType)} className={fieldErrorFor('type') ? inputErrorCls : inputCls}>
                    {Object.entries(PQR_TYPE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                  <FieldError name="type" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Asunto *</label>
                  <input
                    required
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    maxLength={150}
                    className={fieldErrorFor('subject') ? inputErrorCls : inputCls}
                    placeholder="Resume brevemente tu solicitud"
                  />
                  <FieldError name="subject" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Descripción *</label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className={(fieldErrorFor('description') ? inputErrorCls : inputCls) + ' resize-none'}
                    placeholder="Describe tu petición, queja, reclamo o sugerencia en detalle..."
                  />
                  <FieldError name="description" />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="submit" disabled={isLoading} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors">
                    {isLoading ? 'Enviando...' : 'Enviar ticket'}
                  </button>
                  <button type="button" onClick={() => { clearError(); setShowCreateForm(false); }} className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
