import { API_CONFIG } from '@/config/api';
import type { ApiResponse } from '@/types/auth';

// Evento global disparado cuando una petición autenticada recibe 401 fuera de
// los endpoints públicos de abajo — señal de que la sesión expiró/es
// inválida en medio del uso de la app. AuthContext lo escucha para limpiar
// el usuario; ProtectedRoute ya redirige a /login declarativamente cuando
// isAuthenticated pasa a false, así que no hace falta navegar desde aquí.
export const SESSION_EXPIRED_EVENT = 'parce:session-expired';

// Endpoints donde un 401 es un resultado normal/esperado, no una sesión que
// expiró en medio del uso: credenciales inválidas en login, el probe de
// checkAuth() (se llama sin sesión en cada carga de la app), y los flujos de
// recuperación de contraseña, que ni siquiera requieren sesión.
const PUBLIC_AUTH_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/auth/me',
  '/auth/forgot-password',
  '/auth/reset-password',
];

function isPublicAuthEndpoint(endpoint: string): boolean {
  return PUBLIC_AUTH_ENDPOINTS.some((path) => endpoint.startsWith(path));
}

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.API_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      ...options,
      credentials: 'include', // CRITICAL: Include session cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (response.status === 401 && !isPublicAuthEndpoint(endpoint)) {
        window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
      }

      return data as ApiResponse<T>;
    } catch (error) {
      // Network error
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
    });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
