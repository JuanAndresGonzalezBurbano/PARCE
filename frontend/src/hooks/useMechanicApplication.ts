import { useContext } from 'react';
import { MechanicApplicationContext } from '@/contexts/MechanicApplicationContext';

export function useMechanicApplication() {
  const context = useContext(MechanicApplicationContext);

  if (context === undefined) {
    throw new Error('useMechanicApplication must be used within a MechanicApplicationProvider');
  }

  return context;
}
