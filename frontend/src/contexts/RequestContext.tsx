import { createContext, useState, ReactNode } from 'react';
import { serviceRequestService } from '@/services/serviceRequestService';
import { surveyService } from '@/services/surveyService';
import type {
  ServiceRequest,
  CreateServiceRequestRequest,
} from '@/types/serviceRequest';

interface RequestContextType {
  requests: ServiceRequest[];
  currentRequest: ServiceRequest | null;
  isLoading: boolean;
  error: string | null;
  fieldErrors: Record<string, string> | null;
  loadRequests: (status?: string) => Promise<void>;
  refreshRequestsSilently: () => Promise<ServiceRequest[] | null>;
  loadMechanicRequests: (status?: string) => Promise<void>;
  loadMechanicRequestDetails: (id: number) => Promise<void>;
  createRequest: (data: CreateServiceRequestRequest) => Promise<boolean>;
  cancelRequest: (id: number, reason: string) => Promise<boolean>;
  rateRequest: (id: number, customerRating: number, punctualityRating: number, serviceQualityRating: number, feedback?: string) => Promise<boolean>;
  loadAvailableRequests: (latitude: number, longitude: number) => Promise<void>;
  /** Igual que loadAvailableRequests pero sin activar isLoading — para refrescos periódicos en segundo plano. */
  refreshAvailableRequestsSilently: (latitude: number, longitude: number) => Promise<ServiceRequest[] | null>;
  acceptRequest: (id: number) => Promise<boolean>;
  startRequest: (id: number) => Promise<boolean>;
  completeRequest: (id: number, finalCost: number) => Promise<boolean>;
  selectRequest: (request: ServiceRequest | null) => void;
  clearError: () => void;
  /** IDs de service_request que ya tienen una encuesta enviada por el cliente actual. */
  surveyedRequestIds: Set<number>;
  loadMySurveys: () => Promise<void>;
  submitSurvey: (serviceRequestId: number, overallSatisfaction: number, wouldRecommend: boolean, comments?: string) => Promise<boolean>;
}

export const RequestContext = createContext<RequestContextType | undefined>(undefined);

interface RequestProviderProps {
  children: ReactNode;
}

export function RequestProvider({ children }: RequestProviderProps) {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [currentRequest, setCurrentRequest] = useState<ServiceRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(null);
  const [surveyedRequestIds, setSurveyedRequestIds] = useState<Set<number>>(new Set());

  async function loadRequests(status?: string) {
    setIsLoading(true);
    setError(null);
    try {
      const response = await serviceRequestService.getMyRequests(status);
      if (response.success) {
        setRequests(response.data.serviceRequests);
      } else {
        setError(response.error);
      }
    } catch {
      setError('Error al cargar las solicitudes');
    } finally {
      setIsLoading(false);
    }
  }

  /** Igual que loadRequests pero sin activar isLoading — para refrescos periódicos en segundo plano. */
  async function refreshRequestsSilently(): Promise<ServiceRequest[] | null> {
    try {
      const response = await serviceRequestService.getMyRequests();
      if (response.success) {
        setRequests(response.data.serviceRequests);
        return response.data.serviceRequests;
      }
      return null;
    } catch {
      return null;
    }
  }

  async function loadMechanicRequests(status?: string) {
    setIsLoading(true);
    setError(null);
    try {
      const response = await serviceRequestService.getMechanicRequests(status);
      if (response.success) {
        setRequests(response.data.serviceRequests);
      } else {
        setError(response.error);
      }
    } catch {
      setError('Error al cargar las solicitudes');
    } finally {
      setIsLoading(false);
    }
  }

  async function loadMechanicRequestDetails(id: number) {
    setIsLoading(true);
    setError(null);
    setCurrentRequest(null);
    try {
      const response = await serviceRequestService.getMechanicRequestDetails(id);
      if (response.success) {
        setCurrentRequest(response.data.serviceRequest);
      } else {
        setError(response.error);
      }
    } catch {
      setError('Error al cargar la solicitud');
    } finally {
      setIsLoading(false);
    }
  }

  async function createRequest(data: CreateServiceRequestRequest): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    setFieldErrors(null);
    try {
      const response = await serviceRequestService.createRequest(data);
      if (response.success) {
        await loadRequests();
        setIsLoading(false);
        return true;
      } else {
        setError(response.error);
        setFieldErrors(response.fields ?? null);
        setIsLoading(false);
        return false;
      }
    } catch {
      setError('Error al crear la solicitud');
      setIsLoading(false);
      return false;
    }
  }

  async function cancelRequest(id: number, reason: string): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    setFieldErrors(null);
    try {
      const response = await serviceRequestService.cancelRequest(id, { cancellation_reason: reason });
      if (response.success) {
        await loadRequests();
        setIsLoading(false);
        return true;
      } else {
        setError(response.error);
        setFieldErrors(response.fields ?? null);
        setIsLoading(false);
        return false;
      }
    } catch {
      setError('Error al cancelar la solicitud');
      setIsLoading(false);
      return false;
    }
  }

  async function rateRequest(
    id: number,
    customerRating: number,
    punctualityRating: number,
    serviceQualityRating: number,
    feedback?: string
  ): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    setFieldErrors(null);
    try {
      const response = await serviceRequestService.rateRequest(id, {
        customer_rating: customerRating,
        punctuality_rating: punctualityRating,
        service_quality_rating: serviceQualityRating,
        customer_feedback: feedback,
      });
      if (response.success) {
        await loadRequests();
        setIsLoading(false);
        return true;
      } else {
        setError(response.error);
        setFieldErrors(response.fields ?? null);
        setIsLoading(false);
        return false;
      }
    } catch {
      setError('Error al calificar la solicitud');
      setIsLoading(false);
      return false;
    }
  }

  async function loadAvailableRequests(latitude: number, longitude: number) {
    setIsLoading(true);
    setError(null);
    try {
      const response = await serviceRequestService.getAvailableRequests(latitude, longitude);
      if (response.success) {
        setRequests(response.data.serviceRequests);
      } else {
        setError(response.error);
      }
    } catch {
      setError('Error al cargar solicitudes disponibles');
    } finally {
      setIsLoading(false);
    }
  }

  async function refreshAvailableRequestsSilently(
    latitude: number,
    longitude: number
  ): Promise<ServiceRequest[] | null> {
    try {
      const response = await serviceRequestService.getAvailableRequests(latitude, longitude);
      if (response.success) {
        setRequests(response.data.serviceRequests);
        return response.data.serviceRequests;
      }
      return null;
    } catch {
      return null;
    }
  }

  async function acceptRequest(id: number): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    try {
      const response = await serviceRequestService.acceptRequest(id);
      if (response.success) {
        await loadMechanicRequests(); // Cargar mis solicitudes asignadas
        setIsLoading(false);
        return true;
      } else {
        setError(response.error);
        setIsLoading(false);
        return false;
      }
    } catch {
      setError('Error al aceptar la solicitud');
      setIsLoading(false);
      return false;
    }
  }

  async function startRequest(id: number): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    try {
      const response = await serviceRequestService.startRequest(id);
      if (response.success) {
        await loadMechanicRequests();
        setIsLoading(false);
        return true;
      } else {
        setError(response.error);
        setIsLoading(false);
        return false;
      }
    } catch {
      setError('Error al iniciar la solicitud');
      setIsLoading(false);
      return false;
    }
  }

  async function completeRequest(id: number, finalCost: number): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    try {
      const response = await serviceRequestService.completeRequest(id, { final_cost: finalCost });
      if (response.success) {
        await loadMechanicRequests();
        setIsLoading(false);
        return true;
      } else {
        setError(response.error);
        setIsLoading(false);
        return false;
      }
    } catch {
      setError('Error al completar la solicitud');
      setIsLoading(false);
      return false;
    }
  }

  async function loadMySurveys() {
    try {
      const response = await surveyService.listMine();
      if (response.success) {
        setSurveyedRequestIds(new Set(response.data.surveys.map((s) => s.serviceRequestId)));
      }
    } catch {
      // Silencioso: si falla, simplemente se seguirá ofreciendo la encuesta (no bloquea el flujo)
    }
  }

  async function submitSurvey(
    serviceRequestId: number,
    overallSatisfaction: number,
    wouldRecommend: boolean,
    comments?: string
  ): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    setFieldErrors(null);
    try {
      const response = await surveyService.create({
        service_request_id: serviceRequestId,
        overall_satisfaction: overallSatisfaction,
        would_recommend: wouldRecommend,
        comments,
      });
      if (response.success) {
        setSurveyedRequestIds((prev) => new Set(prev).add(serviceRequestId));
        setIsLoading(false);
        return true;
      } else {
        setError(response.error);
        setFieldErrors(response.fields ?? null);
        setIsLoading(false);
        return false;
      }
    } catch {
      setError('Error al enviar la encuesta');
      setIsLoading(false);
      return false;
    }
  }

  function selectRequest(request: ServiceRequest | null) {
    setCurrentRequest(request);
  }

  function clearError() {
    setError(null);
    setFieldErrors(null);
  }

  const value: RequestContextType = {
    requests,
    currentRequest,
    isLoading,
    error,
    fieldErrors,
    loadRequests,
    refreshRequestsSilently,
    loadMechanicRequests,
    loadMechanicRequestDetails,
    createRequest,
    cancelRequest,
    rateRequest,
    loadAvailableRequests,
    refreshAvailableRequestsSilently,
    acceptRequest,
    startRequest,
    completeRequest,
    selectRequest,
    clearError,
    surveyedRequestIds,
    loadMySurveys,
    submitSurvey,
  };

  return <RequestContext.Provider value={value}>{children}</RequestContext.Provider>;
}
