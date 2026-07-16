export type PQRType = 'peticion' | 'queja' | 'reclamo' | 'sugerencia';
export type PQRStatus = 'pending' | 'in_review' | 'resolved' | 'rejected';

export interface PQRTicket {
  id: number;
  ticketCode: string;
  userId: number;
  type: PQRType;
  subject: string;
  description: string;
  status: PQRStatus;
  adminResponse: string | null;
  respondedBy: number | null;
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string;
  // Presentes solo en las respuestas de administrador (join con users)
  reporterFirstName?: string;
  reporterLastName?: string;
  reporterEmail?: string;
}

export interface PQRListResponse {
  pqr: PQRTicket[];
  count: number;
}

export interface PQRFilters {
  status?: PQRStatus;
  type?: PQRType;
  q?: string;
}
