// ============================================================
// Auth Types — PARCE
// Incluye el bloque de licencia de conducción para mecánicos.
// ============================================================

/** Estado calculado de la licencia de conducción */
export type LicenseStatus = 'not_set' | 'valid' | 'expiring_soon' | 'expired';

/** Bloque de licencia de conducción en el perfil */
export interface DriverLicense {
  number: string | null;
  expirationDate: string | null;  // YYYY-MM-DD
  documentUrl: string | null;
  uploadedAt: string | null;
  /** Calculado por el backend: not_set | valid | expiring_soon | expired */
  status: LicenseStatus;
}

/** Usuario autenticado */
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  accountStatus: 'active' | 'suspended' | 'deleted';
  lastLoginAt: string | null;
  roles: string[];
  /** Siempre presente; campos null si el usuario no ha cargado licencia */
  driverLicense?: DriverLicense;
}

// ---- Payloads de request (snake_case — van directo a la API) ----

export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

/** Campos actualizables en PUT /api/auth/profile */
export interface UpdateProfileRequest {
  phone?: string;
  driver_license_number?: string;
  driver_license_expiration_date?: string;  // YYYY-MM-DD
  driver_license_document_url?: string;
}

// ---- Respuestas de la API ----

export interface AuthResponse {
  user: User;
  session: {
    expiresAt: number;
  };
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  fields?: Record<string, string>;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
