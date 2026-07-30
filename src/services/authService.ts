import { apiClient, ApiResponse } from './apiClient';
import { API_ENDPOINTS } from '@/config/api';

// ── Tipos que devuelve la API PHP ─────────────────────────────────────────────

export interface ApiUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  id_number?: string;
  profile_picture_url?: string;
  account_status: string;
  roles: { id: number; name: string; slug: string }[];
  driver_license?: {
    number?: string;
    expiration_date?: string;
    document_url?: string;
    status?: string;
    uploaded_at?: string;
  };
  vehicle?: {
    id: number;
    license_plate: string;
    make: string;
    model: string;
    year: number;
    color: string;
    soat_number?: string;
    soat_uploaded_at?: string;
    tecnomecanica_number?: string;
    tecnomecanica_uploaded_at?: string;
    is_primary: boolean;
    status: string;
    created_at: string;
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
  const slugs = roles.map(r => r.slug.toLowerCase());
  if (slugs.some(s => s.includes('admin') || s.includes('super'))) return 'admin';
  if (slugs.some(s => s.includes('mechanic'))) return 'mechanic';
  return 'user';
}

// ── Helper: nombre completo desde ApiUser ─────────────────────────────────────
export function getFullName(u: ApiUser): string {
  return `${u.first_name} ${u.last_name}`.trim();
}
