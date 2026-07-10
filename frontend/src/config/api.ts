export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  TIMEOUT: 10000,
  WITH_CREDENTIALS: true, // Necesario para enviar/recibir la cookie de sesión
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    HEALTH: '/auth/health',
    // Actualización de perfil (teléfono + licencia de conducción)
    PROFILE: '/auth/profile',
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
    // Evidencias fotográficas (solo lectura para el cliente propietario)
    EVIDENCES: (id: number) => `/service-requests/${id}/evidences`,
  },
  MECHANIC: {
    REQUESTS: '/mechanic/requests',
    AVAILABLE: '/mechanic/requests/available',
    DETAILS: (id: number) => `/mechanic/requests/${id}`,
    ACCEPT: (id: number) => `/mechanic/requests/${id}/accept`,
    START: (id: number) => `/mechanic/requests/${id}/start`,
    COMPLETE: (id: number) => `/mechanic/requests/${id}/complete`,
    // Evidencias fotográficas (antes/durante/después)
    ADD_EVIDENCE: (id: number) => `/mechanic/requests/${id}/evidence`,
    GET_EVIDENCES: (id: number) => `/mechanic/requests/${id}/evidences`,
  },
} as const;
