// Service Request type from backend
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
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
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
  createdAt: string;
  updatedAt: string;
  // Populated relationships
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
}

// Create service request
export interface CreateServiceRequestRequest {
  vehicle_id: number;
  emergency_type: 'tire' | 'battery' | 'fuel' | 'engine' | 'lockout' | 'tow' | 'other';
  description: string;
  latitude: number;
  longitude: number;
  priority?: 'low' | 'normal' | 'urgent';
}

// Update service request
export interface UpdateServiceRequestRequest {
  description?: string;
  latitude?: number;
  longitude?: number;
  priority?: 'low' | 'normal' | 'urgent';
}

// Cancel service request
export interface CancelServiceRequestRequest {
  cancellation_reason: string;
}

// Rate service request
export interface RateServiceRequestRequest {
  customer_rating: number;
  customer_feedback?: string;
}

// Complete service request (mechanic)
export interface CompleteServiceRequestRequest {
  final_cost: number;
}

// Service request list response
export interface ServiceRequestListResponse {
  service_requests: ServiceRequest[];
  count: number;
}

// Single service request response
export interface ServiceRequestResponse {
  service_request: ServiceRequest;
}
