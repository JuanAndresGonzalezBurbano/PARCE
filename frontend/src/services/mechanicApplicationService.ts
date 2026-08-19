import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@/config/api';
import type { ApiResponse } from '@/types/auth';
import type {
  MechanicApplication,
  MechanicApplicationListResponse,
  AdminMechanicApplicationListResponse,
  MechanicApplicationFilters,
  CreateMechanicApplicationRequest,
} from '@/types/mechanicApplication';

function buildQuery(params: Record<string, string | number | undefined>): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') qs.append(key, String(value));
  }
  const str = qs.toString();
  return str ? `?${str}` : '';
}

export const mechanicApplicationService = {
  // Usuario: solo envía `justification` — el user_id sale de la sesión en el
  // backend, nunca del body (ver AuthMiddleware/MechanicApplicationController).
  async create(data: CreateMechanicApplicationRequest): Promise<ApiResponse<{ application: MechanicApplication }>> {
    return apiClient.post<{ application: MechanicApplication }>(API_ENDPOINTS.MECHANIC_APPLICATIONS.CREATE, data);
  },

  async myApplications(): Promise<ApiResponse<MechanicApplicationListResponse>> {
    return apiClient.get<MechanicApplicationListResponse>(API_ENDPOINTS.MECHANIC_APPLICATIONS.ME);
  },

  async cancel(id: number): Promise<ApiResponse<{ application: MechanicApplication }>> {
    return apiClient.post<{ application: MechanicApplication }>(API_ENDPOINTS.MECHANIC_APPLICATIONS.CANCEL(id));
  },

  // Administrador
  async adminList(
    filters: MechanicApplicationFilters = {},
    page?: number,
    perPage?: number
  ): Promise<ApiResponse<AdminMechanicApplicationListResponse>> {
    const qs = buildQuery({ status: filters.status, page, per_page: perPage });
    return apiClient.get<AdminMechanicApplicationListResponse>(API_ENDPOINTS.ADMIN.MECHANIC_APPLICATIONS_LIST + qs);
  },

  // Sin body — el rol que se concede lo determina el backend internamente,
  // nunca esta petición (ver MechanicApplicationService::approve()).
  async approve(id: number): Promise<ApiResponse<{ application: MechanicApplication }>> {
    return apiClient.post<{ application: MechanicApplication }>(API_ENDPOINTS.ADMIN.MECHANIC_APPLICATIONS_APPROVE(id));
  },

  async reject(id: number, rejectionReason: string): Promise<ApiResponse<{ application: MechanicApplication }>> {
    return apiClient.post<{ application: MechanicApplication }>(API_ENDPOINTS.ADMIN.MECHANIC_APPLICATIONS_REJECT(id), {
      rejection_reason: rejectionReason,
    });
  },
};
