import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard, DollarSign, Building2, Check, ChevronRight,
  Wallet, Clock, CheckCircle2, AlertCircle, User, ArrowRight
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

type PaymentStatus = 'card_pending' | 'pse_paid' | 'pse_pending' | 'cash_pending' | 'completed';

interface ServiceOrder {
  id: string;
  reference: string;
  client: string;
  service: string;
  amount: number;
  paymentMethod: 'card' | 'pse' | 'cash';
  status: PaymentStatus;
  date: string;
}

const INITIAL_ORDERS: ServiceOrder[] = [
  { id: '1', reference: 'PARCE-2024-00142', client: 'María López', service: 'Cambio de aceite y filtros', amount: 140000, paymentMethod: 'card', status: 'card_pending', date: '2024-01-15 10:30' },
  { id: '2', reference: 'PARCE-2024-00141', client: 'Pedro Gómez', service: 'Revisión de frenos', amount: 95000, paymentMethod: 'pse', status: 'pse_paid', date: '2024-01-15 09:00' },
  { id: '3', reference: 'PARCE-2024-00140', client: 'Ana Torres', service: 'Cambio de batería', amount: 220000, paymentMethod: 'pse', status: 'pse_pending', date: '2024-01-15 08:15' },
  { id: '4', reference: 'PARCE-2024-00139', client: 'Luis Martínez', service: 'Diagnóstico general', amount: 60000, paymentMethod: 'cash', status: 'cash_pending', date: '2024-01-14 16:45' },
];

const HISTORY: ServiceOrder[] = [
  { id: '5', reference: 'PARCE-2024-00138', client: 'Carlos Ruiz', service: 'Cambio de llantas', amount: 180000, paymentMethod: 'card', status: 'completed', date: '2024-01-14 14:00' },
  { id: '6', reference: 'PARCE-2024-00137', client: 'Sandra Díaz', service: 'Alineación y balanceo', amount: 75000, paymentMethod: 'cash', status: 'completed', date: '2024-01-14 11:30' },
  { id: '7', reference: 'PARCE-2024-00136', client: 'Jorge Vargas', service: 'Cambio de correa', amount: 130000, paymentMethod: 'pse', status: 'completed', date: '2024-01-13 15:20' },
];

const formatCOP = (val: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);

const STATUS_CONFIG: Record<PaymentStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  card_pending: { label: 'Tarjeta guardada', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30', icon: CreditCard },
  pse_paid: { label: 'PSE pagado', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30', icon: CheckCircle2 },
  pse_pending: { label: 'PSE pendiente', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', icon: AlertCircle },
  cash_pending: { label: 'Efectivo pendiente', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', icon: DollarSign },
  completed: { label: 'Completado', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30', icon: Check },
};

const METHOD_ICON: Record<string, React.ElementType> = {
  card: CreditCard, pse: Building2, cash: DollarSign,
};

// Slider button component
function SliderButton({ onConfirm, label }: { onConfirm: () => void; label: string }) {
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    startX.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !trackRef.current) return;
    const trackWidth = trackRef.current.offsetWidth - 56;
    const moved = Math.max(0, Math.min(e.clientX - startX.current, trackWidth));
    setProgress((moved / trackWidth) * 100);
    if (moved / trackWidth >= 0.9) {
      setDragging(false);
      setConfirming(true);
      setTimeout(() => {
        setConfirmed(true);
        onConfirm();
      }, 800);
    }
  };

  const handleMouseUp = () => {
    if (!confirming) { setDragging(false); setProgress(0); }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setDragging(true);
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragging || !trackRef.current) return;
    const trackWidth = trackRef.current.offsetWidth - 56;
    const moved = Math.max(0, Math.min(e.touches[0].clientX - startX.current, trackWidth));
    setProgress((moved / trackWidth) * 100);
    if (moved / trackWidth >= 0.9) {
      setDragging(false);
      setConfirming(true);
      setTimeout(() => { setConfirmed(true); onConfirm(); }, 800);
    }
  };

  return (
    <div
      ref={trackRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
      className="relative h-14 bg-anthracite-800 rounded-full overflow-hidden select-none cursor-pointer"
    >
      {/* Fill bar */}
      <div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-gold-600 to-gold-500 rounded-full transition-all duration-100"
        style={{ width: `${Math.max(progress, confirmed ? 100 : 0)}%` }}
      />
      {/* Label */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-sm font-semibold transition-colors ${progress > 40 || confirmed ? 'text-anthracite-950' : 'text-gray-400'}`}>
          {confirmed ? '¡Pago confirmado!' : confirming ? 'Confirmando...' : label}
        </span>
      </div>
      {/* Handle */}
      {!confirmed && (
        <motion.div
          className="absolute top-1 bottom-1 left-1 w-12 bg-white rounded-full flex items-center justify-center shadow-lg cursor-grab active:cursor-grabbing z-10"
          style={{ left: `calc(${progress}% * (100% - 56px) / 100 + 4px)` }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {confirming ? (
            <Check className="w-5 h-5 text-gold-600" />
          ) : (
            <ArrowRight className="w-5 h-5 text-anthracite-800" />
          )}
        </motion.div>
      )}
      {confirmed && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Check className="w-6 h-6 text-anthracite-950" />
        </div>
      )}
    </div>
  );
}

export default function MechanicPaymentPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<ServiceOrder[]>(INITIAL_ORDERS);
  const [balance, setBalance] = useState(385000);
  const [confirmedId, setConfirmedId] = useState<string | null>(null);

  const handleFinishService = (order: ServiceOrder) => {
    setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status: 'completed' } : o));
    setBalance((prev) => prev + order.amount);
    setConfirmedId(order.id);
    setTimeout(() => setConfirmedId(null), 3000);
  };

  const activeOrders = orders.filter((o) => o.status !== 'completed');

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar isAuthenticated userName={user?.name || 'Mecánico'} />
      <Sidebar />

      <main className="ml-64 pt-16 p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8">

          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-white">Panel de Pagos</h1>
            <p className="text-gray-400 mt-1">Gestiona los cobros de tus servicios activos</p>
          </div>

          {/* Balance card */}
          <motion.div
            key={balance}
            initial={{ scale: 0.98 }}
            animate={{ scale: 1 }}
            className="card p-6 bg-gradient-to-br from-gold-600/20 to-anthracite-900/50 border-gold-500/30"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-gray-400 text-sm">Saldo disponible</p>
                <motion.p
                  key={balance}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-4xl font-bold text-gold-400"
                >
                  {formatCOP(balance)}
                </motion.p>
                <p className="text-gray-500 text-xs">Actualizado en tiempo real</p>
              </div>
              <div className="w-16 h-16 rounded-full bg-gold-500/20 flex items-center justify-center">
                <Wallet className="w-8 h-8 text-gold-400" />
              </div>
            </div>
          </motion.div>

          {/* Active orders */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Servicios Activos</h2>

            {activeOrders.length === 0 && (
              <div className="card p-8 text-center text-gray-500">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500/50" />
                <p>No tienes servicios activos pendientes</p>
              </div>
            )}

            {activeOrders.map((order) => {
              const status = STATUS_CONFIG[order.status];
              const StatusIcon = status.icon;
              const MethodIcon = METHOD_ICON[order.paymentMethod];
              const isJustConfirmed = confirmedId === order.id;

              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  className="card p-6 space-y-4"
                >
                  {/* Order header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-anthracite-800 flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">{order.client}</p>
                        <p className="text-gray-400 text-sm">{order.service}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${status.bg} ${status.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                  </div>

                  {/* Amount & method */}
                  <div className="flex items-center justify-between py-3 border-y border-anthracite-800">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <MethodIcon className="w-4 h-4" />
                      <span>{order.paymentMethod === 'card' ? 'Tarjeta bancaria' : order.paymentMethod === 'pse' ? 'PSE' : 'Efectivo'}</span>
                    </div>
                    <span className="text-gold-400 font-bold text-lg">{formatCOP(order.amount)}</span>
                  </div>

                  {/* Alerts */}
                  {order.status === 'card_pending' && (
                    <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <CreditCard className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <p className="text-blue-300 text-sm">El cliente tiene tarjeta guardada. Al finalizar el servicio, el cobro se realizará automáticamente.</p>
                    </div>
                  )}
                  {order.status === 'pse_paid' && (
                    <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <p className="text-green-300 text-sm">El pago PSE ya fue recibido. Se acreditará a tu saldo al finalizar el servicio.</p>
                    </div>
                  )}
                  {(order.status === 'pse_pending' || order.status === 'cash_pending') && (
                    <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <p className="text-amber-300 text-sm">
                        {order.status === 'pse_pending'
                          ? 'Espera la transferencia PSE del cliente antes de confirmar.'
                          : `Cobra ${formatCOP(order.amount)} en efectivo al cliente.`}
                      </p>
                    </div>
                  )}

                  {/* Action buttons */}
                  <AnimatePresence>
                    {isJustConfirmed ? (
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center justify-center gap-2 p-3 bg-green-500/20 border border-green-500/30 rounded-xl">
                        <Check className="w-5 h-5 text-green-400" />
                        <span className="text-green-400 font-semibold">¡Pago confirmado! Saldo actualizado</span>
                      </motion.div>
                    ) : order.status === 'card_pending' ? (
                      <button
                        onClick={() => handleFinishService(order)}
                        className="w-full btn-primary flex items-center justify-center gap-2"
                      >
                        <CreditCard className="w-4 h-4" />
                        Finalizar servicio y cobrar
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : order.status === 'pse_paid' ? (
                      <button
                        onClick={() => handleFinishService(order)}
                        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Finalizar servicio
                      </button>
                    ) : (
                      <SliderButton
                        label={order.status === 'pse_pending' ? 'Desliza para confirmar transferencia PSE' : 'Desliza para confirmar pago en efectivo'}
                        onConfirm={() => handleFinishService(order)}
                      />
                    )}
                  </AnimatePresence>

                  <p className="text-gray-600 text-xs text-right">Ref: {order.reference} · {order.date}</p>
                </motion.div>
              );
            })}
          </div>

          {/* History */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" /> Historial de Pagos
            </h2>
            <div className="card divide-y divide-anthracite-800">
              {HISTORY.map((item) => {
                const MethodIcon = METHOD_ICON[item.paymentMethod];
                return (
                  <div key={item.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-green-500/10 flex items-center justify-center">
                        <MethodIcon className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold">{item.client}</p>
                        <p className="text-gray-500 text-xs">{item.service} · {item.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-bold">+{formatCOP(item.amount)}</p>
                      <p className="text-gray-500 text-xs capitalize">{item.paymentMethod === 'card' ? 'Tarjeta' : item.paymentMethod === 'pse' ? 'PSE' : 'Efectivo'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </motion.div>
      </main>
    </div>
  );
}
