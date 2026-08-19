import { createContext, useState, ReactNode } from 'react';
import { mechanicApplicationService } from '@/services/mechanicApplicationService';
import type {
  MechanicApplication,
  MechanicApplicationFilters,
} from '@/types/mechanicApplication';
import type { PaginationMeta } from '@/types/pagination';

const EMPTY_PAGINATION: PaginationMeta = { total: 0, page: 1, perPage: 50, totalPages: 0 };

interface MechanicApplicationContextType {
  // Usuario
  myApplications: MechanicApplication[];
  loadMyApplications: () => Promise<void>;
  createApplication: (justification: string) => Promise<boolean>;
  cancelApplication: (id: number) => Promise<boolean>;

  // Administrador
  adminApplications: MechanicApplication[];
  adminPagination: PaginationMeta;
  loadAdminApplications: (filters?: MechanicApplicationFilters, page?: number) => Promise<void>;
  approveApplication: (id: number) => Promise<boolean>;
  rejectApplication: (id: number, rejectionReason: string) => Promise<boolean>;

  isLoading: boolean;
  error: string | null;
  fieldErrors: Record<string, string | string[]> | null;
  clearError: () => void;
}

export const MechanicApplicationContext = createContext<MechanicApplicationContextType | undefined>(undefined);

interface MechanicApplicationProviderProps {
  children: ReactNode;
}

export function MechanicApplicationProvider({ children }: MechanicApplicationProviderProps) {
  const [myApplications, setMyApplications] = useState<MechanicApplication[]>([]);
  const [adminApplications, setAdminApplications] = useState<MechanicApplication[]>([]);
  const [adminPagination, setAdminPagination] = useState<PaginationMeta>(EMPTY_PAGINATION);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | string[]> | null>(null);

  async function loadMyApplications() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await mechanicApplicationService.myApplications();
      if (response.success) {
        setMyApplications(response.data.applications);
      } else {
        setError(response.error);
      }
    } catch {
      setError('Error al cargar tus solicitudes');
    } finally {
      setIsLoading(false);
    }
  }

  async function createApplication(justification: string): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    setFieldErrors(null);
    try {
      const response = await mechanicApplicationService.create({ justification });
      if (response.success) {
        await loadMyApplications();
        setIsLoading(false);
        return true;
      }
      setError(response.error);
      setFieldErrors(response.fields ?? null);
      setIsLoading(false);
      return false;
    } catch {
      setError('Error al enviar la solicitud');
      setIsLoading(false);
      return false;
    }
  }

  async function cancelApplication(id: number): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    try {
      const response = await mechanicApplicationService.cancel(id);
      if (response.success) {
        setMyApplications((prev) => prev.map((a) => (a.id === id ? response.data.application : a)));
        setIsLoading(false);
        return true;
      }
      setError(response.error);
      setIsLoading(false);
      return false;
    } catch {
      setError('Error al cancelar la solicitud');
      setIsLoading(false);
      return false;
    }
  }

  async function loadAdminApplications(filters: MechanicApplicationFilters = {}, page: number = 1) {
    setIsLoading(true);
    setError(null);
    try {
      const response = await mechanicApplicationService.adminList(filters, page);
      if (response.success) {
        setAdminApplications(response.data.applications);
        setAdminPagination({
          total: response.data.total,
          page: response.data.page,
          perPage: response.data.perPage,
          totalPages: response.data.totalPages,
        });
      } else {
        setError(response.error);
      }
    } catch {
      setError('Error al cargar las solicitudes de mecánico');
    } finally {
      setIsLoading(false);
    }
  }

  async function approveApplication(id: number): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    try {
      const response = await mechanicApplicationService.approve(id);
      if (response.success) {
        // approve() devuelve la fila cruda de admin_access_requests, sin los
        // JOIN de nombre/email/licencia que sí trae adminList() — se
        // combina con lo que ya estaba en pantalla para no perder esos
        // datos del candidato tras la acción.
        setAdminApplications((prev) => prev.map((a) => (a.id === id ? { ...a, ...response.data.application } : a)));
        setIsLoading(false);
        return true;
      }
      setError(response.error);
      setIsLoading(false);
      return false;
    } catch {
      setError('Error al aprobar la solicitud');
      setIsLoading(false);
      return false;
    }
  }

  async function rejectApplication(id: number, rejectionReason: string): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    try {
      const response = await mechanicApplicationService.reject(id, rejectionReason);
      if (response.success) {
        // Mismo motivo que en approveApplication(): merge parcial para
        // conservar los campos con JOIN que reject() no devuelve.
        setAdminApplications((prev) => prev.map((a) => (a.id === id ? { ...a, ...response.data.application } : a)));
        setIsLoading(false);
        return true;
      }
      setError(response.error);
      setIsLoading(false);
      return false;
    } catch {
      setError('Error al rechazar la solicitud');
      setIsLoading(false);
      return false;
    }
  }

  function clearError() {
    setError(null);
    setFieldErrors(null);
  }

  const value: MechanicApplicationContextType = {
    myApplications,
    loadMyApplications,
    createApplication,
    cancelApplication,
    adminApplications,
    adminPagination,
    loadAdminApplications,
    approveApplication,
    rejectApplication,
    isLoading,
    error,
    fieldErrors,
    clearError,
  };

  return (
    <MechanicApplicationContext.Provider value={value}>
      {children}
    </MechanicApplicationContext.Provider>
  );
}
