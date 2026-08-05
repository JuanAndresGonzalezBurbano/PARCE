// ── Hook React para consumir el CRUD de pagos ────────────────────────────────
// Uso: const { payments, create, update, remove, confirm, reject, markPaid } = usePayments();

import { useState, useCallback } from 'react';
import type { Payment, CreatePaymentDTO, UpdatePaymentDTO } from './types';
import {
  getAllPayments,
  getPaymentById,
  getPaymentsByStatus,
  createPayment,
  updatePayment,
  deletePayment,
  confirmPayment,
  rejectPayment,
  markAsPaid,
  getPaymentStats,
} from './paymentService';

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>(getAllPayments);

  // Refresca el estado desde el store
  const refresh = useCallback(() => {
    setPayments(getAllPayments());
  }, []);

  // ── CREATE ────────────────────────────────────────────────────────────────
  const create = useCallback((dto: CreatePaymentDTO): Payment => {
    const created = createPayment(dto);
    refresh();
    return created;
  }, [refresh]);

  // ── READ por id ───────────────────────────────────────────────────────────
  const getById = useCallback((id: string): Payment | undefined => {
    return getPaymentById(id);
  }, []);

  // ── READ por estado ───────────────────────────────────────────────────────
  const getByStatus = useCallback((status: Payment['status']): Payment[] => {
    return getPaymentsByStatus(status);
  }, []);

  // ── UPDATE ────────────────────────────────────────────────────────────────
  const update = useCallback((id: string, dto: UpdatePaymentDTO): Payment | null => {
    const updated = updatePayment(id, dto);
    refresh();
    return updated;
  }, [refresh]);

  // ── DELETE ────────────────────────────────────────────────────────────────
  const remove = useCallback((id: string): boolean => {
    const ok = deletePayment(id);
    if (ok) refresh();
    return ok;
  }, [refresh]);

  // ── Acciones de negocio ───────────────────────────────────────────────────
  const confirm = useCallback((id: string): Payment | null => {
    const result = confirmPayment(id);
    refresh();
    return result;
  }, [refresh]);

  const reject = useCallback((id: string): Payment | null => {
    const result = rejectPayment(id);
    refresh();
    return result;
  }, [refresh]);

  const markPaid = useCallback((id: string): Payment | null => {
    const result = markAsPaid(id);
    refresh();
    return result;
  }, [refresh]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = getPaymentStats();

  return {
    // Estado
    payments,
    stats,
    // CRUD
    create,
    getById,
    getByStatus,
    update,
    remove,
    // Acciones de negocio
    confirm,
    reject,
    markPaid,
    // Utilitario
    refresh,
  };
}
