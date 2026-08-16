// Solicitud de servicio
export interface ServiceRequest {
  id: number;
  serviceCode: string;
  customerId: number;
  vehicleId: number;
  mechanicId: number | null;
  resolvedBy: number | null;
  emergencyType: 'tire' | 'battery' | 'fuel' | 'engine' | 'lockout' | 'tow' | 'other';
  description: string;
  priority: 'normal' | 'urgent' | 'critical';
  latitude: number;
  longitude: number;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'expired';
  requestedAt: string;
  assignedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancelledBy: number | null;
  cancellationReason: string | null;
  finalCost: number | null;
  customerRating: number | null;
  customerFeedback: string | null;
  punctualityRating: number | null;
  serviceQualityRating: number | null;
  createdAt: string;
  updatedAt: string;
  // Relaciones populadas
  vehicle?: {
    make: string;
    model: string;
    year: number;
    licensePlate: string;
  };
  customer?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  mechanic?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  // Campos planos devueltos por getById/getCustomerRequests/getMechanicRequests
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  vehicleLicensePlate?: string;
  customerFirstName?: string;
  customerLastName?: string;
  customerEmail?: string;
  customerPhone?: string;
  mechanicFirstName?: string;
  mechanicLastName?: string;
  mechanicPhone?: string;
  // Campos de ubicación aproximada (getNearbyPendingRequests, privacidad mientras pending)
  latitudeApproximate?: number;
  longitudeApproximate?: number;
  distanceKm?: number;
}

// Crear solicitud de servicio
export interface CreateServiceRequestRequest {
  vehicle_id: number;
  emergency_type: 'tire' | 'battery' | 'fuel' | 'engine' | 'lockout' | 'tow' | 'other';
  description: string;
  latitude: number;
  longitude: number;
  priority?: 'normal' | 'urgent' | 'critical';
}

// Actualizar solicitud de servicio
export interface UpdateServiceRequestRequest {
  description?: string;
  latitude?: number;
  longitude?: number;
  priority?: 'normal' | 'urgent' | 'critical';
}

// Cancelar solicitud de servicio
export interface CancelServiceRequestRequest {
  cancellation_reason: string;
}

// Calificar solicitud de servicio (3 ratings obligatorios)
export interface RateServiceRequestRequest {
  customer_rating: number;         // 1-5
  punctuality_rating: number;      // 1-5
  service_quality_rating: number;  // 1-5
  customer_feedback?: string;
}

// Completar solicitud (mecánico)
export interface CompleteServiceRequestRequest {
  final_cost: number;
}

// Respuesta lista de solicitudes
export interface ServiceRequestListResponse {
  serviceRequests: ServiceRequest[];
  count: number;
}

// Respuesta solicitud individual
export interface ServiceRequestResponse {
  serviceRequest: ServiceRequest;
}

// Evidencia fotográfica de una solicitud de servicio (antes/durante/después)
export interface ServiceRequestEvidence {
  id: number;
  uploadedBy: number;
  evidenceType: 'before' | 'during' | 'after';
  imageUrl: string;
  originalFilename: string | null;
  description: string | null;
  fileSize: number | null;
  createdAt: string;
}

// Agregar evidencia (mecánico) — la imagen ya debe estar alojada en una URL http/https
export interface AddEvidenceRequest {
  evidence_type: 'before' | 'during' | 'after';
  image_url: string;
  original_filename?: string;
  description?: string;
  file_size?: number;
}

// Respuesta lista de evidencias
export interface EvidenceListResponse {
  evidences: ServiceRequestEvidence[];
  count: number;
}

// Respuesta evidencia individual
export interface EvidenceResponse {
  evidence: ServiceRequestEvidence;
}

// Estadísticas agregadas del mecánico autenticado
export interface MechanicStats {
  totalCompleted: number;
  totalEarnings: number;
  totalRated: number;
  averageRating: number | null;
  averagePunctuality: number | null;
  averageServiceQuality: number | null;
}

export interface MechanicStatsResponse {
  stats: MechanicStats;
}
