import { useContext } from 'react';
import { VehicleContext } from '@/contexts/VehicleContext';

export function useVehicles() {
  const context = useContext(VehicleContext);

  if (context === undefined) {
    throw new Error('useVehicles must be used within a VehicleProvider');
  }

  return context;
}
