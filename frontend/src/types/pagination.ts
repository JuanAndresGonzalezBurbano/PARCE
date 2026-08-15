// Metadatos de paginación devueltos por los listados admin-wide paginados
// (GET /api/admin/ratings, /api/admin/pqr, /api/admin/surveys).
export interface PaginationMeta {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
