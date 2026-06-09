import { createContext, useState, ReactNode } from 'react';
import { serviceRequestService } from '@/services/serviceRequestService';
import type {
  ServiceRequest,
  CreateServiceRequestRequest,
} from '@/types/serviceRequest';

interface RequestContextType {
  requests: ServiceRequest[];
  currentRequest: ServiceRequest | null;
  isLoading: boolean;
  error: string | null;
  loadRequests: (status?: string) => Promise<void>;
  createRequest: (data: CreateServiceRequestRequest) => Promise<boolean>;
  cancelRequest: (id: number, reason: string) => Promise<boolean>;
  rateRequest: (id: number, rating: number, feedback?: string) => Promise<boolean>;
  loadAvailableRequests: (latitude: number, longitude: number) => Promise<void>;
  acceptRequest: (id: number) => Promise<boolean>;
  startRequest: (id: number) => Promise<boolean>;
  completeRequest: (id: number, finalCost: number) => Promise<boolean>;
  selectRequest: (request: ServiceRequest | null) => void;
  clearError: () => void;
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

  async function loadRequests(status?: string) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await serviceRequestService.getMyRequests(status);

      if (response.success) {
        setRequests(response.data.service_requests);
      } else {
        setError(response.error);
      }
    } catch {
      setError('Failed to load requests');
    } finally {
      setIsLoading(false);
    }
  }

  async function createRequest(data: CreateServiceRequestRequest): Promise<boolean> {
    setIsLoading(true);
    setError(null);

    try {
      const response = await serviceRequestService.createRequest(data);

      if (response.success) {
        await loadRequests(); // Refresh list
        setIsLoading(false);
        return true;
      } else {
        setError(response.error);
        setIsLoading(false);
        return false;
      }
    } catch {
      setError('Failed to create request');
      setIsLoading(false);
      return false;
    }
  }

  async function cancelRequest(id: number, reason: string): Promise<boolean> {
    setIsLoading(true);
    setError(null);

    try {
      const response = await serviceRequestService.cancelRequest(id, { cancellation_reason: reason });

      if (response.success) {
        await loadRequests(); // Refresh list
        setIsLoading(false);
        return true;
      } else {
        setError(response.error);
        setIsLoading(false);
        return false;
      }
    } catch {
      setError('Failed to cancel request');
      setIsLoading(false);
      return false;
    }
  }

  async function rateRequest(id: number, rating: number, feedback?: string): Promise<boolean> {
    setIsLoading(true);
    setError(null);

    try {
      const response = await serviceRequestService.rateRequest(id, {
        customer_rating: rating,
        customer_feedback: feedback,
      });

      if (response.success) {
        await loadRequests(); // Refresh list
        setIsLoading(false);
        return true;
      } else {
        setError(response.error);
        setIsLoading(false);
        return false;
      }
    } catch {
      setError('Failed to rate request');
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
        setRequests(response.data.service_requests);
      } else {
        setError(response.error);
      }
    } catch {
      setError('Failed to load available requests');
    } finally {
      setIsLoading(false);
    }
  }

  async function acceptRequest(id: number): Promise<boolean> {
    setIsLoading(true);
    setError(null);

    try {
      const response = await serviceRequestService.acceptRequest(id);

      if (response.success) {
        await loadAvailableRequests(40.7128, -74.0060); // Refresh with default location
        setIsLoading(false);
        return true;
      } else {
        setError(response.error);
        setIsLoading(false);
        return false;
      }
    } catch {
      setError('Failed to accept request');
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
        await loadRequests(); // Refresh list
        setIsLoading(false);
        return true;
      } else {
        setError(response.error);
        setIsLoading(false);
        return false;
      }
    } catch {
      setError('Failed to start request');
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
        await loadRequests(); // Refresh list
        setIsLoading(false);
        return true;
      } else {
        setError(response.error);
        setIsLoading(false);
        return false;
      }
    } catch {
      setError('Failed to complete request');
      setIsLoading(false);
      return false;
    }
  }

  function selectRequest(request: ServiceRequest | null) {
    setCurrentRequest(request);
  }

  function clearError() {
    setError(null);
  }

  const value: RequestContextType = {
    requests,
    currentRequest,
    isLoading,
    error,
    loadRequests,
    createRequest,
    cancelRequest,
    rateRequest,
    loadAvailableRequests,
    acceptRequest,
    startRequest,
    completeRequest,
    selectRequest,
    clearError,
  };

  return <RequestContext.Provider value={value}>{children}</RequestContext.Provider>;
}
