import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Edit2, Eye, Check, X, Search,
  CreditCard, DollarSign, Building2, ChevronDown
} from 'lucide-react';
import Navbar from '../../views/components/Navbar';
import Sidebar from '../../views/components/Sidebar';
import { useAuth } from '../../controllers/AuthContext';
import { usePayments } from './index';
import type { Payment, CreatePaymentDTO } from './types';

const METHOD_LABEL = { cash: '💵 Efectivo', card: '💳 Tarjeta', pse: '🏦 PSE' };
const STATUS_STYLE: Record<Payment['status'], string> = {
  pending:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  paid:      'bg-blue-500/20   text-blue-400   border-blue-500/30',
  confirmed: 'bg-green-500/20  text-green-400  border-green-500/30',
  rejected:  'bg-red-500/20    text-red-400    border-red-500/30',
};
const STATUS_LABEL = { pending: 'Pendiente', paid: 'Pagado', confirmed: 'Confirmado', rejected: 'Rechazado' };

const EMPTY_FORM: CreatePaymentDTO = {
  clientName: '', mechanicName: '', serviceType: '',
  serviceAmount: 0, partsAmount: 0, totalAmount: 0, parts: [],
  method: 'cash', timing: 'on_arrival', status: 'pending',
};

export default function PaymentCRUDPage() {
  const { user } = useAuth();
  const { payments, stats, create, update, remove, confirm, reject } = usePayments();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<Payment['status'] | 'all'>('all');
  const [modal, setModal] = useState<'create' | 'edit' | 'view' | null>(null);
  const [selected, setSelected] = useState<Payment | null>(null);
  const [form, setForm] = useState<CreatePaymentDTO>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = payments.filter(p => {
    const matchSearch =
      p.clientName.toLowerCase().includes(search.toLowerCase()) ||
      p.mechanicName.toLowerCase().includes(search.toLowerCase()) ||
      p.serviceType.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const openCreate = () => { setForm(EMPTY_FORM); setModal('create'); };
  const openEdit = (p: Payment) => {
    setSelected(p);
    setForm({ clientName: p.clientName, mechanicName: p.mechanicName, serviceType: p.serviceType,
      serviceAmount: p.serviceAmount, partsAmount: p.partsAmount, totalAmount: p.totalAmount,
      parts: p.parts, method: p.method, timing: p.timing, status: p.status });
    setModal('edit');
  };
  const openView = (p: Payment) => { setSelected(p); setModal('view'); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleCreate = () => {
    if (!form.clientName || !form.serviceType) return;
    create({ ...form, totalAmount: form.serviceAmount + form.partsAmount });
    closeModal();
  };

  const handleEdit = () => {
    if (!selected) return;
    update(selected.id, { ...form, totalAmount: form.serviceAmount + form.partsAmount });
    closeModal();
  };

  const handleDelete = (id: string) => { remove(id); setDeleteId(null); };

  const f = (n: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar isAuthenticated userName={user?.name || 'Admin'} hideNavLinks />
      <Sidebar />
      <main className="ml-64 pt-16 p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">CRUD — Módulo de Pagos</h1>
              <p className="text-gray-400 text-sm mt-1">Gestión completa de pagos del sistema</p>
            </div>
            <button onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2.5 bg-gold-500 hover:bg-gold-600 text-anthracite-950 font-semibold rounded-xl transition-colors">
              <Plus className="w-4 h-4" /> Nuevo pago
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Total registros', value: stats.total, color: 'text-white' },
              { label: 'Pendientes',      value: stats.totalPending,   color: 'text-yellow-400' },
              { label: 'Confirmados',     value: stats.totalConfirmed, color: 'text-green-400' },
              { label: 'Monto confirmado',value: f(stats.confirmedAmount), color: 'text-gold-400' },
            ].map(s => (
              <div key={s.label} className="card p-4">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-gray-500 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filtros */}
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por cliente, mecánico, servicio o ID..."
                className="input-field pl-9 w-full text-sm" />
            </div>
            <div className="relative">
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as Payment['status'] | 'all')}
                className="input-field pr-8 text-sm appearance-none bg-dark-800">
                <option value="all">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="paid">Pagado</option>
                <option value="confirmed">Confirmado</option>
                <option value="rejected">Rechazado</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Tabla */}
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-anthracite-800 text-gray-400 text-xs uppercase">
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Cliente</th>
                  <th className="px-4 py-3 text-left">Mecánico</th>
                  <th className="px-4 py-3 text-left">Servicio</th>
                  <th className="px-4 py-3 text-left">Método</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">Sin resultados</td></tr>
                )}
                {filtered.map(p => (
                  <tr key={p.id} className="border-b border-anthracite-800/50 hover:bg-dark-800/40 transition-colors">
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{p.id}</td>
                    <td className="px-4 py-3 text-white">{p.clientName}</td>
                    <td className="px-4 py-3 text-gray-300">{p.mechanicName}</td>
                    <td className="px-4 py-3 text-gray-300 max-w-32 truncate">{p.serviceType}</td>
                    <td className="px-4 py-3 text-gray-400">{METHOD_LABEL[p.method]}</td>
                    <td className="px-4 py-3 text-right text-gold-400 font-semibold">{f(p.totalAmount)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLE[p.status]}`}>
                        {STATUS_LABEL[p.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openView(p)} title="Ver detalle"
                          className="p-1.5 hover:bg-dark-700 rounded-lg text-gray-400 hover:text-white transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEdit(p)} title="Editar"
                          className="p-1.5 hover:bg-dark-700 rounded-lg text-gray-400 hover:text-blue-400 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {p.status === 'pending' || p.status === 'paid' ? (
                          <button onClick={() => confirm(p.id)} title="Confirmar pago"
                            className="p-1.5 hover:bg-green-500/10 rounded-lg text-gray-400 hover:text-green-400 transition-colors">
                            <Check className="w-4 h-4" />
                          </button>
                        ) : null}
                        {p.status === 'pending' ? (
                          <button onClick={() => reject(p.id)} title="Rechazar"
                            className="p-1.5 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        ) : null}
                        <button onClick={() => setDeleteId(p.id)} title="Eliminar"
                          className="p-1.5 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </motion.div>
      </main>

      {/* ── MODAL: VER DETALLE ─────────────────────────────────────────── */}
      <AnimatePresence>
        {modal === 'view' && selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={closeModal}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()} className="card p-6 max-w-md w-full mx-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Detalle del Pago</h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-0 divide-y divide-anthracite-800 text-sm">
                {([
                  ['ID', selected.id],
                  ['Cliente', selected.clientName],
                  ['Mecánico', selected.mechanicName],
                  ['Servicio', selected.serviceType],
                  ['Método', METHOD_LABEL[selected.method]],
                  ['Momento de pago', selected.timing === 'now' ? 'Ahora' : 'Al llegar'],
                  ['Servicio', f(selected.serviceAmount)],
                  ['Repuestos', f(selected.partsAmount)],
                  ['TOTAL', f(selected.totalAmount)],
                  ['Estado', STATUS_LABEL[selected.status]],
                  ['Creado', selected.createdAt.replace('T', ' ').substring(0, 16)],
                ] as [string, string][]).map(([label, value]) => (
                  <div key={label} className="flex justify-between py-2.5">
                    <span className="text-gray-400">{label}</span>
                    <span className={label === 'TOTAL' ? 'text-gold-400 font-bold' : 'text-white'}>{value}</span>
                  </div>
                ))}
                {selected.savedCard && (
                  <div className="flex justify-between py-2.5">
                    <span className="text-gray-400">Tarjeta</span>
                    <span className="text-blue-400">•••• {selected.savedCard.last4} · {selected.savedCard.holder}</span>
                  </div>
                )}
                {selected.pseBank && (
                  <div className="flex justify-between py-2.5">
                    <span className="text-gray-400">Banco PSE</span>
                    <span className="text-purple-400">{selected.pseBank}</span>
                  </div>
                )}
              </div>
              {selected.parts.length > 0 && (
                <div>
                  <p className="text-gray-500 text-xs uppercase mb-2">Repuestos</p>
                  {selected.parts.map((part, i) => (
                    <div key={i} className="flex justify-between text-sm py-1 border-b border-anthracite-800/50">
                      <span className="text-gray-300">{part.name}</span>
                      <span className="text-orange-400">{f(part.cost)}</span>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={closeModal} className="w-full btn-primary">Cerrar</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: CREAR / EDITAR ──────────────────────────────────────── */}
      <AnimatePresence>
        {(modal === 'create' || modal === 'edit') && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={closeModal}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()} className="card p-6 max-w-lg w-full mx-4 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">{modal === 'create' ? 'Nuevo Pago' : 'Editar Pago'}</h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3">
                {([
                  ['clientName',   'Cliente',   'text', 'Nombre del cliente'],
                  ['mechanicName', 'Mecánico',  'text', 'Nombre del mecánico'],
                  ['serviceType',  'Servicio',  'text', 'Tipo de servicio'],
                ] as [keyof CreatePaymentDTO, string, string, string][]).map(([key, label, type, placeholder]) => (
                  <div key={key}>
                    <label className="text-xs text-gray-400 mb-1 block">{label}</label>
                    <input type={type} placeholder={placeholder} value={form[key] as string}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      className="input-field w-full text-sm" />
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Monto servicio</label>
                    <input type="number" value={form.serviceAmount}
                      onChange={e => setForm(f => ({ ...f, serviceAmount: +e.target.value }))}
                      className="input-field w-full text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Monto repuestos</label>
                    <input type="number" value={form.partsAmount}
                      onChange={e => setForm(f => ({ ...f, partsAmount: +e.target.value }))}
                      className="input-field w-full text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Método de pago</label>
                    <select value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value as 'cash'|'card'|'pse' }))}
                      className="input-field w-full text-sm bg-dark-800">
                      <option value="cash">Efectivo</option>
                      <option value="card">Tarjeta</option>
                      <option value="pse">PSE</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Momento de pago</label>
                    <select value={form.timing} onChange={e => setForm(f => ({ ...f, timing: e.target.value as 'now'|'on_arrival' }))}
                      className="input-field w-full text-sm bg-dark-800">
                      <option value="now">Ahora</option>
                      <option value="on_arrival">Al llegar</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Estado</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Payment['status'] }))}
                    className="input-field w-full text-sm bg-dark-800">
                    <option value="pending">Pendiente</option>
                    <option value="paid">Pagado</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="rejected">Rechazado</option>
                  </select>
                </div>
                <div className="p-3 bg-dark-800/60 rounded-xl text-sm flex justify-between">
                  <span className="text-gray-400">Total calculado</span>
                  <span className="text-gold-400 font-bold">{f(form.serviceAmount + form.partsAmount)}</span>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={closeModal} className="flex-1 py-2.5 bg-dark-700 hover:bg-dark-600 text-white rounded-xl transition-colors text-sm">Cancelar</button>
                <button onClick={modal === 'create' ? handleCreate : handleEdit}
                  disabled={!form.clientName || !form.serviceType}
                  className="flex-1 py-2.5 btn-primary text-sm disabled:opacity-40">
                  {modal === 'create' ? 'Crear pago' : 'Guardar cambios'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: CONFIRMAR ELIMINAR ──────────────────────────────────── */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setDeleteId(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()} className="card p-6 max-w-sm w-full mx-4 text-center space-y-4">
              <div className="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="w-7 h-7 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">¿Eliminar pago?</h3>
                <p className="text-gray-400 text-sm mt-1">Esta acción no se puede deshacer.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 bg-dark-700 hover:bg-dark-600 text-white rounded-xl transition-colors text-sm">Cancelar</button>
                <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors text-sm font-semibold">Eliminar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
