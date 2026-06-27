// ============================================================
// Service Request Types — PARCE
// Incluye sistema de calificación de 3 componentes y
// evidencias fotográficas antes/durante/después del servicio.
// ============================================================

/** Solicitud de servicio de emergencia */
export interface ServiceRequest {
  id: number;
  serviceCode: string;
  customerId: number;
  vehicleId: number;
  mechanicId: number | null;
  resolvedBy: number | null;
  emergencyType: 'tire' | 'battery' | 'fuel' | 'engine' | 'lockout' | 'tow' | 'other';
  description: string;
  priority: 'low' | 'normal' | 'urgent';
  latitude: number;
  longitude: number;
  // Para mecánicos en solicitudes pendientes, el backend entrega solo
  // latitudeApproximate / longitudeApproximate (privacidad de ubicación)
  latitudeApproximate?: number;
  longitudeApproximate?: number;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  requestedAt: string;
  assignedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancelledBy: number | null;
  cancellationReason: string | null;
  finalCost: number | null;

  // ---- Sistema de calificación de 3 componentes ----
  customerRating: number | null;       // Calificación general (1-5)
  punctualityRating: number | null;    // Puntualidad del mecánico (1-5)
  serviceQualityRating: number | null; // Calidad del servicio (1-5)
  customerFeedback: string | null;

  createdAt: string;
  updatedAt: string;

  // Relaciones pobladas por JOIN en el backend
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
    phone?: string;
  };
  mechanic?: {
    firstName: string;
    lastName: string;
    phone?: string;
  };
}

/** Evidencia fotográfica asociada a una solicitud */
export interface ServiceRequestEvidence {
  id: number;
  serviceRequestId: number;
  uploadedBy: number;       // ID del mecánico que subió la foto
  evidenceType: 'before' | 'during' | 'after';
  imageUrl: string;
  originalFilename: string | null;
  fileSize: number | null;  // bytes
  createdAt: string;
}

// ---- Payloads de request (snake_case — van directo a la API) ----

export interface CreateServiceRequestRequest {
  vehicle_id: number;
  emergency_type: 'tire' | 'battery' | 'fuel' | 'engine' | 'lockout' | 'tow' | 'other';
  description: string;
  latitude: number;
  longitude: number;
  priority?: 'low' | 'normal' | 'urgent';
}

export interface UpdateServiceRequestRequest {
  description?: string;
  latitude?: number;
  longitude?: number;
  priority?: 'low' | 'normal' | 'urgent';
}

export interface CancelServiceRequestRequest {
  cancellation_reason: string;
}

/** Calificación con los 3 componentes opcionales */
export interface RateServiceRequestRequest {
  customer_rating: number;            // 1-5, REQUERIDO
  customer_feedback?: string;
  punctuality_rating?: number;        // 1-5, OPCIONAL
  service_quality_rating?: number;    // 1-5, OPCIONAL
}

export interface CompleteServiceRequestRequest {
  final_cost: number;
}

/** Payload para agregar evidencia fotográfica (mecánico) */
export interface AddEvidenceRequest {
  evidence_type: 'before' | 'during' | 'after';
  image_url: string;
  original_filename?: string;
  file_size?: number;
}

// ---- Respuestas de la API ----

export interface ServiceRequestListResponse {
  service_requests: ServiceRequest[];
  count: number;
}

export interface ServiceRequestResponse {
  service_request: ServiceRequest;
}

export interface EvidenceListResponse {
  evidences: ServiceRequestEvidence[];
  count: number;
}

export interface EvidenceResponse {
  evidence: ServiceRequestEvidence;
}
