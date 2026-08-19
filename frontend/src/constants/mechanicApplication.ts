import type { MechanicApplicationStatus } from '@/types/mechanicApplication';

export const MECHANIC_APPLICATION_STATUS_CONFIG: Record<MechanicApplicationStatus, { label: string; cls: string }> = {
  pending:   { label: 'Pendiente de revisión', cls: 'bg-yellow-900/50 border-yellow-700 text-yellow-200' },
  approved:  { label: 'Aprobada',              cls: 'bg-green-900/50 border-green-700 text-green-200' },
  rejected:  { label: 'Rechazada',             cls: 'bg-red-900/50 border-red-700 text-red-200' },
  cancelled: { label: 'Cancelada',             cls: 'bg-gray-700/50 border-gray-600 text-gray-300' },
};
