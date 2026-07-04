// Tipos para el módulo de gestión de usuarios

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  role: 'user' | 'mechanic' | 'admin';
  createdAt?: string;
  updatedAt?: string;
}

export interface UserFormData {
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  role: 'user' | 'mechanic' | 'admin';
}

export interface UserFilters {
  search: string;
  status?: 'active' | 'inactive';
  role?: 'user' | 'mechanic' | 'admin';
}
