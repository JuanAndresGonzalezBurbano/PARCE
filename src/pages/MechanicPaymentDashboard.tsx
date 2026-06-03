import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard, DollarSign, Building2, Check, ArrowRight,
  AlertCircle, CheckCircle2, User, Wallet, Clock, Loader2
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

type PaymentStatus = 'card_pending' | 'pse_paid' | 'pse_pending' | 'cash_pending' | 'completed' | 'card_rejected';

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

const formatCOP = (val: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);

// ── Slider de confirmación estilo Didi ──────────────────────────────────────
function SliderButton({ label, onConfirm }: { label: string; onConfirm: () => void }) {
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);

  const complete = () => {
    setDragging(false);
    setConfirming(true);
    setTimeout(() => { setConfirmed(true); onConfirm(); }, 800);
  };

  const onStart = (x: number) => { setDragging(true); startX.current = x; };
  const onMove = (x: number) => {
    if (!dragging || !trackRef.current || confirming) return;
    const trackW = trackRef.current.offsetWidth - 56;
    const moved = Math.max(0, Math.min(x - startX.current, trackW));
    const pct = (moved / trackW) * 100;
    setProgress(pct);
    if (pct >= 90) complete();
  };
  const onEnd = () => { if (!confirming) { setDragging(false); setProgress(0); } };

  return (
    <div
      ref={trackRef}
      className="relative h-14 bg-anthracite-800 rounded-full overflow-hidden select-none"
      onMouseMove={(e) => onMove(e.clientX)}
      onMouseUp={onEnd}
      onMouseLeave={onEnd}
      onTouchMove={(e) => onMove(e.touches[0].clientX)}
      onTouchEnd={onEnd}
    >
      {/* barra de progreso */}
      <div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-gold-600 to-gold-400 rounded-full transition-all duration-75"
        style={{ width: `${confirmed ? 100 : progress}%` }}
      />
      {/* texto */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className={`text-sm font-semibold transition-colors ${progress > 40 || confirmed ? 'text-anthracite-950' : 'text-gray-400'}`}>
          {confirmed ? '¡Pago confirmado!' : confirming ? 'Confirmando...' : label}
        </span>
      </div>
      {/* handle */}
      {!confirmed && (
        <motion.div
          className="absolute top-1 bottom-1 w-12 bg-white rounded-full flex items-center justify-center shadow-lg cursor-grab z-10"
          style={{ left: `calc(${progress}% * (100% - 56px) / 100 + 4px)` }}
          onMouseDown={(e) => onStart(e.clientX)}
          onTouchStart={(e) => onStart(e.touches[0].clientX)}
        >
          {confirming ? <Check className="w-5 h-5 text-gold-500" /> : <ArrowRight className="w-5 h-5 text-anthracite-700" />}
        </motion.div>
      )}
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function MechanicPaymentDashboard() {
  const { user } = useAuth();

  const [balance, setBalance] = useState(385000);
  const [justConfirmed, setJustConfirmed] = useState<string | null>(null);
  const [pendingCharge, setPendingCharge] = useState<string | null>(null); // Fix 2: esperando respuesta del cliente

  const [orders, setOrders] = useState<ServiceOrder[]>([
    { id: '1', reference: 'PARCE-2024-00142', client: 'María López',   service: 'Cambio de aceite y filtros', amount: 140000, paymentMethod: 'card', status: 'card_pending',  date: '15 ene · 10:30' },
    { id: '2', reference: 'PARCE-2024-00141', client: 'Pedro Gómez',   service: 'Revisión de frenos',         amount: 95000,  paymentMethod: 'pse',  status: 'pse_paid',      date: '15 ene · 09:00' },
    { id: '3', reference: 'PARCE-2024-00140', client: 'Ana Torres',    service: 'Cambio de batería',          amount: 220000, paymentMethod: 'pse',  status: 'pse_pending',   date: '15 ene · 08:15' },
    { id: '4', reference: 'PARCE-2024-00139', client: 'Luis Martínez', service: 'Diagnóstico general',        amount: 60000,  paymentMethod: 'cash', status: 'cash_pending',  date: '14 ene · 16:45' },
  ]);

  const history: ServiceOrder[] = [
    { id: 'h1', reference: 'PARCE-2024-00138', client: 'Carlos Ruiz',   service: 'Cambio de llantas',      amount: 180000, paymentMethod: 'card', status: 'completed', date: '14 ene · 14:00' },
    { id: 'h2', reference: 'PARCE-2024-00137', client: 'Sandra Díaz',   service: 'Alineación y balanceo',  amount: 75000,  paymentMethod: 'cash', status: 'completed', date: '14 ene · 11:30' },
    { id: 'h3', reference: 'PARCE-2024-00136', client: 'Jorge Vargas',  service: 'Cambio de correa',       amount: 130000, paymentMethod: 'pse',  status: 'completed', date: '13 ene · 15:20' },
  ];

  const confirm = (order: ServiceOrder) => {
    setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status: 'completed' } : o));
    setBalance((prev) => prev + order.amount);
    setJustConfirmed(order.id);
    setTimeout(() => setJustConfirmed(null), 3000);
  };

  // Fix 2: cobro con tarjeta — simula esperar respuesta del cliente
  const requestCardCharge = (order: ServiceOrder) => {
    setPendingCharge(order.id);
    // Simula que el cliente responde después de 4 segundos (en producción sería un websocket)
    setTimeout(() => {
      const accepted = Math.random() > 0.3; // 70% acepta para la demo
      setPendingCharge(null);
      if (accepted) {
        setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status: 'completed' } : o));
        setBalance((prev) => prev + order.amount);
        setJustConfirmed(order.id);
        setTimeout(() => setJustConfirmed(null), 3000);
      } else {
        setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status: 'card_rejected' } : o));
      }
    }, 4000);
  };

  const active = orders.filter((o) => o.status !== 'completed');

  const METHOD_ICON: Record<string, React.ElementType> = { card: CreditCard, pse: Building2, cash: DollarSign };
  const METHOD_LABEL: Record<string, string> = { card: 'Tarjeta', pse: 'PSE', cash: 'Efectivo' };

  const STATUS_CFG: Record<PaymentStatus, { label: string; color: string; bg: string }> = {
    card_pending:   { label: 'Tarjeta guardada',   color: 'text-blue-400',  bg: 'bg-blue-500/10 border-blue-500/30'  },
    pse_paid:       { label: 'PSE pagado',          color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
    pse_pending:    { label: 'PSE pendiente',       color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
    cash_pending:   { label: 'Efectivo pendiente',  color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
    completed:      { label: 'Completado',          color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
    card_rejected:  { label: 'Cobro rechazado',     color: 'text-red-400',   bg: 'bg-red-500/10 border-red-500/30'    },
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar isAuthenticated userName={user?.name || 'Mecánico'} hideNavLinks />
      <Sidebar />

      <main className="ml-64 pt-16 p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8">

          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-white">Panel de Cobros</h1>
            <p className="text-gray-400 mt-1">Gestiona los pagos de tus servicios activos</p>
          </div>

          {/* Saldo */}
          <motion.div key={balance} initial={{ scale: 0.98 }} animate={{ scale: 1 }}
            className="card p-6 bg-gradient-to-br from-gold-600/20 to-anthracite-900/50 border-gold-500/30">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-gray-400 text-sm">Saldo disponible</p>
                <motion.p key={balance} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  className="text-4xl font-bold text-gold-400">{formatCOP(balance)}</motion.p>
                <p className="text-gray-500 text-xs">Se actualiza en tiempo real</p>
              </div>
              <div className="w-16 h-16 rounded-full bg-gold-500/20 flex items-center justify-center">
                <Wallet className="w-8 h-8 text-gold-400" />
              </div>
            </div>
          </motion.div>

          {/* Servicios activos */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Servicios Activos</h2>

            {active.length === 0 && (
              <div className="card p-8 text-center text-gray-500">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500/40" />
                <p>No tienes servicios activos pendientes</p>
              </div>
            )}

            <AnimatePresence>
              {active.map((order) => {
                const st = STATUS_CFG[order.status];
                const MIcon = METHOD_ICON[order.paymentMethod];
                const done = justConfirmed === order.id;

                return (
                  <motion.div key={order.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 60 }}
                    className="card p-6 space-y-4">

                    {/* Cabecera */}
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
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${st.bg} ${st.color}`}>
                        {st.label}
                      </span>
                    </div>

                    {/* Monto y método */}
                    <div className="flex items-center justify-between py-3 border-y border-anthracite-800">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <MIcon className="w-4 h-4" />
                        <span>{METHOD_LABEL[order.paymentMethod]}</span>
                      </div>
                      <span className="text-gold-400 font-bold text-xl">{formatCOP(order.amount)}</span>
                    </div>

                    {/* Alertas informativas */}
                    {order.status === 'card_pending' && (
                      <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <CreditCard className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <p className="text-blue-300 text-sm">El cliente tiene tarjeta guardada. Al presionar <strong>"Finalizar y cobrar"</strong> se realizará el cobro automáticamente.</p>
                      </div>
                    )}
                    {order.status === 'pse_paid' && (
                      <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <p className="text-green-300 text-sm">El pago PSE ya fue recibido. Se acreditará a tu saldo al finalizar el servicio.</p>
                      </div>
                    )}
                    {order.status === 'pse_pending' && (
                      <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                        <p className="text-amber-300 text-sm">Espera la transferencia PSE del cliente. Cuando la recibas, desliza para confirmar.</p>
                      </div>
                    )}
                    {order.status === 'cash_pending' && (
                      <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                        <DollarSign className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                        <p className="text-amber-300 text-sm">Cobra <strong>{formatCOP(order.amount)}</strong> en efectivo al cliente. Luego desliza para confirmar.</p>
                      </div>
                    )}

                    {/* Botón de acción */}
                    <AnimatePresence mode="wait">
                      {done ? (
                        <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center justify-center gap-2 p-3 bg-green-500/20 border border-green-500/30 rounded-xl">
                          <Check className="w-5 h-5 text-green-400" />
                          <span className="text-green-400 font-semibold">¡Pago confirmado! +{formatCOP(order.amount)} acreditado</span>
                        </motion.div>
                      ) : order.status === 'card_rejected' ? (
                        <motion.div key="rejected" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="flex items-center justify-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
                          <span className="text-red-400 font-semibold">El cliente rechazó el cobro</span>
                        </motion.div>
                      ) : order.status === 'card_pending' && pendingCharge === order.id ? (
                        <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="flex items-center justify-center gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                          <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                          <span className="text-blue-300 font-semibold">Esperando respuesta del cliente...</span>
                        </motion.div>
                      ) : order.status === 'card_pending' ? (
                        <motion.button key="card-btn" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                          onClick={() => requestCardCharge(order)}
                          className="w-full btn-primary flex items-center justify-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          Finalizar servicio y cobrar {formatCOP(order.amount)}
                        </motion.button>
                      ) : order.status === 'pse_paid' ? (
                        <motion.button key="pse-paid-btn" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                          onClick={() => confirm(order)}
                          className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                          <Check className="w-4 h-4" />
                          Finalizar servicio
                        </motion.button>
                      ) : (
                        <SliderButton
                          key={`slider-${order.id}`}
                          label={order.status === 'pse_pending' ? 'Desliza para confirmar transferencia PSE' : 'Desliza para confirmar pago en efectivo'}
                          onConfirm={() => confirm(order)}
                        />
                      )}
                    </AnimatePresence>

                    <p className="text-gray-600 text-xs text-right">Ref: {order.reference} · {order.date}</p>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Historial */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" /> Historial de Pagos
            </h2>
            <div className="card divide-y divide-anthracite-800">
              {history.map((item) => {
                const MIcon = METHOD_ICON[item.paymentMethod];
                return (
                  <div key={item.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-green-500/10 flex items-center justify-center">
                        <MIcon className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold">{item.client}</p>
                        <p className="text-gray-500 text-xs">{item.service} · {item.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-bold">+{formatCOP(item.amount)}</p>
                      <p className="text-gray-500 text-xs">{METHOD_LABEL[item.paymentMethod]}</p>
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
