import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@/config/api';
import type { ApiResponse } from '@/types/auth';
import type {
  CreateServiceRequestRequest,
  UpdateServiceRequestRequest,
  CancelServiceRequestRequest,
  RateServiceRequestRequest,
  CompleteServiceRequestRequest,
  ServiceRequestListResponse,
  ServiceRequestResponse,
} from '@/types/serviceRequest';

export const serviceRequestService = {
  // Customer endpoints
  async getMyRequests(status?: string): Promise<ApiResponse<ServiceRequestListResponse>> {
    const endpoint = status 
      ? `${API_ENDPOINTS.REQUESTS.LIST}?status=${status}`
      : API_ENDPOINTS.REQUESTS.LIST;
    return apiClient.get<ServiceRequestListResponse>(endpoint);
  },

  async getRequest(id: number): Promise<ApiResponse<ServiceRequestResponse>> {
    return apiClient.get<ServiceRequestResponse>(API_ENDPOINTS.REQUESTS.GET(id));
  },

  async createRequest(data: CreateServiceRequestRequest): Promise<ApiResponse<ServiceRequestResponse>> {
    return apiClient.post<ServiceRequestResponse>(API_ENDPOINTS.REQUESTS.CREATE, data);
  },

  async updateRequest(id: number, data: UpdateServiceRequestRequest): Promise<ApiResponse<ServiceRequestResponse>> {
    return apiClient.put<ServiceRequestResponse>(API_ENDPOINTS.REQUESTS.UPDATE(id), data);
  },

  async cancelRequest(id: number, data: CancelServiceRequestRequest): Promise<ApiResponse<ServiceRequestResponse>> {
    return apiClient.post<ServiceRequestResponse>(API_ENDPOINTS.REQUESTS.CANCEL(id), data);
  },

  async rateRequest(id: number, data: RateServiceRequestRequest): Promise<ApiResponse<ServiceRequestResponse>> {
    return apiClient.post<ServiceRequestResponse>(API_ENDPOINTS.REQUESTS.RATE(id), data);
  },

  // Mechanic endpoints
  async getMechanicRequests(status?: string): Promise<ApiResponse<ServiceRequestListResponse>> {
    const endpoint = status
      ? `${API_ENDPOINTS.MECHANIC.REQUESTS}?status=${status}`
      : API_ENDPOINTS.MECHANIC.REQUESTS;
    return apiClient.get<ServiceRequestListResponse>(endpoint);
  },

  async getAvailableRequests(latitude: number, longitude: number, radius?: number): Promise<ApiResponse<ServiceRequestListResponse>> {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
    });
    if (radius) {
      params.append('radius', radius.toString());
    }
    return apiClient.get<ServiceRequestListResponse>(`${API_ENDPOINTS.MECHANIC.AVAILABLE}?${params}`);
  },

  async acceptRequest(id: number): Promise<ApiResponse<ServiceRequestResponse>> {
    return apiClient.post<ServiceRequestResponse>(API_ENDPOINTS.MECHANIC.ACCEPT(id));
  },

  async startRequest(id: number): Promise<ApiResponse<ServiceRequestResponse>> {
    return apiClient.put<ServiceRequestResponse>(API_ENDPOINTS.MECHANIC.START(id));
  },

  async completeRequest(id: number, data: CompleteServiceRequestRequest): Promise<ApiResponse<ServiceRequestResponse>> {
    return apiClient.put<ServiceRequestResponse>(API_ENDPOINTS.MECHANIC.COMPLETE(id), data);
  },
};
