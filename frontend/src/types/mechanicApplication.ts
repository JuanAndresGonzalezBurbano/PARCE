import type { PaginationMeta } from './pagination';

export type MechanicApplicationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface MechanicApplication {
  id: number;
  userId: number;
  requestedRoleId: number;
  justification: string;
  status: MechanicApplicationStatus;
  reviewedBy: number | null;
  approvedBy: number | null;
  reviewNotes: string | null;
  rejectionReason: string | null;
  reviewedAt: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  // Presentes solo en el listado de administrador (join con users en el backend)
  applicantFirstName?: string;
  applicantLastName?: string;
  applicantEmail?: string;
  driverLicenseNumber?: string | null;
  driverLicenseExpirationDate?: string | null;
  driverLicenseDocumentUrl?: string | null;
  reviewerFirstName?: string;
  reviewerLastName?: string;
}

export interface CreateMechanicApplicationRequest {
  justification: string;
}

export interface RejectMechanicApplicationRequest {
  rejection_reason: string;
}

export interface MechanicApplicationListResponse {
  applications: MechanicApplication[];
  count: number;
}

export interface AdminMechanicApplicationListResponse extends PaginationMeta {
  applications: MechanicApplication[];
  count: number;
}

export interface MechanicApplicationFilters {
  status?: MechanicApplicationStatus;
}
