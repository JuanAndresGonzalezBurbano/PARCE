import { apiClient, ApiResponse } from './apiClient';

// ── Tipos para la API de administración ──────────────────────────────────────

export interface AdminUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  account_status: string;
  roles: string;  // roles concatenados como string
  role_slugs: string;  // slugs concatenados como string
  vehicle_count: number;
  created_at: string;
  last_login_at: string | null;
}

export interface AdminVehicle {
  id: number;
  make: string;
  model: string;
  license_plate: string;
  year: number;
  color: string;
  vehicle_type: string | null;
  soat_number: string | null;
  tecnomecanica_number: string | null;
  is_primary: boolean;
  status: string;
  created_at: string;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
}

export interface AdminUsersFilters {
  role?: string;
  status?: string;
  search?: string;
}

export interface AdminVehiclesFilters {
  search?: string;
}

// ── Servicio de administración ───────────────────────────────────────────────

export const adminService = {
  /**
   * Obtener lista de usuarios con filtros
   */
  async getUsers(filters: AdminUsersFilters = {}): Promise<ApiResponse<{ users: AdminUser[]; count: number }>> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.role) params.append('role', filters.role);
    if (filters.status) params.append('status', filters.status);

    const queryString = params.toString();
    const url = queryString ? `/admin/users?${queryString}` : '/admin/users';

    return apiClient.get<{ users: AdminUser[]; count: number }>(url);
  },

  /**
   * Obtener lista de vehículos con filtros
   */
  async getVehicles(filters: AdminVehiclesFilters = {}): Promise<ApiResponse<{ vehicles: AdminVehicle[]; count: number }>> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);

    const queryString = params.toString();
    const url = queryString ? `/admin/vehicles?${queryString}` : '/admin/vehicles';

    return apiClient.get<{ vehicles: AdminVehicle[]; count: number }>(url);
  },

  /**
   * Actualizar el estado de un usuario
   */
  async updateUserStatus(
    id: number, 
    status: 'active' | 'inactive' | 'suspended'
  ): Promise<ApiResponse<null>> {
    return apiClient.put(`/admin/users/${id}/status`, { status });
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Mapea el accountStatus del backend a los estados usados en el frontend
 */
export function mapAccountStatus(status: string): 'active' | 'inactive' | 'disabled' {
  switch (status) {
    case 'active':
      return 'active';
    case 'suspended':
      return 'inactive';
    case 'inactive':
    case 'deactivated':
      return 'disabled';
    default:
      return 'inactive';
  }
}

/**
 * Mapea el estado del frontend de vuelta al backend
 */
export function mapStatusToBackend(status: 'active' | 'inactive' | 'disabled'): 'active' | 'inactive' | 'suspended' {
  switch (status) {
    case 'active':
      return 'active';
    case 'disabled':
      return 'suspended';
    case 'inactive':
    default:
      return 'inactive';
  }
}

/**
 * Formatea el nombre completo de un usuario
 */
export function formatUserName(user: AdminUser): string {
  return `${user.first_name} ${user.last_name}`.trim();
}

/**
 * Obtiene el label para mostrar en badges de estado
 */
export function getStatusLabel(status: string): string {
  switch (status) {
    case 'active':
      return 'Activo';
    case 'suspended':
      return 'Suspendido';
    case 'inactive':
      return 'Inactivo';
    case 'deactivated':
      return 'Desactivado';
    default:
      return 'Desconocido';
  }
}