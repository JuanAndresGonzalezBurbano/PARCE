// ── CRUD del módulo de pagos (sin backend — datos en memoria) ────────────────
// Reemplaza los arrays MOCK con llamadas a este servicio en cualquier componente.

import type { Payment, CreatePaymentDTO, UpdatePaymentDTO } from './types';

// ── Datos iniciales de ejemplo ───────────────────────────────────────────────
const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'PAY-001',
    clientName: 'Carlos Rodríguez',
    mechanicName: 'María González',
    serviceType: 'Cambio de llanta',
    serviceAmount: 50000,
    partsAmount: 30000,
    totalAmount: 80000,
    parts: [{ name: 'Llanta 195/65 R15', cost: 30000 }],
    method: 'cash',
    timing: 'on_arrival',
    status: 'pending',
    createdAt: '2026-06-07T10:30:00',
    updatedAt: '2026-06-07T10:30:00',
  },
  {
    id: 'PAY-002',
    clientName: 'María López',
    mechanicName: 'Pedro Soto',
    serviceType: 'Diagnóstico mecánico',
    serviceAmount: 80000,
    partsAmount: 45000,
    totalAmount: 125000,
    parts: [
      { name: 'Filtro de aceite', cost: 20000 },
      { name: 'Aceite 5W-30 (4L)', cost: 25000 },
    ],
    method: 'card',
    timing: 'on_arrival',
    status: 'paid',
    savedCard: { last4: '4242', holder: 'María López', expiry: '12/27' },
    createdAt: '2026-06-07T11:00:00',
    updatedAt: '2026-06-07T11:45:00',
  },
  {
    id: 'PAY-003',
    clientName: 'Juan Martínez',
    mechanicName: 'Ana Torres',
    serviceType: 'Suministro de combustible',
    serviceAmount: 60000,
    partsAmount: 0,
    totalAmount: 60000,
    parts: [],
    method: 'pse',
    timing: 'now',
    status: 'confirmed',
    pseBank: 'Bancolombia',
    createdAt: '2026-06-07T09:00:00',
    updatedAt: '2026-06-07T09:20:00',
  },
];

// ── Store en memoria ─────────────────────────────────────────────────────────
let store: Payment[] = [...INITIAL_PAYMENTS];

function now(): string {
  return new Date().toISOString();
}

function generateId(): string {
  return 'PAY-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ── READ — obtener todos ──────────────────────────────────────────────────────
export function getAllPayments(): Payment[] {
  return [...store];
}

// ── READ — obtener uno por id ─────────────────────────────────────────────────
export function getPaymentById(id: string): Payment | undefined {
  return store.find(p => p.id === id);
}

// ── READ — filtrar por mecánico ───────────────────────────────────────────────
export function getPaymentsByMechanic(mechanicName: string): Payment[] {
  return store.filter(p => p.mechanicName === mechanicName);
}

// ── READ — filtrar por cliente ────────────────────────────────────────────────
export function getPaymentsByClient(clientName: string): Payment[] {
  return store.filter(p => p.clientName === clientName);
}

// ── READ — filtrar por estado ─────────────────────────────────────────────────
export function getPaymentsByStatus(status: Payment['status']): Payment[] {
  return store.filter(p => p.status === status);
}

// ── CREATE ────────────────────────────────────────────────────────────────────
export function createPayment(dto: CreatePaymentDTO): Payment {
  const payment: Payment = {
    ...dto,
    id: generateId(),
    createdAt: now(),
    updatedAt: now(),
  };
  store = [...store, payment];
  return payment;
}

// ── UPDATE ────────────────────────────────────────────────────────────────────
export function updatePayment(id: string, dto: UpdatePaymentDTO): Payment | null {
  const index = store.findIndex(p => p.id === id);
  if (index === -1) return null;

  const updated: Payment = {
    ...store[index],
    ...dto,
    id,                         // nunca se cambia el id
    createdAt: store[index].createdAt,  // nunca se cambia la fecha de creación
    updatedAt: now(),
  };
  store = store.map((p, i) => (i === index ? updated : p));
  return updated;
}

// ── DELETE ────────────────────────────────────────────────────────────────────
export function deletePayment(id: string): boolean {
  const exists = store.some(p => p.id === id);
  if (!exists) return false;
  store = store.filter(p => p.id !== id);
  return true;
}

// ── Acciones de negocio ───────────────────────────────────────────────────────

/** El mecánico confirma que recibió el pago */
export function confirmPayment(id: string): Payment | null {
  return updatePayment(id, { status: 'confirmed' });
}

/** El mecánico rechaza o cancela un pago */
export function rejectPayment(id: string): Payment | null {
  return updatePayment(id, { status: 'rejected' });
}

/** El usuario marca el pago como realizado (PSE ahora / tarjeta autorizada) */
export function markAsPaid(id: string): Payment | null {
  return updatePayment(id, { status: 'paid' });
}

// ── Stats helpers ─────────────────────────────────────────────────────────────
export function getPaymentStats() {
  const all = getAllPayments();
  const confirmed = all.filter(p => p.status === 'confirmed');
  const pending   = all.filter(p => p.status === 'pending');
  const paid      = all.filter(p => p.status === 'paid');
  const rejected  = all.filter(p => p.status === 'rejected');

  return {
    total:             all.length,
    totalConfirmed:    confirmed.length,
    totalPending:      pending.length,
    totalPaid:         paid.length,
    totalRejected:     rejected.length,
    totalAmount:       all.reduce((s, p) => s + p.totalAmount, 0),
    confirmedAmount:   confirmed.reduce((s, p) => s + p.totalAmount, 0),
  };
}
