import { createContext, useState, ReactNode } from 'react';
import { pqrService, type CreatePQRRequest } from '@/services/pqrService';
import type { PQRTicket, PQRFilters } from '@/types/pqr';

interface PQRContextType {
  tickets: PQRTicket[];
  isLoading: boolean;
  error: string | null;
  fieldErrors: Record<string, string | string[]> | null;
  loadTickets: (filters?: PQRFilters) => Promise<void>;
  createTicket: (data: CreatePQRRequest) => Promise<boolean>;
  clearError: () => void;
}

export const PQRContext = createContext<PQRContextType | undefined>(undefined);

interface PQRProviderProps {
  children: ReactNode;
}

export function PQRProvider({ children }: PQRProviderProps) {
  const [tickets, setTickets] = useState<PQRTicket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | string[]> | null>(null);

  async function loadTickets(filters: PQRFilters = {}) {
    setIsLoading(true);
    setError(null);
    try {
      const response = await pqrService.list(filters);
      if (response.success) {
        setTickets(response.data.pqr);
      } else {
        setError(response.error);
      }
    } catch {
      setError('Error al cargar tus tickets PQR');
    } finally {
      setIsLoading(false);
    }
  }

  async function createTicket(data: CreatePQRRequest): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    setFieldErrors(null);
    try {
      const response = await pqrService.create(data);
      if (response.success) {
        await loadTickets();
        setIsLoading(false);
        return true;
      } else {
        setError(response.error);
        setFieldErrors(response.fields ?? null);
        setIsLoading(false);
        return false;
      }
    } catch {
      setError('Error al crear el ticket');
      setIsLoading(false);
      return false;
    }
  }

  function clearError() {
    setError(null);
    setFieldErrors(null);
  }

  const value: PQRContextType = {
    tickets,
    isLoading,
    error,
    fieldErrors,
    loadTickets,
    createTicket,
    clearError,
  };

  return <PQRContext.Provider value={value}>{children}</PQRContext.Provider>;
}
