// User type from backend
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  accountStatus: 'active' | 'suspended' | 'deleted';
  lastLoginAt: string | null;
  roles: string[];
}

// Login request
export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

// Register request
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
