// Vehicle type from backend
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
}

// Create vehicle request
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
}

// Update vehicle request
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
}

// Vehicle list response
export interface VehicleListResponse {
  vehicles: Vehicle[];
  count: number;
}

// Single vehicle response
export interface VehicleResponse {
  vehicle: Vehicle;
}
