import { useContext } from 'react';
import { RequestContext } from '@/contexts/RequestContext';

export function useRequests() {
  const context = useContext(RequestContext);

  if (context === undefined) {
    throw new Error('useRequests must be used within a RequestProvider');
  }

  return context;
}
