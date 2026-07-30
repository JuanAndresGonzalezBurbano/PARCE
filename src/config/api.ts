// Configuración central del cliente API
// En desarrollo, Vite proxea /api → http://localhost:8000
// En producción, apunta a VITE_API_URL del .env

export const API_CONFIG = {
  // Las peticiones van a /api/... — Vite proxy las reenvía al PHP
  API_URL: import.meta.env.VITE_API_URL || '/api',
  TIMEOUT: 10000,
  WITH_CREDENTIALS: true,
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN:    '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT:   '/auth/logout',
    ME:       '/auth/me',
    HEALTH:   '/auth/health',
    PROFILE:  '/auth/profile',
    PASSWORD: '/auth/password',
  },
  VEHICLES: {
    LIST:        '/vehicles',
    CREATE:      '/vehicles',
    GET:         (id: number) => `/vehicles/${id}`,
    UPDATE:      (id: number) => `/vehicles/${id}`,
    DELETE:      (id: number) => `/vehicles/${id}`,
    SET_PRIMARY: (id: number) => `/vehicles/${id}/primary`,
  },
  REQUESTS: {
    LIST:      '/service-requests',
    CREATE:    '/service-requests',
    GET:       (id: number) => `/service-requests/${id}`,
    UPDATE:    (id: number) => `/service-requests/${id}`,
    CANCEL:    (id: number) => `/service-requests/${id}/cancel`,
    RATE:      (id: number) => `/service-requests/${id}/rate`,
    EVIDENCES: (id: number) => `/service-requests/${id}/evidences`,
  },
  MECHANIC: {
    REQUESTS:     '/mechanic/requests',
    AVAILABLE:    '/mechanic/requests/available',
    DETAILS:      (id: number) => `/mechanic/requests/${id}`,
    ACCEPT:       (id: number) => `/mechanic/requests/${id}/accept`,
    START:        (id: number) => `/mechanic/requests/${id}/start`,
    COMPLETE:     (id: number) => `/mechanic/requests/${id}/complete`,
    ADD_EVIDENCE: (id: number) => `/mechanic/requests/${id}/evidence`,
    GET_EVIDENCES:(id: number) => `/mechanic/requests/${id}/evidences`,
    STATS:        '/mechanic/stats',
  },
  ADMIN: {
    DASHBOARD:        '/admin/dashboard',
    RATINGS:          '/admin/ratings',
    PQR_LIST:         '/admin/pqr',
    PQR_UPDATE_STATUS:(id: number) => `/admin/pqr/${id}/status`,
    PQR_RESPOND:      (id: number) => `/admin/pqr/${id}/respond`,
    SURVEYS:          '/admin/surveys',
  },
} as const;
