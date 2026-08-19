import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMechanicApplication } from '@/hooks/useMechanicApplication';
import type { MechanicApplicationStatus, MechanicApplicationFilters } from '@/types/mechanicApplication';
import { MECHANIC_APPLICATION_STATUS_CONFIG as STATUS_CONFIG } from '@/constants/mechanicApplication';
import Pagination from '@/components/common/Pagination';

export default function AdminMechanicApplicationsPage() {
  const {
    adminApplications,
    adminPagination,
    isLoading,
    error,
    loadAdminApplications,
    approveApplication,
    rejectApplication,
    clearError,
  } = useMechanicApplication();

  const [statusFilter, setStatusFilter] = useState<MechanicApplicationStatus | ''>('pending');
  const [appliedFilters, setAppliedFilters] = useState<MechanicApplicationFilters>({ status: 'pending' });
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  useEffect(() => {
    loadAdminApplications({ status: 'pending' });
  }, []);

  function handleFilterChange(status: MechanicApplicationStatus | '') {
    setStatusFilter(status);
    clearError();
    const filters: MechanicApplicationFilters = status ? { status } : {};
    setAppliedFilters(filters);
    loadAdminApplications(filters, 1);
  }

  function goToPage(page: number) {
    loadAdminApplications(appliedFilters, page);
  }

  function handleToggleExpand(id: number) {
    setExpandedId(expandedId === id ? null : id);
    setRejectionReason('');
    clearError();
  }

  async function handleApprove(id: number) {
    setSubmittingId(id);
    const success = await approveApplication(id);
    setSubmittingId(null);
    if (success) setExpandedId(null);
  }

  async function handleReject(id: number) {
    if (!rejectionReason.trim()) return;
    setSubmittingId(id);
    const success = await rejectApplication(id, rejectionReason.trim());
    setSubmittingId(null);
    if (success) {
      setRejectionReason('');
      setExpandedId(null);
    }
  }

  function isLicenseExpired(expirationDate?: string | null): boolean {
    if (!expirationDate) return false;
    return expirationDate < new Date().toISOString().slice(0, 10);
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Solicitudes de Mecánico</h1>
          <Link to="/admin/dashboard" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700">
            ← Dashboard
          </Link>
        </div>

        {/* Filtro por estado */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6 flex flex-wrap gap-2">
          {(['', 'pending', 'approved', 'rejected', 'cancelled'] as const).map((status) => (
            <button
              key={status || 'all'}
              onClick={() => handleFilterChange(status)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                statusFilter === status
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              {status === '' ? 'Todas' : STATUS_CONFIG[status].label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">{error}</div>
        )}

        {isLoading && adminApplications.length === 0 && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <p className="text-gray-400">Cargando solicitudes...</p>
          </div>
        )}

        {!isLoading && adminApplications.length === 0 && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
            <p className="text-gray-400">No hay solicitudes con estos filtros.</p>
          </div>
        )}

        <div className="space-y-4">
          <p className="text-gray-400 text-sm">{adminApplications.length} solicitud(es)</p>

          {adminApplications.map((app) => {
            const statusCfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.pending;
            const isExpanded = expandedId === app.id;
            const isBusy = submittingId === app.id;
            const licenseExpired = isLicenseExpired(app.driverLicenseExpirationDate);

            return (
              <div key={app.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-lg font-bold text-white">
                        {app.applicantFirstName} {app.applicantLastName}
                      </h3>
                      <span className={`px-2 py-0.5 border rounded-full text-xs font-medium ${statusCfg.cls}`}>
                        {statusCfg.label}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{app.applicantEmail}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      Solicitado el {new Date(app.createdAt).toLocaleString('es-CO')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleExpand(app.id)}
                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors flex-shrink-0"
                  >
                    {isExpanded ? 'Ocultar' : 'Ver detalle'}
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-700 space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Justificación</p>
                      <p className="text-gray-300 text-sm">{app.justification}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Licencia de conducción</p>
                      {app.driverLicenseNumber ? (
                        <div className="text-sm text-gray-300 space-y-1">
                          <p>Número: {app.driverLicenseNumber}</p>
                          <p className={licenseExpired ? 'text-red-400 font-medium' : ''}>
                            Vencimiento: {app.driverLicenseExpirationDate}
                            {licenseExpired && ' (vencida)'}
                          </p>
                          {app.driverLicenseDocumentUrl && (
                            <a
                              href={app.driverLicenseDocumentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:underline inline-block"
                            >
                              Ver documento ↗
                            </a>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm italic">Sin licencia registrada</p>
                      )}
                    </div>

                    {app.status !== 'pending' && app.reviewerFirstName && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Revisado por</p>
                        <p className="text-gray-300 text-sm">
                          {app.reviewerFirstName} {app.reviewerLastName}
                          {app.reviewedAt && ` · ${new Date(app.reviewedAt).toLocaleString('es-CO')}`}
                        </p>
                      </div>
                    )}

                    {app.status === 'rejected' && app.rejectionReason && (
                      <div className="p-3 bg-red-900/20 border border-red-800/50 rounded-lg">
                        <p className="text-xs text-red-300 uppercase tracking-wide mb-1">Motivo del rechazo</p>
                        <p className="text-gray-200 text-sm">{app.rejectionReason}</p>
                      </div>
                    )}

                    {app.status === 'pending' && (
                      <div className="pt-2 border-t border-gray-700/50 space-y-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(app.id)}
                            disabled={isBusy}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            {isBusy ? 'Procesando...' : 'Aprobar'}
                          </button>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">Motivo de rechazo (obligatorio para rechazar)</label>
                          <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            placeholder="Explica por qué se rechaza la solicitud..."
                          />
                          <button
                            onClick={() => handleReject(app.id)}
                            disabled={isBusy || !rejectionReason.trim()}
                            className="mt-2 px-4 py-2 bg-red-900/40 hover:bg-red-900/70 border border-red-800 text-red-300 disabled:opacity-50 text-sm font-medium rounded-lg transition-colors"
                          >
                            {isBusy ? 'Procesando...' : 'Rechazar'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <Pagination
          page={adminPagination.page}
          totalPages={adminPagination.totalPages}
          total={adminPagination.total}
          onPageChange={goToPage}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
