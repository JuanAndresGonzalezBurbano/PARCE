import { useContext } from 'react';
import { PQRContext } from '@/contexts/PQRContext';

export function usePqr() {
  const context = useContext(PQRContext);

  if (context === undefined) {
    throw new Error('usePqr must be used within a PQRProvider');
  }

  return context;
}
