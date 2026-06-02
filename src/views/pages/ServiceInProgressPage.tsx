import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Clock, User, Star, MessageSquare, Navigation, Car,
  AlertTriangle, CheckCircle, Send, X, CreditCard, DollarSign,
  Building2, Check, ChevronDown, ChevronUp, ArrowRight, ShieldCheck
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../../controllers/AuthContext';
import { useService, PaymentInfo } from '../../controllers/ServiceContext';

/* ── HOOK PROGRESO ── */
function useServiceProgress() {
  const [elapsed, setElapsed] = useState(0);
  const totalSeconds = 15;
  useEffect(() => {
    if (elapsed >= totalSeconds) return;
    const interval = setInterval(() => setElapsed(p => Math.min(p + 1, totalSeconds)), 1000);
    return () => clearInterval(interval);
  }, [elapsed, totalSeconds]);
  return {
    progress: Math.min((elapsed / totalSeconds) * 100, 100),
    remainingSeconds: Math.max(totalSeconds - elapsed, 0),
    arrived: elapsed >= totalSeconds,
  };
}

/* ── MAPA VISUAL ANIMADO ── */
function MapComponent({ progress, arrived, distanceKm, remainingSeconds }:
  { progress: number; arrived: boolean; distanceKm: number; remainingSeconds: number }) {
  const mx = 80 + (320 - 80) * (progress / 100);
  const my = 80 + (220 - 80) * (progress / 100);
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-xl overflow-hidden">
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 300" preserveAspectRatio="none">
        {[40,80,120,160,200,240].map(y=><line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#4a5568" strokeWidth="1"/>)}
        {[50,100,150,200,250,300,350].map(x=><line key={x} x1={x} y1="0" x2={x} y2="300" stroke="#4a5568" strokeWidth="1"/>)}
        <line x1="0" y1="150" x2="400" y2="150" stroke="#6b7280" strokeWidth="2.5"/>
        <line x1="200" y1="0" x2="200" y2="300" stroke="#6b7280" strokeWidth="2.5"/>
      </svg>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300" preserveAspectRatio="none">
        <defs>
          <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d97706" stopOpacity="0.9"/>
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.9"/>
          </linearGradient>
        </defs>
        <line x1="80" y1="80" x2="320" y2="220" stroke="url(#routeGrad)" strokeWidth="3" strokeDasharray="8,4"/>
        <circle cx={mx} cy={my} r="9" fill="#d97706" stroke="white" strokeWidth="2.5"/>
        <text x={mx} y={my+1} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="white">🚗</text>
        <circle cx="320" cy="220" r="11" fill="#0ea5e9" stroke="white" strokeWidth="2.5"/>
        <circle cx="320" cy="220" r="20" fill="#0ea5e9" fillOpacity="0.2"/>
        <text x="320" y="221" textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="white">📍</text>
      </svg>
      <div className="absolute top-3 left-3 bg-gold-600/90 backdrop-blur-sm rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
        <Car className="w-3.5 h-3.5 text-white"/><span className="text-white text-xs font-bold">Mecánico</span>
      </div>
      <div className="absolute top-3 right-3 bg-primary-600/90 backdrop-blur-sm rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
        <MapPin className="w-3.5 h-3.5 text-white"/><span className="text-white text-xs font-bold">Tu ubicación</span>
      </div>
      <div className="absolute bottom-3 left-3 bg-dark-900/90 backdrop-blur-sm rounded-xl p-3 border border-anthracite-700">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-gold-400"/>
          <div>
            <p className="text-white text-sm font-bold">{distanceKm} km</p>
            <p className="text-gray-400 text-xs">{arrived ? '¡Llegó!' : `~${remainingSeconds}s restantes`}</p>
          </div>
        </div>
      </div>
      {arrived && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-950/70 backdrop-blur-sm rounded-xl">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-2"/>
            <p className="text-white font-bold text-lg">¡Mecánico llegó!</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── MODAL CANCELAR ── */
function CancelModal({ onConfirm, onClose }: { onConfirm: () => void; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-dark-950/80 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="card p-8 max-w-sm w-full mx-4 space-y-6 text-center">
        <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-400"/>
        </div>
        <div>
          <h3 className="text-xl font-bold text-white mb-2">¿Cancelar servicio?</h3>
          <p className="text-gray-400 text-sm">¿Estás seguro de que deseas cancelar? El mecánico ya está en camino.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={onClose} className="px-4 py-3 bg-dark-700 hover:bg-dark-600 text-white rounded-xl font-semibold transition-colors">
            Seguir servicio
          </button>
          <button onClick={onConfirm} className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors">
            Cancelar servicio
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── SLIDER DE CONFIRMACIÓN ── */
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
    <div ref={trackRef} className="relative h-12 bg-anthracite-800 rounded-full overflow-hidden select-none"
      onMouseMove={e => onMove(e.clientX)} onMouseUp={onEnd} onMouseLeave={onEnd}
      onTouchMove={e => onMove(e.touches[0].clientX)} onTouchEnd={onEnd}>
      <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-gold-600 to-gold-400 rounded-full transition-all duration-75"
        style={{ width: `${confirmed ? 100 : progress}%` }}/>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className={`text-xs font-semibold ${progress > 40 || confirmed ? 'text-anthracite-950' : 'text-gray-400'}`}>
          {confirmed ? '¡Confirmado!' : confirming ? 'Confirmando...' : label}
        </span>
      </div>
      {!confirmed && (
        <motion.div className="absolute top-1 bottom-1 w-10 bg-white rounded-full flex items-center justify-center shadow-lg cursor-grab z-10"
          style={{ left: `calc(${progress}% * (100% - 48px) / 100 + 4px)` }}
          onMouseDown={e => onStart(e.clientX)} onTouchStart={e => onStart(e.touches[0].clientX)}>
          {confirming ? <Check className="w-4 h-4 text-gold-500"/> : <ArrowRight className="w-4 h-4 text-anthracite-700"/>}
        </motion.div>
      )}
    </div>
  );
}

/* ── MÓDULO DE PAGO DEL USUARIO ── */
function PaymentModule() {
  const { paymentInfo, setPaymentInfo } = useService();
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<'card' | 'pse' | 'cash' | null>(paymentInfo?.method ?? null);
  // Tarjeta
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardSaved, setCardSaved] = useState(!!paymentInfo?.savedCard);

  const saved = paymentInfo?.savedCard;
  const alreadyConfigured = !!paymentInfo;

  const saveCard = () => {
    if (!cardNumber || !cardHolder || !cardExpiry) return;
    const info: PaymentInfo = {
      method: 'card',
      timing: 'on_arrival',    // tarjeta siempre cobra al finalizar el mecánico
      status: 'pending',
      savedCard: { last4: cardNumber.replace(/\s/g, '').slice(-4), holder: cardHolder, expiry: cardExpiry },
      amount: 140000,
    };
    setPaymentInfo(info);
    setCardSaved(true);
  };

  const choosePse = (timing: 'now' | 'on_arrival') => {
    setPaymentInfo({ method: 'pse', timing, status: timing === 'now' ? 'paid' : 'pending', amount: 140000 });
  };

  const chooseCash = () => {
    setPaymentInfo({ method: 'cash', timing: 'on_arrival', status: 'pending', amount: 140000 });
  };

  const statusBadge = () => {
    if (!paymentInfo) return null;
    if (paymentInfo.status === 'paid') return <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full font-semibold">Pagado</span>;
    if (paymentInfo.method === 'card' && paymentInfo.savedCard) return <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full font-semibold">Tarjeta guardada</span>;
    if (paymentInfo.method === 'pse' && paymentInfo.timing === 'on_arrival') return <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full font-semibold">PSE al llegar</span>;
    if (paymentInfo.method === 'cash') return <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full font-semibold">Efectivo al llegar</span>;
    return null;
  };

  return (
    <div className="border border-anthracite-700 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-4 py-3 bg-dark-800/60 hover:bg-dark-700/60 transition-colors">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-gold-400"/>
          <span className="text-white font-semibold text-sm">Forma de pago</span>
          {statusBadge()}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400"/> : <ChevronDown className="w-4 h-4 text-gray-400"/>}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="p-4 space-y-4 bg-dark-900/40">

              {/* Resumen si ya está configurado */}
              {alreadyConfigured && paymentInfo.status === 'paid' && (
                <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0"/>
                  <span className="text-green-400 text-sm font-semibold">Pago PSE realizado. El mecánico fue notificado.</span>
                </div>
              )}

              {/* Selector método (si no está pagado) */}
              {(!alreadyConfigured || paymentInfo?.status !== 'paid') && (
                <>
                  <p className="text-xs text-gray-400">Elige tu método de pago</p>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Tarjeta */}
                    <button onClick={() => setMethod('card')}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${method === 'card' ? 'border-gold-500 bg-gold-500/10' : 'border-anthracite-700 bg-dark-800/50 hover:border-anthracite-600'}`}>
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${method === 'card' ? 'bg-gold-500/20' : 'bg-dark-700'}`}>
                        <CreditCard className={`w-5 h-5 ${method === 'card' ? 'text-gold-400' : 'text-gray-400'}`}/>
                      </div>
                      <span className={`text-xs font-semibold ${method === 'card' ? 'text-gold-400' : 'text-gray-300'}`}>Tarjeta</span>
                    </button>
                    {/* PSE */}
                    <button onClick={() => setMethod('pse')}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${method === 'pse' ? 'border-purple-500 bg-purple-500/10' : 'border-anthracite-700 bg-dark-800/50 hover:border-anthracite-600'}`}>
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${method === 'pse' ? 'bg-purple-500/20' : 'bg-dark-700'}`}>
                        <Building2 className={`w-5 h-5 ${method === 'pse' ? 'text-purple-400' : 'text-gray-400'}`}/>
                      </div>
                      <span className={`text-xs font-semibold ${method === 'pse' ? 'text-purple-400' : 'text-gray-300'}`}>PSE</span>
                    </button>
                    {/* Efectivo */}
                    <button onClick={() => setMethod('cash')}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${method === 'cash' ? 'border-green-500 bg-green-500/10' : 'border-anthracite-700 bg-dark-800/50 hover:border-anthracite-600'}`}>
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${method === 'cash' ? 'bg-green-500/20' : 'bg-dark-700'}`}>
                        <DollarSign className={`w-5 h-5 ${method === 'cash' ? 'text-green-400' : 'text-gray-400'}`}/>
                      </div>
                      <span className={`text-xs font-semibold ${method === 'cash' ? 'text-green-400' : 'text-gray-300'}`}>Efectivo</span>
                    </button>
                  </div>
                </>
              )}

              <AnimatePresence mode="wait">
                {/* ── TARJETA ── */}
                {method === 'card' && (
                  <motion.div key="card" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="space-y-3">
                    {cardSaved && saved ? (
                      <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                        <ShieldCheck className="w-5 h-5 text-blue-400 flex-shrink-0"/>
                        <div>
                          <p className="text-blue-300 text-sm font-semibold">Tarjeta guardada •••• {saved.last4}</p>
                          <p className="text-gray-400 text-xs">{saved.holder} · {saved.expiry}</p>
                          <p className="text-gray-500 text-xs mt-0.5">El mecánico cobrará automáticamente al finalizar el servicio.</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs text-gray-400">La tarjeta se guardará y el cobro se realizará al finalizar el servicio.</p>
                        <input value={cardNumber} onChange={e => setCardNumber(e.target.value)}
                          type="text" placeholder="#### #### #### ####" className="input-field text-sm py-2 w-full"/>
                        <input value={cardHolder} onChange={e => setCardHolder(e.target.value)}
                          type="text" placeholder="Nombre del titular" className="input-field text-sm py-2 w-full"/>
                        <div className="grid grid-cols-2 gap-2">
                          <input value={cardExpiry} onChange={e => setCardExpiry(e.target.value)}
                            type="text" placeholder="MM/AA" className="input-field text-sm py-2"/>
                          <input value={cardCvv} onChange={e => setCardCvv(e.target.value)}
                            type="text" placeholder="CVV" className="input-field text-sm py-2"/>
                        </div>
                        <button onClick={saveCard} disabled={!cardNumber || !cardHolder || !cardExpiry}
                          className="w-full py-2.5 btn-primary text-sm disabled:opacity-40 flex items-center justify-center gap-2">
                          <ShieldCheck className="w-4 h-4"/> Guardar tarjeta
                        </button>
                      </>
                    )}
                  </motion.div>
                )}

                {/* ── PSE ── */}
                {method === 'pse' && paymentInfo?.status !== 'paid' && (
                  <motion.div key="pse" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="space-y-3">
                    <p className="text-xs text-gray-400">¿Cuándo deseas realizar la transferencia PSE?</p>
                    <button onClick={() => choosePse('now')}
                      className="w-full flex items-center gap-3 p-3 bg-purple-500/10 border border-purple-500/30 hover:border-purple-400 rounded-xl transition-colors text-left">
                      <div className="w-9 h-9 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-purple-400"/>
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold">Pagar ahora</p>
                        <p className="text-gray-400 text-xs">Transfiere el pago de inmediato por PSE</p>
                      </div>
                    </button>
                    <button onClick={() => choosePse('on_arrival')}
                      className="w-full flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/30 hover:border-amber-400 rounded-xl transition-colors text-left">
                      <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-amber-400"/>
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold">Pagar cuando llegue el mecánico</p>
                        <p className="text-gray-400 text-xs">El mecánico esperará la transferencia al llegar</p>
                      </div>
                    </button>
                  </motion.div>
                )}

                {/* PSE pagado ahora — slider de confirmación */}
                {method === 'pse' && paymentInfo?.status === 'paid' && (
                  <motion.div key="pse-paid" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0"/>
                    <span className="text-green-400 text-sm font-semibold">Pago PSE realizado. El mecánico fue notificado.</span>
                  </motion.div>
                )}

                {/* ── EFECTIVO ── */}
                {method === 'cash' && !paymentInfo && (
                  <motion.div key="cash" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="space-y-3">
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="text-green-300 text-xs">Ten el monto disponible cuando el mecánico llegue. Él esperará el pago en efectivo al finalizar el servicio.</p>
                    </div>
                    <SliderButton label="Desliza para confirmar pago en efectivo" onConfirm={chooseCash}/>
                  </motion.div>
                )}
                {method === 'cash' && paymentInfo?.method === 'cash' && (
                  <motion.div key="cash-set" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                    <DollarSign className="w-5 h-5 text-amber-400 flex-shrink-0"/>
                    <span className="text-amber-300 text-sm font-semibold">El mecánico cobrará en efectivo al finalizar. Él fue notificado.</span>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── COMPONENTE PRINCIPAL ── */
export default function ServiceInProgressPage() {
  const { user } = useAuth();
  const { selectedService, serviceFinished, setServiceFinished } = useService();
  const navigate = useNavigate();
  const DISTANCE_KM = 3.2;
  const { progress, remainingSeconds, arrived } = useServiceProgress();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsgs, setChatMsgs] = useState<{role:'user'|'mechanic';text:string}[]>([
    { role: 'mechanic', text: 'Hola, ya voy en camino. Estaré contigo pronto.' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMsgs]);

  const PROFANITY = ['mierda','hijueputa','puta','malparido','gonorrea','hp','marica',
    'idiota','imbecil','estupido','pendejo','verga','coño','joder','cabron','perra',
    'bobo','bruto','fuck','shit','bitch','damn','crap','bastard','asshole','dick',
    'retrasado','inutil','maldito','hdp','ptm','ctm','webon','weon','huevon','tonto'];
  const hasProfanity = (t: string) => PROFANITY.some(w => new RegExp(`\\b${w}\\b`, 'i').test(t));
  const sendChat = () => {
    const t = chatInput.trim();
    if (!t) return;
    if (hasProfanity(t)) {
      setChatMsgs(p => [...p, { role: 'user', text: t }, { role: 'mechanic', text: '⚠️ Por favor mantén un lenguaje respetuoso.' }]);
      setChatInput(''); return;
    }
    setChatMsgs(p => [...p, { role: 'user', text: t }]);
    setChatInput('');
    setTimeout(() => setChatMsgs(p => [...p, { role: 'mechanic', text: 'Entendido, en breve llego.' }]), 1200);
  };

  useEffect(() => {
    if (serviceFinished) { setServiceFinished(false); navigate('/services'); }
  }, [serviceFinished, setServiceFinished, navigate]);

  const mechanicName = 'María González';
  const mechanicStartLocation = 'Cra. 13 #72-45, Chapinero, Bogotá';
  const plate = 'PDF-345';
  const serviceTitle = selectedService?.title || 'Suministro de Combustible a Domicilio';
  const serviceDescription = selectedService?.chatbotDiagnosis
    ? `Diagnóstico: ${selectedService.chatbotDiagnosis.replace(/[🔋🔧⛽🔑🚛🌡️🛑💡🔊🛢️⚙️👋😊🤔🤖]/gu, '').trim()}`
    : selectedService?.description || 'El mecánico llegará con el equipo necesario.';
  const progressLabel = arrived ? '¡Mecánico llegó!' : progress < 30 ? 'Mecánico asignado' : progress < 70 ? 'En camino' : 'Llegando...';

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar isAuthenticated userName={user?.name || 'Usuario'} hideNavLinks/>
      <Sidebar hidden/>
      <main className="ml-0 pt-16 p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Servicio en Curso</h1>
              <p className="text-gray-400 text-sm mt-1">Tu mecánico está en camino</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-bold ${arrived ? 'bg-green-500/20 text-green-400' : 'bg-primary-500/20 text-primary-400'}`}>
              {progressLabel}
            </span>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            {/* Mapa */}
            <div className="card p-5 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Navegación</h3>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Navigation className="w-4 h-4 text-primary-400"/><span>{DISTANCE_KM} km</span>
                  <span className="text-gray-600">•</span>
                  <Clock className="w-4 h-4 text-primary-400"/>
                  <span>{arrived ? 'Llegó' : `~${remainingSeconds}s`}</span>
                </div>
              </div>
              <div className="flex-1 min-h-[320px]">
                <MapComponent progress={progress} arrived={arrived} distanceKm={DISTANCE_KM} remainingSeconds={remainingSeconds}/>
              </div>
              <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-400">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-purple-500"/><span>Mecánico</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-primary-500"/><span>Tu ubicación</span></div>
              </div>
            </div>

            {/* Info del servicio */}
            <div className="card p-6 flex flex-col">
              <h3 className="text-xl font-bold text-white mb-5">Servicio en curso</h3>
              <div className="space-y-4 flex-1">
                {/* Mecánico + contactar */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-gold-500 to-gold-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-7 h-7 text-anthracite-950"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-bold text-white">{mechanicName}</h4>
                    <div className="flex items-center gap-1 mt-0.5">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400"/>)}
                      <span className="text-xs text-gray-400 ml-1">(5.0)</span>
                    </div>
                  </div>
                  <button onClick={() => setChatOpen(p => !p)}
                    className="flex items-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-600 rounded-xl text-anthracite-950 text-sm font-semibold transition-colors flex-shrink-0">
                    <MessageSquare className="w-4 h-4"/>Contactar
                  </button>
                </div>
                {/* Tiempo */}
                <div className="flex items-center gap-3 p-4 bg-dark-800/60 rounded-xl border border-anthracite-800">
                  <Clock className="w-5 h-5 text-primary-400 flex-shrink-0"/>
                  <div><p className="text-xs text-gray-400">Tiempo restante</p>
                    <p className="text-white font-bold text-lg">{arrived ? '¡Llegó!' : `${remainingSeconds}s`}</p></div>
                </div>
                {/* Ubicación */}
                <div className="flex items-start gap-3 p-4 bg-dark-800/60 rounded-xl border border-anthracite-800">
                  <MapPin className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5"/>
                  <div><p className="text-xs text-gray-400">Ubicación de inicio del mecánico</p>
                    <p className="text-white font-semibold text-sm">{mechanicStartLocation}</p></div>
                </div>
                {/* Placa */}
                <div className="flex items-center gap-3 p-4 bg-dark-800/60 rounded-xl border border-anthracite-800">
                  <Car className="w-5 h-5 text-primary-400 flex-shrink-0"/>
                  <div><p className="text-xs text-gray-400">Placa del vehículo</p>
                    <p className="text-white font-bold tracking-widest">{plate}</p></div>
                </div>
                {/* Servicio */}
                <div className="p-4 bg-gradient-to-br from-primary-600/15 to-purple-600/15 rounded-xl border border-primary-500/25">
                  <h4 className="text-base font-bold text-white mb-1">{serviceTitle}</h4>
                  <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">{serviceDescription}</p>
                </div>
                {/* Progreso */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Progreso del servicio</span>
                    <span className={`font-semibold ${arrived ? 'text-green-400' : 'text-primary-400'}`}>{progressLabel}</span>
                  </div>
                  <div className="h-3 bg-dark-800 rounded-full overflow-hidden">
                    <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }}
                      className={`h-full rounded-full ${arrived ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-primary-500 to-purple-500'}`}/>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Asignado</span><span>En camino</span><span>Llegó</span>
                  </div>
                </div>

                {/* Cancelar + Módulo de pago */}
                <div className="pt-2 space-y-3">
                  <button onClick={() => setShowCancelModal(true)}
                    className="w-full py-3 bg-dark-700 hover:bg-red-900/40 border border-dark-600 hover:border-red-700 text-gray-300 hover:text-red-300 rounded-xl font-semibold transition-all duration-200">
                    Cancelar servicio
                  </button>
                  <PaymentModule/>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Chat panel */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-dark-900 border-t border-anthracite-700 shadow-2xl">
            <div className="max-w-6xl mx-auto p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-gold-500"/>Chat con {mechanicName}
                </h3>
                <button onClick={() => setChatOpen(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
              </div>
              <div className="h-48 overflow-y-auto space-y-3 p-3 bg-dark-800/50 rounded-xl">
                {chatMsgs.map((m, i) => (
                  <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${m.role === 'user' ? 'bg-gold-500' : 'bg-dark-600'}`}>
                      <User className="w-4 h-4 text-anthracite-950"/>
                    </div>
                    <div className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${m.role === 'user' ? 'bg-gold-600/30 text-white rounded-tr-sm' : 'bg-dark-700 text-gray-200 rounded-tl-sm'}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef}/>
              </div>
              <div className="flex gap-2">
                <input value={chatInput} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChatInput(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && sendChat()}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 bg-dark-800 border border-anthracite-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-500"/>
                <button onClick={sendChat} disabled={!chatInput.trim()} className="p-2.5 bg-gold-500 hover:bg-gold-600 disabled:opacity-40 rounded-xl">
                  <Send className="w-4 h-4 text-anthracite-950"/>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCancelModal && <CancelModal onConfirm={() => { setShowCancelModal(false); navigate('/services'); }} onClose={() => setShowCancelModal(false)}/>}
      </AnimatePresence>
    </div>
  );
}
