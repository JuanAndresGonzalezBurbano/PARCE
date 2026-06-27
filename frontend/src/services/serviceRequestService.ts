import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@/config/api';
import type { ApiResponse } from '@/types/auth';
import type {
  CreateServiceRequestRequest,
  UpdateServiceRequestRequest,
  CancelServiceRequestRequest,
  RateServiceRequestRequest,
  CompleteServiceRequestRequest,
  AddEvidenceRequest,
  ServiceRequestListResponse,
  ServiceRequestResponse,
  EvidenceListResponse,
  EvidenceResponse,
} from '@/types/serviceRequest';

export const serviceRequestService = {
  // ==========================================================================
  // Endpoints de clientes
  // ==========================================================================

  /** Lista las solicitudes propias del cliente. Filtra por status si se pasa. */
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

  /**
   * Califica una solicitud completada.
   * Acepta los 3 componentes: calificación general, puntualidad y calidad.
   */
  async rateRequest(id: number, data: RateServiceRequestRequest): Promise<ApiResponse<ServiceRequestResponse>> {
    return apiClient.post<ServiceRequestResponse>(API_ENDPOINTS.REQUESTS.RATE(id), data);
  },

  // ==========================================================================
  // Endpoints de mecánicos
  // ==========================================================================

  /** Lista las solicitudes asignadas al mecánico. Filtra por status si se pasa. */
  async getMechanicRequests(status?: string): Promise<ApiResponse<ServiceRequestListResponse>> {
    const endpoint = status
      ? `${API_ENDPOINTS.MECHANIC.REQUESTS}?status=${status}`
      : API_ENDPOINTS.MECHANIC.REQUESTS;
    return apiClient.get<ServiceRequestListResponse>(endpoint);
  },

  /** Solicitudes pendientes cercanas a las coordenadas del mecánico. */
  async getAvailableRequests(
    latitude: number,
    longitude: number,
    radius?: number
  ): Promise<ApiResponse<ServiceRequestListResponse>> {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
    });
    if (radius) {
      params.append('radius', radius.toString());
    }
    return apiClient.get<ServiceRequestListResponse>(
      `${API_ENDPOINTS.MECHANIC.AVAILABLE}?${params}`
    );
  },

  async acceptRequest(id: number): Promise<ApiResponse<ServiceRequestResponse>> {
    return apiClient.post<ServiceRequestResponse>(API_ENDPOINTS.MECHANIC.ACCEPT(id));
  },

  async startRequest(id: number): Promise<ApiResponse<ServiceRequestResponse>> {
    return apiClient.put<ServiceRequestResponse>(API_ENDPOINTS.MECHANIC.START(id));
  },

  async completeRequest(
    id: number,
    data: CompleteServiceRequestRequest
  ): Promise<ApiResponse<ServiceRequestResponse>> {
    return apiClient.put<ServiceRequestResponse>(API_ENDPOINTS.MECHANIC.COMPLETE(id), data);
  },

  /**
   * Agrega evidencia fotográfica a una solicitud.
   * Solo el mecánico asignado puede llamar este endpoint.
   * La URL de la imagen debe haber sido subida previamente a S3 u otro servicio.
   */
  async addEvidence(id: number, data: AddEvidenceRequest): Promise<ApiResponse<EvidenceResponse>> {
    return apiClient.post<EvidenceResponse>(API_ENDPOINTS.MECHANIC.ADD_EVIDENCE(id), data);
  },

  /** Lista todas las evidencias de una solicitud en orden cronológico. */
  async getEvidences(id: number): Promise<ApiResponse<EvidenceListResponse>> {
    return apiClient.get<EvidenceListResponse>(API_ENDPOINTS.MECHANIC.GET_EVIDENCES(id));
  },
};
