import type { PQRStatus, PQRType } from '@/types/pqr';

export const PQR_TYPE_LABELS: Record<PQRType, string> = {
  peticion: 'Petición',
  queja: 'Queja',
  reclamo: 'Reclamo',
  sugerencia: 'Sugerencia',
};

export const PQR_STATUS_CONFIG: Record<PQRStatus, { label: string; cls: string }> = {
  pending:   { label: 'Pendiente',   cls: 'bg-yellow-900/50 border-yellow-700 text-yellow-200' },
  in_review: { label: 'En revisión', cls: 'bg-blue-900/50 border-blue-700 text-blue-200' },
  resolved:  { label: 'Resuelto',    cls: 'bg-green-900/50 border-green-700 text-green-200' },
  rejected:  { label: 'Rechazado',   cls: 'bg-red-900/50 border-red-700 text-red-200' },
};
