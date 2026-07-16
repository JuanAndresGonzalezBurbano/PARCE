// Estado de la licencia de conducción (calculado por el backend)
export type LicenseStatus = 'not_set' | 'valid' | 'expiring_soon' | 'expired';

// Licencia de conducción del usuario
export interface DriverLicense {
  number: string | null;
  expirationDate: string | null;   // YYYY-MM-DD
  documentUrl: string | null;
  status: LicenseStatus;
  uploadedAt: string | null;       // ISO 8601
}

// Usuario autenticado
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  accountStatus: 'active' | 'suspended' | 'deleted';
  createdAt: string | null;        // ISO 8601
  lastLoginAt: string | null;      // ISO 8601
  roles: string[];
  driverLicense?: DriverLicense;
}

// Petición de actualización de perfil (campos planos que acepta el backend)
export interface UpdateProfileRequest {
  driver_license_number?: string;
  driver_license_expiration_date?: string;   // YYYY-MM-DD
  driver_license_document_url?: string;
}

// Petición de cambio de contraseña
export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

// Credenciales de inicio de sesión
export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

// Datos de registro
export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

// Auth response from backend
export interface AuthResponse {
  user: User;
  session: {
    id: string;
    expiresAt: number;
  };
}

// API Success Response
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

// API Error Response
export interface ApiErrorResponse {
  success: false;
  error: string;
  fields?: Record<string, string>;
}

// API Response union type
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
