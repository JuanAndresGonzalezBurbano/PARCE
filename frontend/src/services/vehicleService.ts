import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@/config/api';
import type { ApiResponse } from '@/types/auth';
import type {
  CreateVehicleRequest,
  UpdateVehicleRequest,
  VehicleListResponse,
  VehicleResponse,
} from '@/types/vehicle';

export const vehicleService = {
  async getVehicles(): Promise<ApiResponse<VehicleListResponse>> {
    return apiClient.get<VehicleListResponse>(API_ENDPOINTS.VEHICLES.LIST);
  },

  async getVehicle(id: number): Promise<ApiResponse<VehicleResponse>> {
    return apiClient.get<VehicleResponse>(API_ENDPOINTS.VEHICLES.GET(id));
  },

  async createVehicle(data: CreateVehicleRequest): Promise<ApiResponse<VehicleResponse>> {
    return apiClient.post<VehicleResponse>(API_ENDPOINTS.VEHICLES.CREATE, data);
  },

  async updateVehicle(id: number, data: UpdateVehicleRequest): Promise<ApiResponse<VehicleResponse>> {
    return apiClient.put<VehicleResponse>(API_ENDPOINTS.VEHICLES.UPDATE(id), data);
  },

  async deleteVehicle(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(API_ENDPOINTS.VEHICLES.DELETE(id));
  },

  async setPrimaryVehicle(id: number): Promise<ApiResponse<VehicleResponse>> {
    return apiClient.put<VehicleResponse>(API_ENDPOINTS.VEHICLES.SET_PRIMARY(id));
  },
};
