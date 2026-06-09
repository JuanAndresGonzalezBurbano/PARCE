import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@/config/api';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  ApiResponse,
} from '@/types/auth';

export const authService = {
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
  },

  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );
  },

  async logout(): Promise<ApiResponse<null>> {
    return apiClient.post<null>(API_ENDPOINTS.AUTH.LOGOUT);
  },

  async me(): Promise<ApiResponse<User>> {
    return apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
  },

  async health(): Promise<ApiResponse<{ status: string; version: string }>> {
    return apiClient.get(API_ENDPOINTS.AUTH.HEALTH);
  },
};
