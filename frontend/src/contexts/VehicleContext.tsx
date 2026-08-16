import { createContext, useState, ReactNode } from 'react';
import { vehicleService } from '@/services/vehicleService';
import type { Vehicle, CreateVehicleRequest, UpdateVehicleRequest } from '@/types/vehicle';

interface VehicleContextType {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  isLoading: boolean;
  error: string | null;
  fieldErrors: Record<string, string | string[]> | null;
  loadVehicles: () => Promise<void>;
  createVehicle: (data: CreateVehicleRequest) => Promise<boolean>;
  updateVehicle: (id: number, data: UpdateVehicleRequest) => Promise<boolean>;
  deleteVehicle: (id: number) => Promise<boolean>;
  setPrimaryVehicle: (id: number) => Promise<boolean>;
  selectVehicle: (vehicle: Vehicle | null) => void;
  clearError: () => void;
}

export const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

interface VehicleProviderProps {
  children: ReactNode;
}

export function VehicleProvider({ children }: VehicleProviderProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | string[]> | null>(null);

  async function loadVehicles() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await vehicleService.getVehicles();

      if (response.success) {
        setVehicles(response.data.vehicles);
      } else {
        setError(response.error);
      }
    } catch {
      setError('Failed to load vehicles');
    } finally {
      setIsLoading(false);
    }
  }

  async function createVehicle(data: CreateVehicleRequest): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    setFieldErrors(null);

    try {
      const response = await vehicleService.createVehicle(data);

      if (response.success) {
        await loadVehicles(); // Refresh list
        setIsLoading(false);
        return true;
      } else {
        setError(response.error);
        setFieldErrors(response.fields ?? null);
        setIsLoading(false);
        return false;
      }
    } catch {
      setError('Failed to create vehicle');
      setIsLoading(false);
      return false;
    }
  }

  async function updateVehicle(id: number, data: UpdateVehicleRequest): Promise<boolean> {
    setIsLoading(true);
    setError(null);
    setFieldErrors(null);

    try {
      const response = await vehicleService.updateVehicle(id, data);

      if (response.success) {
        await loadVehicles(); // Refresh list
        setIsLoading(false);
        return true;
      } else {
        setError(response.error);
        setFieldErrors(response.fields ?? null);
        setIsLoading(false);
        return false;
      }
    } catch {
      setError('Failed to update vehicle');
      setIsLoading(false);
      return false;
    }
  }

  async function deleteVehicle(id: number): Promise<boolean> {
    setIsLoading(true);
    setError(null);

    try {
      const response = await vehicleService.deleteVehicle(id);

      if (response.success) {
        await loadVehicles(); // Refresh list
        setIsLoading(false);
        return true;
      } else {
        setError(response.error);
        setIsLoading(false);
        return false;
      }
    } catch {
      setError('Failed to delete vehicle');
      setIsLoading(false);
      return false;
    }
  }

  async function setPrimaryVehicle(id: number): Promise<boolean> {
    setIsLoading(true);
    setError(null);

    try {
      const response = await vehicleService.setPrimaryVehicle(id);

      if (response.success) {
        await loadVehicles(); // Refresh list
        setIsLoading(false);
        return true;
      } else {
        setError(response.error);
        setIsLoading(false);
        return false;
      }
    } catch {
      setError('Failed to set primary vehicle');
      setIsLoading(false);
      return false;
    }
  }

  function selectVehicle(vehicle: Vehicle | null) {
    setSelectedVehicle(vehicle);
  }

  function clearError() {
    setError(null);
    setFieldErrors(null);
  }

  const value: VehicleContextType = {
    vehicles,
    selectedVehicle,
    isLoading,
    error,
    fieldErrors,
    loadVehicles,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    setPrimaryVehicle,
    selectVehicle,
    clearError,
  };

  return <VehicleContext.Provider value={value}>{children}</VehicleContext.Provider>;
}
