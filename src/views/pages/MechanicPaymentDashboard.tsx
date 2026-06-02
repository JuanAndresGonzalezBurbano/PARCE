import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard, DollarSign, Building2, Check, ArrowRight,
  CheckCircle2, User, Wallet, Clock, Loader2, Info, ShieldCheck
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../../controllers/AuthContext';
import { useService } from '../../controllers/ServiceContext';

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
  paymentTiming?: 'now' | 'on_arrival';
  clientPaidAlready?: boolean;
}

const formatCOP = (val: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);

/* ── Slider de confirmación ── */
function SliderButton({ label, onConfirm }: { label: string; onConfirm: () => void }) {
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const complete = () => { setDragging(false); setConfirming(true); setTimeout(() => { setConfirmed(true); onConfirm(); }, 800); };
  const onStart = (x: number) => { setDragging(true); startX.current = x; };
  const onMove = (x: number) => {
    if (!dragging || !trackRef.current || confirming) return;
    const tw = trackRef.current.offsetWidth - 56;
    const pct = (Math.max(0, Math.min(x - startX.current, tw)) / tw) * 100;
    setProgress(pct);
    if (pct >= 90) complete();
  };
  const onEnd = () => { if (!confirming) { setDragging(false); setProgress(0); } };
  return (
    <div ref={trackRef} className="relative h-14 bg-anthracite-800 rounded-full overflow-hidden select-none"
      onMouseMove={e => onMove(e.clientX)} onMouseUp={onEnd} onMouseLeave={onEnd}
      onTouchMove={e => onMove(e.touches[0].clientX)} onTouchEnd={onEnd}>
      <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-gold-600 to-gold-400 rounded-full transition-all duration-75"
        style={{ width: `${confirmed ? 100 : progress}%` }}/>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className={`text-sm font-semibold ${progress > 40 || confirmed ? 'text-anthracite-950' : 'text-gray-400'}`}>
          {confirmed ? '¡Confirmado!' : confirming ? 'Confirmando...' : label}
        </span>
      </div>
      {!confirmed && (
        <motion.div className="absolute top-1 bottom-1 w-12 bg-white rounded-full flex items-center justify-center shadow-lg cursor-grab z-10"
          style={{ left: `calc(${progress}% * (100% - 56px) / 100 + 4px)` }}
          onMouseDown={e => onStart(e.clientX)} onTouchStart={e => onStart(e.touches[0].clientX)}>
          {confirming ? <Check className="w-5 h-5 text-gold-500"/> : <ArrowRight className="w-5 h-5 text-anthracite-700"/>}
        </motion.div>
      )}
    </div>
  );
}

/* ── Notificación de pago del cliente ── */
function ClientPaymentNotice({ order }: { order: ServiceOrder }) {
  const methodLabel: Record<string, string> = { card: 'Tarjeta de crédito/débito', pse: 'PSE (transferencia bancaria)', cash: 'Efectivo' };
  const MethodIcon = order.paymentMethod === 'card' ? CreditCard : order.paymentMethod === 'pse' ? Building2 : DollarSign;
  const methodColor = order.paymentMethod === 'card' ? 'text-blue-400' : order.paymentMethod === 'pse' ? 'text-purple-400' : 'text-green-400';
  const methodBg = order.paymentMethod === 'card' ? 'bg-blue-500/10 border-blue-500/30' : order.paymentMethod === 'pse' ? 'bg-purple-500/10 border-purple-500/30' : 'bg-green-500/10 border-green-500/30';

  const timingLabel = order.clientPaidAlready ? '✅ El cliente ya pagó' : '⏳ El cliente pagará al llegar';
  const timingColor = order.clientPaidAlready ? 'text-green-400' : 'text-amber-400';

  return (
    <div className={`p-3 rounded-xl border space-y-2 ${methodBg}`}>
      <div className="flex items-center gap-2">
        <Info className="w-4 h-4 text-gray-400 flex-shrink-0"/>
        <span className="text-gray-300 text-xs font-semibold uppercase tracking-wide">Información de pago del cliente</span>
      </div>
      <div className="flex items-center gap-2">
        <MethodIcon className={`w-4 h-4 ${methodColor} flex-shrink-0`}/>
        <span className={`text-sm font-semibold ${methodColor}`}>{methodLabel[order.paymentMethod]}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-semibold ${timingColor}`}>{timingLabel}</span>
      </div>
      {order.paymentMethod === 'card' && !order.clientPaidAlready && (
        <p className="text-gray-400 text-xs">Al finalizar el servicio, pulsa "Cobrar con tarjeta" y el cargo se realizará automáticamente.</p>
      )}
      {order.paymentMethod === 'pse' && !order.clientPaidAlready && (
        <p className="text-gray-400 text-xs">El cliente transferirá por PSE cuando llegues. Espera la confirmación antes de finalizar.</p>
      )}
      {order.paymentMethod === 'pse' && order.clientPaidAlready && (
        <p className="text-gray-400 text-xs">El pago PSE ya fue acreditado. Puedes finalizar el servicio.</p>
      )}
      {order.paymentMethod === 'cash' && (
        <p className="text-gray-400 text-xs">Recuerda cobrar {formatCOP(order.amount)} en efectivo antes de finalizar.</p>
      )}
    </div>
  );
}

/* ── Componente principal ── */
export default function MechanicPaymentDashboard() {
  const { user } = useAuth();
  const { paymentInfo } = useService();

  const [balance, setBalance] = useState(385000);
  const [justConfirmed, setJustConfirmed] = useState<string | null>(null);
  const [pendingCharge, setPendingCharge] = useState<string | null>(null);

  // Orden activa construida a partir del paymentInfo del contexto (cliente actual)
  // + órdenes demo para historial
  const buildActiveOrder = (): ServiceOrder | null => {
    if (!paymentInfo) return null;
    const statusMap: Record<string, PaymentStatus> = {
      'card-now':        'card_pending',
      'card-on_arrival': 'card_pending',
      'pse-now':         'pse_paid',
      'pse-on_arrival':  'pse_pending',
      'cash-on_arrival': 'cash_pending',
    };
    const key = `${paymentInfo.method}-${paymentInfo.timing}`;
    return {
      id: 'current',
      reference: 'PARCE-2025-00001',
      client: 'Cliente actual',
      service: 'Servicio en curso',
      amount: paymentInfo.amount,
      paymentMethod: paymentInfo.method,
      status: statusMap[key] ?? 'cash_pending',
      date: new Date().toLocaleDateString('es-CO'),
      paymentTiming: paymentInfo.timing,
      clientPaidAlready: paymentInfo.status === 'paid',
    };
  };

  const [demoOrders] = useState<ServiceOrder[]>([
    { id: 'd1', reference: 'PARCE-2025-00002', client: 'Pedro Gómez',   service: 'Revisión de frenos',   amount: 95000,  paymentMethod: 'pse',  status: 'pse_pending',  date: '15 ene', paymentTiming: 'on_arrival', clientPaidAlready: false },
    { id: 'd2', reference: 'PARCE-2025-00003', client: 'Ana Torres',    service: 'Cambio de batería',    amount: 220000, paymentMethod: 'card', status: 'card_pending', date: '15 ene', paymentTiming: 'on_arrival', clientPaidAlready: false },
    { id: 'd3', reference: 'PARCE-2025-00004', client: 'Luis Martínez', service: 'Diagnóstico general', amount: 60000,  paymentMethod: 'cash', status: 'cash_pending', date: '14 ene', paymentTiming: 'on_arrival', clientPaidAlready: false },
  ]);
  const [demoOrdersState, setDemoOrdersState] = useState(demoOrders);

  const activeFromContext = buildActiveOrder();
  const allActive: ServiceOrder[] = [
    ...(activeFromContext ? [activeFromContext] : []),
    ...demoOrdersState.filter(o => o.status !== 'completed'),
  ];

  const history: ServiceOrder[] = [
    { id: 'h1', reference: 'PARCE-2025-00098', client: 'Carlos Ruiz',  service: 'Cambio de llantas',     amount: 180000, paymentMethod: 'card', status: 'completed', date: '14 ene' },
    { id: 'h2', reference: 'PARCE-2025-00097', client: 'Sandra Díaz',  service: 'Alineación y balanceo', amount: 75000,  paymentMethod: 'cash', status: 'completed', date: '14 ene' },
    { id: 'h3', reference: 'PARCE-2025-00096', client: 'Jorge Vargas', service: 'Cambio de correa',      amount: 130000, paymentMethod: 'pse',  status: 'completed', date: '13 ene' },
  ];

  const confirm = (order: ServiceOrder) => {
    if (order.id !== 'current') {
      setDemoOrdersState(prev => prev.map(o => o.id === order.id ? { ...o, status: 'completed' } : o));
    }
    setBalance(prev => prev + order.amount);
    setJustConfirmed(order.id);
    setTimeout(() => setJustConfirmed(null), 3000);
  };

  const requestCardCharge = (order: ServiceOrder) => {
    setPendingCharge(order.id);
    setTimeout(() => {
      const accepted = Math.random() > 0.3;
      setPendingCharge(null);
      if (accepted) {
        if (order.id !== 'current') setDemoOrdersState(prev => prev.map(o => o.id === order.id ? { ...o, status: 'completed' } : o));
        setBalance(prev => prev + order.amount);
        setJustConfirmed(order.id);
        setTimeout(() => setJustConfirmed(null), 3000);
      } else {
        if (order.id !== 'current') setDemoOrdersState(prev => prev.map(o => o.id === order.id ? { ...o, status: 'card_rejected' } : o));
      }
    }, 4000);
  };

  const METHOD_ICON: Record<string, React.ElementType> = { card: CreditCard, pse: Building2, cash: DollarSign };
  const METHOD_LABEL: Record<string, string> = { card: 'Tarjeta', pse: 'PSE', cash: 'Efectivo' };
  const STATUS_CFG: Record<PaymentStatus, { label: string; color: string; bg: string }> = {
    card_pending:  { label: 'Cobro con tarjeta', color: 'text-blue-400',  bg: 'bg-blue-500/10 border-blue-500/30'   },
    pse_paid:      { label: 'PSE pagado',         color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30'  },
    pse_pending:   { label: 'PSE pendiente',      color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30'  },
    cash_pending:  { label: 'Efectivo pendiente', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30'  },
    completed:     { label: 'Completado',         color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30'  },
    card_rejected: { label: 'Cobro rechazado',    color: 'text-red-400',   bg: 'bg-red-500/10 border-red-500/30'      },
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar isAuthenticated userName={user?.name || 'Mecánico'} hideNavLinks/>
      <Sidebar/>
      <main className="ml-64 pt-16 p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8">

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
                <Wallet className="w-8 h-8 text-gold-400"/>
              </div>
            </div>
          </motion.div>

          {/* Servicios activos */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Servicios Activos</h2>
            {allActive.length === 0 && (
              <div className="card p-8 text-center text-gray-500">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500/40"/>
                <p>No tienes servicios activos pendientes</p>
              </div>
            )}
            <AnimatePresence>
              {allActive.map((order) => {
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
                          <User className="w-5 h-5 text-gray-400"/>
                        </div>
                        <div>
                          <p className="text-white font-semibold">{order.client}</p>
                          <p className="text-gray-400 text-sm">{order.service}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${st.bg} ${st.color}`}>{st.label}</span>
                    </div>

                    {/* Monto y método */}
                    <div className="flex items-center justify-between py-3 border-y border-anthracite-800">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <MIcon className="w-4 h-4"/>
                        <span>{METHOD_LABEL[order.paymentMethod]}</span>
                        {order.clientPaidAlready && (
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full font-semibold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3"/> Ya pagó
                          </span>
                        )}
                      </div>
                      <span className="text-gold-400 font-bold text-xl">{formatCOP(order.amount)}</span>
                    </div>

                    {/* Notificación del método elegido por el cliente */}
                    <ClientPaymentNotice order={order}/>

                    {/* Acción */}
                    <AnimatePresence mode="wait">
                      {done ? (
                        <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center justify-center gap-2 p-3 bg-green-500/20 border border-green-500/30 rounded-xl">
                          <Check className="w-5 h-5 text-green-400"/>
                          <span className="text-green-400 font-semibold">¡Cobro completado! +{formatCOP(order.amount)} acreditado</span>
                        </motion.div>
                      ) : order.status === 'card_rejected' ? (
                        <motion.div key="rejected" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="flex items-center justify-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
                          <span className="text-red-400 font-semibold">El cliente rechazó el cobro con tarjeta</span>
                        </motion.div>
                      ) : order.status === 'card_pending' && pendingCharge === order.id ? (
                        <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="flex items-center justify-center gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                          <Loader2 className="w-5 h-5 text-blue-400 animate-spin"/>
                          <span className="text-blue-300 font-semibold">Procesando cobro con tarjeta...</span>
                        </motion.div>
                      ) : order.status === 'card_pending' ? (
                        <motion.button key="card-btn" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                          onClick={() => requestCardCharge(order)}
                          className="w-full btn-primary flex items-center justify-center gap-2">
                          <CreditCard className="w-4 h-4"/>
                          Finalizar servicio y cobrar {formatCOP(order.amount)}
                        </motion.button>
                      ) : order.status === 'pse_paid' ? (
                        <motion.button key="pse-paid-btn" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                          onClick={() => confirm(order)}
                          className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                          <Check className="w-4 h-4"/> Finalizar servicio (PSE ya cobrado)
                        </motion.button>
                      ) : (
                        <SliderButton
                          key={`slider-${order.id}`}
                          label={order.status === 'pse_pending' ? 'Desliza al recibir la transferencia PSE' : 'Desliza para confirmar cobro en efectivo'}
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
              <Clock className="w-5 h-5 text-gray-400"/> Historial de Pagos
            </h2>
            <div className="card divide-y divide-anthracite-800">
              {history.map((item) => {
                const MIcon = METHOD_ICON[item.paymentMethod];
                return (
                  <div key={item.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-green-500/10 flex items-center justify-center">
                        <MIcon className="w-4 h-4 text-green-400"/>
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
