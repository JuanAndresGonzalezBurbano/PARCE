// ── Tipos del módulo de pagos ────────────────────────────────────────────────

export type PaymentMethod = 'cash' | 'card' | 'pse';
export type PaymentTiming = 'now' | 'on_arrival';
export type PaymentStatus = 'pending' | 'paid' | 'confirmed' | 'rejected';

export interface SavedCard {
  last4: string;
  holder: string;
  expiry: string;
}

export interface Part {
  name: string;
  cost: number;
}

export interface Payment {
  id: string;
  // Partes involucradas
  clientName: string;
  mechanicName: string;
  serviceType: string;
  // Montos
  serviceAmount: number;
  partsAmount: number;
  totalAmount: number;
  parts: Part[];
  // Método y flujo
  method: PaymentMethod;
  timing: PaymentTiming;
  status: PaymentStatus;
  // Tarjeta guardada (si aplica)
  savedCard?: SavedCard;
  // Banco PSE (si aplica)
  pseBank?: string;
  // Auditoría
  createdAt: string;  // ISO date string
  updatedAt: string;
}

// ── Payload para crear un pago ───────────────────────────────────────────────
export type CreatePaymentDTO = Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>;

// ── Payload para actualizar un pago ─────────────────────────────────────────
export type UpdatePaymentDTO = Partial<Omit<Payment, 'id' | 'createdAt'>> & {
  updatedAt?: string;
};
