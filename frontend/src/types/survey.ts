// Encuesta de satisfacción (vista administrador — solo lectura)
export interface Survey {
  id: number;
  serviceRequestId: number;
  customerId: number;
  overallSatisfaction: number;
  wouldRecommend: number; // 0 | 1 (tal como lo devuelve la BD, no un booleano real)
  comments: string | null;
  createdAt: string;
  updatedAt: string;
  serviceCode?: string;
  emergencyType?: string;
  mechanicId?: number | null;
  customerFirstName?: string;
  customerLastName?: string;
  mechanicFirstName?: string;
  mechanicLastName?: string;
}

export interface SurveyListResponse {
  surveys: Survey[];
  count: number;
}
