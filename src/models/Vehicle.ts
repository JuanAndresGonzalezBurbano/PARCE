// Vehicle Model - Define vehicle-related interfaces and types

export interface Vehicle {
  id: string;
  vehicleBrand: string;
  model: string;
  plate: string;
  year: string;
  color: string;
  ownerId: string;
}

export interface VehicleData {
  vehicleBrand: string;
  model: string;
  plate: string;
  year: string;
  color: string;
}

export interface MechanicVehicleData extends VehicleData {
  soatCode: string;
  tecnomecanicaCode: string;
  driverLicense: string;
}

export interface VehicleDocuments {
  soatCode: string;
  soatExpiration?: Date;
  tecnomecanicaCode: string;
  tecnomecanicaExpiration?: Date;
  driverLicense: string;
  licenseExpiration?: Date;
}
