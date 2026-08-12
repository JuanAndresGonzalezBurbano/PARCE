import { apiClient, ApiResponse } from './apiClient';
import { API_ENDPOINTS } from '@/config/api';

// ── Tipos que devuelve la API PHP ─────────────────────────────────────────────

export interface ApiUser {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  firstName?: string;  // Soporte para camelCase
  lastName?: string;   // Soporte para camelCase
  phone?: string;
  id_number?: string;
  profile_picture_url?: string;
  account_status?: string;
  accountStatus?: string;  // Soporte para camelCase
  createdAt?: string;
  lastLoginAt?: string;
  roles: (string | { id: number; name: string; slug: string })[]; // Acepta array de strings o de objetos
  driver_license?: {
    number?: string;
    expiration_date?: string;
    document_url?: string;
    status?: string;
    uploaded_at?: string;
  };
  vehicle?: {
    id: number;
    make: string;
    model: string;
    licensePlate: string;
    year: number;
    color: string;
    vehicleType?: string;
    soatNumber?: string;
    soatUploadedAt?: string;
    tecnomecanicaNumber?: string;
    tecnomecanicaUploadedAt?: string;
    isPrimary: boolean;
    status: string;
    createdAt: string;
  };
}

export interface AuthResponse {
  user: ApiUser;
  session_id?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  password_confirmation: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role?: string; // 'customer' | 'mechanic'
  // Datos adicionales opcionales
  id_number?: string;
  driver_license_number?: string;
  vehicle_brand?: string;
  vehicle_model?: string;
  vehicle_plate?: string;
  vehicle_year?: string;
  vehicle_color?: string;
  soat_number?: string;
  tecnomecanica_number?: string;
  mechanic_cert_title?: string;
  mechanic_cert_document_url?: string;
}

// ── Servicio ──────────────────────────────────────────────────────────────────

export const authService = {
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
  },

  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, data);
  },

  async logout(): Promise<ApiResponse<null>> {
    return apiClient.post<null>(API_ENDPOINTS.AUTH.LOGOUT);
  },

  async forgotPassword(email: string): Promise<ApiResponse<{ token: string }>> {
    return apiClient.post<{ token: string }>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD || '/api/auth/forgot-password', { email });
  },

  async resetPassword(token: string, password: string, passwordConfirmation: string): Promise<ApiResponse<null>> {
    return apiClient.post<null>(API_ENDPOINTS.AUTH.RESET_PASSWORD || '/api/auth/reset-password', {
      token,
      password,
      password_confirmation: passwordConfirmation
    });
  },

  async me(): Promise<ApiResponse<ApiUser>> {
    return apiClient.get<ApiUser>(API_ENDPOINTS.AUTH.ME);
  },

  async health(): Promise<ApiResponse<{ status: string; version: string }>> {
    return apiClient.get(API_ENDPOINTS.AUTH.HEALTH);
  },
};

// ── Helper: convierte el rol del API (slug) al rol interno del frontend ───────
export function mapApiRoleToAppRole(roles: ApiUser['roles']): 'admin' | 'mechanic' | 'user' {
  if (!roles || roles.length === 0) return 'user';
  
  // Manejar tanto array de strings como array de objetos
  const slugs: string[] = [];
  
  for (const role of roles) {
    if (typeof role === 'string') {
      // Si es un string directo (e.g., "administrator")
      slugs.push(role.toLowerCase());
    } else if (role && typeof role === 'object' && role.slug) {
      // Si es un objeto con propiedad slug
      slugs.push(role.slug.toLowerCase());
    }
  }
  
  if (slugs.length === 0) return 'user';
  if (slugs.some(s => s.includes('admin') || s.includes('super'))) return 'admin';
  if (slugs.some(s => s.includes('mechanic') || s.includes('mecanico'))) return 'mechanic';
  return 'user';
}

// ── Helper: nombre completo desde ApiUser ─────────────────────────────────────
export function getFullName(u: ApiUser): string {
  const firstName = u.first_name || u.firstName || '';
  const lastName = u.last_name || u.lastName || '';
  return `${firstName} ${lastName}`.trim() || 'Usuario';
}
