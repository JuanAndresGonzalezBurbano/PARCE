import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@/config/api';
import type { ApiResponse } from '@/types/auth';
import type { PQRTicket, PQRListResponse, PQRFilters, PQRType } from '@/types/pqr';

function buildQuery(params: Record<string, string | number | undefined>): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') qs.append(key, String(value));
  }
  const str = qs.toString();
  return str ? `?${str}` : '';
}

export interface CreatePQRRequest {
  type: PQRType;
  subject: string;
  description: string;
}

export const pqrService = {
  async list(filters: PQRFilters = {}): Promise<ApiResponse<PQRListResponse>> {
    const qs = buildQuery({ status: filters.status, type: filters.type });
    return apiClient.get<PQRListResponse>(API_ENDPOINTS.PQR.LIST + qs);
  },

  async create(data: CreatePQRRequest): Promise<ApiResponse<{ pqr: PQRTicket }>> {
    return apiClient.post<{ pqr: PQRTicket }>(API_ENDPOINTS.PQR.CREATE, data);
  },

  async getById(id: number): Promise<ApiResponse<{ pqr: PQRTicket }>> {
    return apiClient.get<{ pqr: PQRTicket }>(API_ENDPOINTS.PQR.GET(id));
  },
};
