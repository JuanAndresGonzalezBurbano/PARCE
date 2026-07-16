import { createContext, useState, ReactNode } from 'react';
import { adminService } from '@/services/adminService';
import type { DashboardStats, AdminRating, RatingFilters } from '@/types/admin';
import type { PQRTicket, PQRFilters } from '@/types/pqr';
import type { Survey } from '@/types/survey';

interface AdminContextType {
  // Dashboard
  stats: DashboardStats | null;
  loadDashboard: () => Promise<void>;

  // Calificaciones
  ratings: AdminRating[];
  loadRatings: (filters?: RatingFilters) => Promise<void>;

  // PQR
  pqrTickets: PQRTicket[];
  loadPqr: (filters?: PQRFilters) => Promise<void>;
  updatePqrStatus: (id: number, status: string) => Promise<boolean>;
  respondPqr: (id: number, adminResponse: string) => Promise<boolean>;

  // Encuestas
  surveys: Survey[];
  loadSurveys: () => Promise<void>;

  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export const AdminContext = createContext<AdminContextType | undefined>(undefined);

interface AdminProviderProps {
  children: ReactNode;
}

export function AdminProvider({ children }: AdminProviderProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [ratings, setRatings] = useState<AdminRating[]>([]);
  const [pqrTickets, setPqrTickets] = useState<PQRTicket[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadDashboard() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminService.getDashboard();
      if (response.success) {
        setStats(response.data.summary);
      } else {
        setError(response.error);
      }
    } catch {
      setError('Error al cargar el resumen del dashboard');
    } finally {
      setIsLoading(false);
    }
  }

  async function loadRatings(filters: RatingFilters = {}) {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminService.getRatings(filters);
      if (response.success) {
        setRatings(response.data.ratings);
      } else {
        setError(response.error);
      }
    } catch {
      setError('Error al cargar las calificaciones');
    } finally {
      setIsLoading(false);
    }
  }

  async function loadPqr(filters: PQRFilters = {}) {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminService.getPqrList(filters);
      if (response.success) {
        setPqrTickets(response.data.pqr);
      } else {
        setError(response.error);
      }
    } catch {
      setError('Error al cargar los tickets PQR');
    } finally {
      setIsLoading(false);
    }
  }

  async function updatePqrStatus(id: number, status: string): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminService.updatePqrStatus(id, status);
      if (response.success) {
        setPqrTickets((prev) => prev.map((t) => (t.id === id ? response.data.pqr : t)));
        setIsLoading(false);
        return true;
      }
      setError(response.error);
      setIsLoading(false);
      return false;
    } catch {
      setError('Error al actualizar el estado del ticket');
      setIsLoading(false);
      return false;
    }
  }

  async function respondPqr(id: number, adminResponse: string): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminService.respondPqr(id, adminResponse);
      if (response.success) {
        setPqrTickets((prev) => prev.map((t) => (t.id === id ? response.data.pqr : t)));
        setIsLoading(false);
        return true;
      }
      setError(response.error);
      setIsLoading(false);
      return false;
    } catch {
      setError('Error al responder el ticket');
      setIsLoading(false);
      return false;
    }
  }

  async function loadSurveys() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminService.getSurveys();
      if (response.success) {
        setSurveys(response.data.surveys);
      } else {
        setError(response.error);
      }
    } catch {
      setError('Error al cargar las encuestas');
    } finally {
      setIsLoading(false);
    }
  }

  function clearError() {
    setError(null);
  }

  const value: AdminContextType = {
    stats,
    loadDashboard,
    ratings,
    loadRatings,
    pqrTickets,
    loadPqr,
    updatePqrStatus,
    respondPqr,
    surveys,
    loadSurveys,
    isLoading,
    error,
    clearError,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}
