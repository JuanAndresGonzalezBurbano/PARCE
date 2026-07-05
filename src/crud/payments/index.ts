// ── Punto de entrada del CRUD de pagos ───────────────────────────────────────
// Importa desde aquí en lugar de importar cada archivo por separado.
//
// Ejemplo de uso en un componente:
//
//   import { usePayments } from '@/crud/payments';
//   import type { Payment, CreatePaymentDTO } from '@/crud/payments';
//
//   const { payments, create, confirm, stats } = usePayments();

export type { Payment, CreatePaymentDTO, UpdatePaymentDTO, PaymentMethod, PaymentTiming, PaymentStatus, SavedCard, Part } from './types';

export {
  getAllPayments,
  getPaymentById,
  getPaymentsByMechanic,
  getPaymentsByClient,
  getPaymentsByStatus,
  createPayment,
  updatePayment,
  deletePayment,
  confirmPayment,
  rejectPayment,
  markAsPaid,
  getPaymentStats,
} from './paymentService';

export { usePayments } from './usePayments';
