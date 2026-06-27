// ============================================================
// Vehicle Types — PARCE
// Incluye campos de documentos obligatorios colombianos:
//   SOAT (Seguro Obligatorio de Accidentes de Tránsito)
//   Tecnomecánica (Revisión técnico-mecánica)
// ============================================================

/** Estado calculado de un documento de vehículo */
export type DocumentStatus = 'not_set' | 'valid' | 'expiring_soon' | 'expired';

/** Vehículo completo tal como lo devuelve el backend */
export interface Vehicle {
  id: number;
  userId: number;
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  color: string | null;
  vin: string | null;
  vehicleType: 'sedan' | 'suv' | 'truck' | 'motorcycle' | 'other';
  fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid' | 'other';
  nickname: string | null;
  primaryPhotoUrl: string | null;
  isPrimary: boolean;
  status: 'active' | 'inactive' | 'deleted';
  createdAt: string;
  updatedAt: string;

  // ---- Campos SOAT ----
  // Número de póliza, fecha de vencimiento y URL del documento
  soatNumber: string | null;
  soatExpirationDate: string | null;   // YYYY-MM-DD
  soatDocumentUrl: string | null;
  soatUploadedAt: string | null;

  // ---- Campos Tecnomecánica ----
  tecnomecanicaNumber: string | null;
  tecnomecanicaExpirationDate: string | null;  // YYYY-MM-DD
  tecnomecanicaDocumentUrl: string | null;
  tecnomecanicaUploadedAt: string | null;
}

/** Payload para crear un nuevo vehículo (snake_case — va directo a la API) */
export interface CreateVehicleRequest {
  license_plate: string;
  make: string;
  model: string;
  year: number;
  vehicle_type: 'sedan' | 'suv' | 'truck' | 'motorcycle' | 'other';
  fuel_type: 'gasoline' | 'diesel' | 'electric' | 'hybrid' | 'other';
  color?: string;
  vin?: string;
  nickname?: string;
  primary_photo_url?: string;
  is_primary?: boolean;
  // Documentos opcionales al crear
  soat_number?: string;
  soat_expiration_date?: string;       // YYYY-MM-DD
  soat_document_url?: string;
  tecnomecanica_number?: string;
  tecnomecanica_expiration_date?: string;  // YYYY-MM-DD
  tecnomecanica_document_url?: string;
}

/** Payload para actualizar un vehículo (todos los campos opcionales) */
export interface UpdateVehicleRequest {
  license_plate?: string;
  make?: string;
  model?: string;
  year?: number;
  vehicle_type?: 'sedan' | 'suv' | 'truck' | 'motorcycle' | 'other';
  fuel_type?: 'gasoline' | 'diesel' | 'electric' | 'hybrid' | 'other';
  color?: string;
  vin?: string;
  nickname?: string;
  primary_photo_url?: string;
  is_primary?: boolean;
  status?: 'active' | 'inactive';
  // Documentos
  soat_number?: string;
  soat_expiration_date?: string;
  soat_document_url?: string;
  tecnomecanica_number?: string;
  tecnomecanica_expiration_date?: string;
  tecnomecanica_document_url?: string;
}

// Respuestas de la API
export interface VehicleListResponse {
  vehicles: Vehicle[];
  count: number;
}

export interface VehicleResponse {
  vehicle: Vehicle;
}
