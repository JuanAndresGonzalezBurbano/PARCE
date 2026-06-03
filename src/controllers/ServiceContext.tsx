import { createContext, useContext, useState, ReactNode } from 'react';

export interface ServiceData {
  id: number;
  title: string;
  description: string;
  duration: string;
  chatbotDiagnosis?: string;
}

export interface ActiveService {
  service: ServiceData;
  mechanicName: string;
  mechanicRating: number;
  mechanicLocation: string;
  plate: string;
  estimatedMinutes: number;
  distanceKm: number;
  startedAt: number;
  status: 'en_camino' | 'llegando' | 'completado';
}

// ── Info de pago elegida por el usuario ──────────────────────────────────────
export type PaymentMethodType = 'card' | 'pse' | 'cash';
export type PaymentTiming = 'now' | 'on_arrival'; // "ahora" o "cuando llegue el mecánico"
export type PaymentStatus = 'pending' | 'paid' | 'waiting_mechanic';

export interface SavedCard {
  last4: string;
  holder: string;
  expiry: string;
}

export interface PaymentInfo {
  method: PaymentMethodType;
  timing: PaymentTiming;       // cuándo se paga
  status: PaymentStatus;       // estado actual del pago
  savedCard?: SavedCard;       // tarjeta guardada (solo si method === 'card')
  amount: number;              // monto del servicio
}

interface ServiceContextType {
  activeService: ActiveService | null;
  setActiveService: (s: ActiveService | null) => void;
  selectedService: ServiceData | null;
  setSelectedService: (s: ServiceData | null) => void;
  serviceFinished: boolean;
  setServiceFinished: (v: boolean) => void;
  // ── Pago ──
  paymentInfo: PaymentInfo | null;
  setPaymentInfo: (p: PaymentInfo | null) => void;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export function ServiceProvider({ children }: { children: ReactNode }) {
  const [activeService, setActiveService] = useState<ActiveService | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceData | null>(null);
  const [serviceFinished, setServiceFinished] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);

  return (
    <ServiceContext.Provider value={{
      activeService, setActiveService,
      selectedService, setSelectedService,
      serviceFinished, setServiceFinished,
      paymentInfo, setPaymentInfo,
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
