import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@/config/api';
import type { ApiResponse } from '@/types/auth';
import type { Survey, SurveyListResponse } from '@/types/survey';

export interface CreateSurveyRequest {
  service_request_id: number;
  overall_satisfaction: number;
  would_recommend: boolean;
  comments?: string;
}

export const surveyService = {
  async create(data: CreateSurveyRequest): Promise<ApiResponse<null>> {
    return apiClient.post<null>(API_ENDPOINTS.SURVEYS.CREATE, data);
  },

  async listMine(): Promise<ApiResponse<SurveyListResponse>> {
    return apiClient.get<SurveyListResponse>(API_ENDPOINTS.SURVEYS.LIST);
  },
};

export type { Survey };
