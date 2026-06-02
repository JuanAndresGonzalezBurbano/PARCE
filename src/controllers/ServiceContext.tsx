import { createContext, useContext, useState, ReactNode } from 'react';

export interface ServiceData {
  id: number;
  title: string;
  description: string;
  duration: string;
  chatbotDiagnosis?: string; // Si el usuario usó el chatbot
}

export interface ActiveService {
  service: ServiceData;
  mechanicName: string;
  mechanicRating: number;
  mechanicLocation: string; // Dirección de inicio del mecánico
  plate: string;
  estimatedMinutes: number; // minutos estimados de llegada
  distanceKm: number;
  startedAt: number; // timestamp
  status: 'en_camino' | 'llegando' | 'completado';
}

interface ServiceContextType {
  activeService: ActiveService | null;
  setActiveService: (s: ActiveService | null) => void;
  selectedService: ServiceData | null;
  setSelectedService: (s: ServiceData | null) => void;
  serviceFinished: boolean;       // mecánico finalizó → redirige usuario a pagos
  setServiceFinished: (v: boolean) => void;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export function ServiceProvider({ children }: { children: ReactNode }) {
  const [activeService, setActiveService] = useState<ActiveService | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceData | null>(null);
  const [serviceFinished, setServiceFinished] = useState(false);

  return (
    <ServiceContext.Provider value={{
      activeService, setActiveService,
      selectedService, setSelectedService,
      serviceFinished, setServiceFinished,
    }}>
      {children}
    </ServiceContext.Provider>
  );
}

export function useService() {
  const ctx = useContext(ServiceContext);
  if (!ctx) throw new Error('useService must be used within ServiceProvider');
  return ctx;
}
