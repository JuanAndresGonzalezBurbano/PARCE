import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@/config/api';
import type { ApiResponse } from '@/types/auth';
import type { DashboardResponse, AdminRatingListResponse, RatingFilters } from '@/types/admin';
import type { PQRTicket, PQRListResponse, PQRFilters } from '@/types/pqr';
import type { SurveyListResponse } from '@/types/survey';

function buildQuery(params: Record<string, string | number | undefined>): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') qs.append(key, String(value));
  }
  const str = qs.toString();
  return str ? `?${str}` : '';
}

export const adminService = {
  async getDashboard(): Promise<ApiResponse<DashboardResponse>> {
    return apiClient.get<DashboardResponse>(API_ENDPOINTS.ADMIN.DASHBOARD);
  },

  async getRatings(filters: RatingFilters = {}): Promise<ApiResponse<AdminRatingListResponse>> {
    const qs = buildQuery({
      mechanic_id: filters.mechanicId,
      customer_id: filters.customerId,
      min_rating: filters.minRating,
      date_from: filters.dateFrom,
      date_to: filters.dateTo,
    });
    return apiClient.get<AdminRatingListResponse>(API_ENDPOINTS.ADMIN.RATINGS + qs);
  },

  async getPqrList(filters: PQRFilters = {}): Promise<ApiResponse<PQRListResponse>> {
    const qs = buildQuery({
      status: filters.status,
      type: filters.type,
      q: filters.q,
    });
    return apiClient.get<PQRListResponse>(API_ENDPOINTS.ADMIN.PQR_LIST + qs);
  },

  async updatePqrStatus(id: number, status: string): Promise<ApiResponse<{ pqr: PQRTicket }>> {
    return apiClient.put<{ pqr: PQRTicket }>(API_ENDPOINTS.ADMIN.PQR_UPDATE_STATUS(id), { status });
  },

  async respondPqr(id: number, adminResponse: string): Promise<ApiResponse<{ pqr: PQRTicket }>> {
    return apiClient.post<{ pqr: PQRTicket }>(API_ENDPOINTS.ADMIN.PQR_RESPOND(id), {
      admin_response: adminResponse,
    });
  },

  async getSurveys(): Promise<ApiResponse<SurveyListResponse>> {
    return apiClient.get<SurveyListResponse>(API_ENDPOINTS.ADMIN.SURVEYS);
  },
};
