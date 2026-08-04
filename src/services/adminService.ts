import { apiClient, ApiResponse } from './apiClient';

// ── Tipos para la API de administración ──────────────────────────────────────

export interface AdminUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  idNumber: string;
  accountStatus: 'active' | 'suspended' | 'deactivated';
  roles: string[];
  createdAt: string;
  lastLoginAt?: string;
  driverLicense?: string;
  mechanicCertification?: string;
}

export interface AdminUserDetail extends AdminUser {
  profilePictureUrl?: string;
  emailVerificationStatus: string;
  phoneVerificationStatus: string;
  emailVerifiedAt?: string;
  phoneVerifiedAt?: string;
  lastLoginIp?: string;
  updatedAt: string;
  driverLicense: {
    number?: string;
    expirationDate?: string;
    documentUrl?: string;
    status?: string;
    uploadedAt?: string;
  };
  mechanicCertification: {
    title?: string;
    documentUrl?: string;
    uploadedAt?: string;
  };
  vehicles: Array<{
    id: number;
    licensePlate: string;
    make: string;
    model: string;
    year: number;
    color: string;
    soat: {
      number?: string;
      expirationDate?: string;
      uploadedAt?: string;
    };
    tecnomecanica: {
      number?: string;
      expirationDate?: string;
      uploadedAt?: string;
    };
    isPrimary: boolean;
    status: string;
    createdAt: string;
  }>;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    search: string;
    role: string;
    status: string;
  };
}

export interface AdminUsersFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}

// ── Servicio de administración ───────────────────────────────────────────────

export const adminService = {
  /**
   * Obtener lista paginada de usuarios con filtros
   */
  async getUsers(filters: AdminUsersFilters = {}): Promise<ApiResponse<AdminUsersResponse>> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.role) params.append('role', filters.role);
    if (filters.status) params.append('status', filters.status);

    const queryString = params.toString();
    const url = queryString ? `/api/admin/users?${queryString}` : '/api/admin/users';

    return apiClient.get<AdminUsersResponse>(url);
  },

  /**
   * Obtener detalles completos de un usuario específico
   */
  async getUser(id: number): Promise<ApiResponse<AdminUserDetail>> {
    return apiClient.get<AdminUserDetail>(`/api/admin/users/${id}`);
  },

  /**
   * Actualizar el estado de un usuario (activar/desactivar)
   */
  async updateUserStatus(
    id: number, 
    status: 'active' | 'suspended' | 'deactivated'
  ): Promise<ApiResponse<{ status: string }>> {
    return apiClient.patch(`/api/admin/users/${id}/status`, { status });
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
    case 'deactivated':
      return 'disabled';
    default:
      return 'inactive';
  }
}

/**
 * Mapea el estado del frontend de vuelta al backend
 */
export function mapStatusToBackend(status: 'active' | 'inactive' | 'disabled'): 'active' | 'suspended' | 'deactivated' {
  switch (status) {
    case 'active':
      return 'active';
    case 'disabled':
      return 'deactivated';
    case 'inactive':
    default:
      return 'suspended';
  }
}

/**
 * Formatea el nombre completo de un usuario
 */
export function formatUserName(user: AdminUser | AdminUserDetail): string {
  return `${user.firstName} ${user.lastName}`.trim();
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
    case 'deactivated':
      return 'Desactivado';
    default:
      return 'Inactivo';
  }
}