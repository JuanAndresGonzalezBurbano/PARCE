// Estado de documento colombiano (SOAT o Tecnomecánica)
export type DocumentStatus = 'not_set' | 'valid' | 'expiring_soon' | 'expired';

// Vehículo del usuario
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
  // El backend usa soft-delete (status='inactive' + deleted_at) — nunca
  // produce status='deleted' (ver VehicleValidator::VALID_STATUSES y la
  // migración de `vehicles`, que documentan solo active/inactive).
  status: 'active' | 'inactive';
  soatExpirationDate: string | null;           // YYYY-MM-DD
  tecnomecanicaExpirationDate: string | null;  // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

// Crear vehículo
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
  soat_expiration_date?: string;            // YYYY-MM-DD
  tecnomecanica_expiration_date?: string;   // YYYY-MM-DD
}

// Actualizar vehículo
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
  soat_expiration_date?: string;            // YYYY-MM-DD
  tecnomecanica_expiration_date?: string;   // YYYY-MM-DD
}

// Respuesta lista de vehículos
export interface VehicleListResponse {
  vehicles: Vehicle[];
  count: number;
}

// Respuesta vehículo individual
export interface VehicleResponse {
  vehicle: Vehicle;
}
