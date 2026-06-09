export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  TIMEOUT: 10000,
  WITH_CREDENTIALS: true,
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    HEALTH: '/auth/health',
  },
  VEHICLES: {
    LIST: '/vehicles',
    CREATE: '/vehicles',
    GET: (id: number) => `/vehicles/${id}`,
    UPDATE: (id: number) => `/vehicles/${id}`,
    DELETE: (id: number) => `/vehicles/${id}`,
    SET_PRIMARY: (id: number) => `/vehicles/${id}/primary`,
  },
  REQUESTS: {
    LIST: '/service-requests',
    CREATE: '/service-requests',
    GET: (id: number) => `/service-requests/${id}`,
    UPDATE: (id: number) => `/service-requests/${id}`,
    CANCEL: (id: number) => `/service-requests/${id}/cancel`,
    RATE: (id: number) => `/service-requests/${id}/rate`,
  },
  MECHANIC: {
    REQUESTS: '/mechanic/requests',
    AVAILABLE: '/mechanic/requests/available',
    ACCEPT: (id: number) => `/mechanic/requests/${id}/accept`,
    START: (id: number) => `/mechanic/requests/${id}/start`,
    COMPLETE: (id: number) => `/mechanic/requests/${id}/complete`,
  },
} as const;
