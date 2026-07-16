// Resumen del dashboard de administración
export interface DashboardStats {
  totalUsers: number;
  totalPqr: number;
  pendingPqr: number;
  totalSurveys: number;
  averageRating: number | null;
  requestsByStatus: { status: string; total: number }[];
}

export interface DashboardResponse {
  summary: DashboardStats;
}

// Calificación de una solicitud de servicio (vista administrador)
export interface AdminRating {
  id: number;
  serviceCode: string;
  emergencyType: string;
  status: string;
  customerRating: number;
  punctualityRating: number | null;
  serviceQualityRating: number | null;
  customerFeedback: string | null;
  completedAt: string | null;
  customerId: number;
  mechanicId: number | null;
  customerFirstName: string;
  customerLastName: string;
  mechanicFirstName: string | null;
  mechanicLastName: string | null;
}

export interface AdminRatingListResponse {
  ratings: AdminRating[];
  count: number;
}

export interface RatingFilters {
  mechanicId?: number;
  customerId?: number;
  minRating?: number;
  dateFrom?: string;
  dateTo?: string;
}
