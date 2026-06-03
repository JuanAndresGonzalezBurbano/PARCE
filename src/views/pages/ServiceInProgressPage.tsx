import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Clock, User, Star, MessageSquare, Navigation, Car,
  AlertTriangle, CheckCircle, Send, X, CreditCard, DollarSign,
  Building2, Check, ArrowRight, ShieldCheck
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

/* ── MÓDULO DE PAGO DEL USUARIO — Modal fullscreen ── */
const BANKS = [
  'Bancolombia', 'Banco de Bogotá', 'Davivienda', 'BBVA Colombia',
  'Banco Popular', 'Banco de Occidente', 'Colpatria', 'Itaú', 'Nequi', 'Daviplata',
];

function PaymentModule() {
  const { paymentInfo, setPaymentInfo } = useService();
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<'card' | 'pse' | 'cash' | null>(paymentInfo?.method ?? null);
  const [step, setStep] = useState<'select' | 'card-form' | 'card-approve' | 'pse-timing' | 'pse-form' | 'cash-confirm' | 'done'>('select');
  // Tarjeta
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  // PSE
  const [pseTiming, setPseTiming] = useState<'now' | 'on_arrival' | null>(null);
  const [pseBank, setPseBank] = useState('');
  const [pseDocType, setPseDocType] = useState('CC');
  const [pseDoc, setPseDoc] = useState('');
  const [pseName, setPseName] = useState('');
  const [pseEmail, setPseEmail] = useState('');

  const saved = paymentInfo?.savedCard;
  const alreadySet = !!paymentInfo;

  const handleOpen = () => { if (!alreadySet) setStep('select'); setOpen(true); };

  const saveCard = () => {
    if (!cardNumber || !cardHolder || !cardExpiry || !cardCvv) return;
    setPaymentInfo({ method: 'card', timing: 'on_arrival', status: 'pending',
      savedCard: { last4: cardNumber.replace(/\s/g, '').slice(-4), holder: cardHolder, expiry: cardExpiry }, amount: 140000 });
    setStep('done');
  };
  const confirmPse = () => {
    if (!pseBank || !pseDoc || !pseName || !pseEmail) return;
    setPaymentInfo({ method: 'pse', timing: pseTiming!, status: pseTiming === 'now' ? 'paid' : 'pending', amount: 140000 });
    setStep('done');
  };
  const confirmCash = () => {
    setPaymentInfo({ method: 'cash', timing: 'on_arrival', status: 'pending', amount: 140000 });
    setStep('done');
  };

  const badge = () => {
    if (!paymentInfo) return null;
    if (paymentInfo.status === 'paid') return <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full font-semibold">Pagado ✓</span>;
    if (paymentInfo.method === 'card' && paymentInfo.savedCard) return <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full font-semibold">Tarjeta ····{paymentInfo.savedCard.last4}</span>;
    if (paymentInfo.method === 'pse') return <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full font-semibold">PSE{paymentInfo.timing === 'on_arrival' ? ' · Al llegar' : ' · Pagado'}</span>;
    if (paymentInfo.method === 'cash') return <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full font-semibold">Efectivo · Al llegar</span>;
    return null;
  };

  const approveCard = () => {
    setPaymentInfo({ ...paymentInfo!, status: 'paid' });
    setStep('done');
  };

  const backStep = () => {
    if (step === 'card-form' || step === 'pse-timing' || step === 'cash-confirm') setStep('select');
    else if (step === 'card-approve') setStep('card-form');
    else if (step === 'pse-form') setStep('pse-timing');
  };

  return (
    <>
      {/* Botón que abre el modal */}
      <button onClick={handleOpen}
        className="w-full flex items-center justify-between px-4 py-3 bg-dark-800/60 hover:bg-dark-700/60 border border-anthracite-700 rounded-xl transition-colors">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-gold-400"/>
          <span className="text-white font-semibold text-sm">{alreadySet ? 'Forma de pago' : 'Seleccionar forma de pago'}</span>
          {badge()}
        </div>
        <ArrowRight className="w-4 h-4 text-gray-400"/>
      </button>

      {/* Modal fullscreen */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-dark-950 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-anthracite-800 flex-shrink-0">
              <div className="flex items-center gap-3">
                {step !== 'select' && step !== 'done' && (
                  <button onClick={backStep} className="p-2 rounded-lg hover:bg-dark-800 text-gray-400 hover:text-white transition-colors">
                    <ArrowRight className="w-5 h-5 rotate-180"/>
                  </button>
                )}                <h2 className="text-xl font-bold text-white">Forma de pago</h2>
              </div>
              <button onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-dark-800 text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5"/>
              </button>
            </div>
            {/* Contenido */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="max-w-lg mx-auto space-y-6">
                <AnimatePresence mode="wait">

                  {/* SELECCIÓN */}
                  {step === 'select' && (
                    <motion.div key="select" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                      <p className="text-gray-400 text-sm">Elige cómo quieres pagar este servicio</p>
                      <button onClick={() => { setMethod('card'); setStep('card-form'); }}
                        className="w-full flex items-center gap-4 p-5 bg-dark-800 hover:bg-dark-700 border border-anthracite-700 hover:border-gold-500/50 rounded-2xl transition-all text-left">
                        <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center flex-shrink-0"><CreditCard className="w-6 h-6 text-gold-400"/></div>
                        <div><p className="text-white font-semibold">Tarjeta de crédito / débito</p><p className="text-gray-400 text-sm">Se guarda y el mecánico cobra al finalizar</p></div>
                        <ArrowRight className="w-5 h-5 text-gray-500 ml-auto flex-shrink-0"/>
                      </button>
                      <button onClick={() => { setMethod('pse'); setStep('pse-timing'); }}
                        className="w-full flex items-center gap-4 p-5 bg-dark-800 hover:bg-dark-700 border border-anthracite-700 hover:border-purple-500/50 rounded-2xl transition-all text-left">
                        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0"><Building2 className="w-6 h-6 text-purple-400"/></div>
                        <div><p className="text-white font-semibold">PSE — Transferencia bancaria</p><p className="text-gray-400 text-sm">Paga ahora o cuando llegue el mecánico</p></div>
                        <ArrowRight className="w-5 h-5 text-gray-500 ml-auto flex-shrink-0"/>
                      </button>
                      <button onClick={() => { setMethod('cash'); setStep('cash-confirm'); }}
                        className="w-full flex items-center gap-4 p-5 bg-dark-800 hover:bg-dark-700 border border-anthracite-700 hover:border-green-500/50 rounded-2xl transition-all text-left">
                        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0"><DollarSign className="w-6 h-6 text-green-400"/></div>
                        <div><p className="text-white font-semibold">Efectivo</p><p className="text-gray-400 text-sm">Pagas directamente al mecánico al llegar</p></div>
                        <ArrowRight className="w-5 h-5 text-gray-500 ml-auto flex-shrink-0"/>
                      </button>
                    </motion.div>
                  )}

                  {/* TARJETA */}
                  {step === 'card-form' && (
                    <motion.div key="card-form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                      {saved ? (
                        <>
                          {/* Tarjeta guardada — mostrar opciones */}
                          <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl">
                            <ShieldCheck className="w-6 h-6 text-blue-400 flex-shrink-0"/>
                            <div>
                              <p className="text-blue-300 font-semibold">Tarjeta guardada •••• {saved.last4}</p>
                              <p className="text-gray-400 text-sm">{saved.holder} · {saved.expiry}</p>
                            </div>
                          </div>
                          <button onClick={() => setStep('card-approve')}
                            className="w-full flex items-center gap-4 p-4 bg-dark-800 hover:bg-dark-700 border border-anthracite-700 hover:border-gold-500/50 rounded-2xl transition-all text-left">
                            <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center flex-shrink-0">
                              <Check className="w-5 h-5 text-gold-400"/>
                            </div>
                            <div>
                              <p className="text-white font-semibold">Aprobar pago con esta tarjeta</p>
                              <p className="text-gray-400 text-sm">El mecánico cobrará al finalizar el servicio</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-500 ml-auto flex-shrink-0"/>
                          </button>
                          <button onClick={() => {
                            setPaymentInfo(null);
                            setCardNumber(''); setCardHolder(''); setCardExpiry(''); setCardCvv('');
                          }}
                            className="w-full flex items-center gap-4 p-4 bg-dark-800 hover:bg-dark-700 border border-anthracite-700 hover:border-primary-500/50 rounded-2xl transition-all text-left">
                            <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                              <CreditCard className="w-5 h-5 text-primary-400"/>
                            </div>
                            <div>
                              <p className="text-white font-semibold">Agregar otra tarjeta</p>
                              <p className="text-gray-400 text-sm">Reemplaza la tarjeta guardada</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-500 ml-auto flex-shrink-0"/>
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                            <p className="text-blue-300 text-sm">Tu tarjeta se guarda de forma segura. El cobro se realiza solo cuando el mecánico finalice el servicio.</p>
                          </div>
                          <div><label className="text-xs text-gray-400 mb-1.5 block">Número de tarjeta</label>
                            <input value={cardNumber} onChange={e => setCardNumber(e.target.value)} placeholder="#### #### #### ####" className="input-field w-full"/></div>
                          <div><label className="text-xs text-gray-400 mb-1.5 block">Nombre del titular</label>
                            <input value={cardHolder} onChange={e => setCardHolder(e.target.value)} placeholder="Como aparece en la tarjeta" className="input-field w-full"/></div>
                          <div className="grid grid-cols-2 gap-3">
                            <div><label className="text-xs text-gray-400 mb-1.5 block">Vencimiento</label>
                              <input value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} placeholder="MM/AA" className="input-field w-full"/></div>
                            <div><label className="text-xs text-gray-400 mb-1.5 block">CVV</label>
                              <input value={cardCvv} onChange={e => setCardCvv(e.target.value)} placeholder="•••" type="password" className="input-field w-full"/></div>
                          </div>
                          <button onClick={saveCard} disabled={!cardNumber || !cardHolder || !cardExpiry || !cardCvv}
                            className="w-full py-3.5 btn-primary text-base disabled:opacity-40 flex items-center justify-center gap-2 mt-2">
                            <ShieldCheck className="w-5 h-5"/> Guardar tarjeta
                          </button>
                        </>
                      )}
                      <button onClick={backStep} className="w-full py-3 text-gray-400 hover:text-white text-sm transition-colors">← Volver</button>
                    </motion.div>
                  )}

                  {/* APROBAR PAGO CON TARJETA GUARDADA */}
                  {step === 'card-approve' && (
                    <motion.div key="card-approve" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                      <div className="p-5 bg-gold-500/10 border border-gold-500/20 rounded-2xl space-y-3 text-center">
                        <div className="w-14 h-14 rounded-full bg-gold-500/20 flex items-center justify-center mx-auto">
                          <CreditCard className="w-7 h-7 text-gold-400"/>
                        </div>
                        <p className="text-white font-semibold">Aprobar cobro con tarjeta</p>
                        <p className="text-gray-400 text-sm">Se autorizará el cobro a tu tarjeta •••• {saved?.last4} cuando el mecánico finalice el servicio.</p>
                      </div>
                      <SliderButton label="Desliza para autorizar cobro con tarjeta" onConfirm={approveCard}/>
                      <button onClick={backStep} className="w-full py-3 text-gray-400 hover:text-white text-sm transition-colors">← Volver</button>
                    </motion.div>
                  )}

                  {/* PSE TIMING */}
                  {step === 'pse-timing' && (
                    <motion.div key="pse-timing" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                      <p className="text-gray-400 text-sm">¿Cuándo deseas realizar la transferencia PSE?</p>
                      <button onClick={() => { setPseTiming('now'); setStep('pse-form'); }}
                        className="w-full flex items-center gap-4 p-5 bg-dark-800 hover:bg-dark-700 border border-anthracite-700 hover:border-purple-500/50 rounded-2xl transition-all text-left">
                        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0"><Building2 className="w-6 h-6 text-purple-400"/></div>
                        <div><p className="text-white font-semibold">Pagar ahora</p><p className="text-gray-400 text-sm">Transfiere inmediatamente por PSE</p></div>
                        <ArrowRight className="w-5 h-5 text-gray-500 ml-auto flex-shrink-0"/>
                      </button>
                      <button onClick={() => { setPseTiming('on_arrival'); setStep('pse-form'); }}
                        className="w-full flex items-center gap-4 p-5 bg-dark-800 hover:bg-dark-700 border border-anthracite-700 hover:border-amber-500/50 rounded-2xl transition-all text-left">
                        <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0"><Clock className="w-6 h-6 text-amber-400"/></div>
                        <div><p className="text-white font-semibold">Pagar cuando llegue el mecánico</p><p className="text-gray-400 text-sm">El mecánico esperará la transferencia al llegar</p></div>
                        <ArrowRight className="w-5 h-5 text-gray-500 ml-auto flex-shrink-0"/>
                      </button>
                      <button onClick={backStep} className="w-full py-3 text-gray-400 hover:text-white text-sm transition-colors">← Volver</button>
                    </motion.div>
                  )}

                  {/* PSE FORMULARIO */}
                  {step === 'pse-form' && (
                    <motion.div key="pse-form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                      <div className={`p-3 rounded-xl border text-sm font-semibold ${pseTiming === 'now' ? 'bg-purple-500/10 border-purple-500/30 text-purple-300' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'}`}>
                        {pseTiming === 'now' ? '💳 Pagarás ahora por PSE' : '⏳ Pagarás cuando llegue el mecánico por PSE'}
                      </div>
                      <div><label className="text-xs text-gray-400 mb-1.5 block">Banco</label>
                        <select value={pseBank} onChange={e => setPseBank(e.target.value)} className="input-field w-full bg-dark-800">
                          <option value="">Selecciona tu banco</option>
                          {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                        </select></div>
                      <div className="grid grid-cols-3 gap-3">
                        <div><label className="text-xs text-gray-400 mb-1.5 block">Tipo doc.</label>
                          <select value={pseDocType} onChange={e => setPseDocType(e.target.value)} className="input-field w-full bg-dark-800">
                            <option>CC</option><option>CE</option><option>NIT</option><option>PP</option>
                          </select></div>
                        <div className="col-span-2"><label className="text-xs text-gray-400 mb-1.5 block">Número de documento</label>
                          <input value={pseDoc} onChange={e => setPseDoc(e.target.value)} placeholder="1234567890" className="input-field w-full"/></div>
                      </div>
                      <div><label className="text-xs text-gray-400 mb-1.5 block">Nombre completo</label>
                        <input value={pseName} onChange={e => setPseName(e.target.value)} placeholder="Nombre como aparece en la cuenta" className="input-field w-full"/></div>
                      <div><label className="text-xs text-gray-400 mb-1.5 block">Correo electrónico</label>
                        <input value={pseEmail} onChange={e => setPseEmail(e.target.value)} type="email" placeholder="tu@correo.com" className="input-field w-full"/></div>
                      <button onClick={confirmPse} disabled={!pseBank || !pseDoc || !pseName || !pseEmail}
                        className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-40 flex items-center justify-center gap-2 mt-2">
                        <Building2 className="w-5 h-5"/>{pseTiming === 'now' ? 'Confirmar transferencia PSE' : 'Guardar datos PSE'}
                      </button>
                      <button onClick={backStep} className="w-full py-3 text-gray-400 hover:text-white text-sm transition-colors">← Volver</button>
                    </motion.div>
                  )}

                  {/* EFECTIVO */}
                  {step === 'cash-confirm' && (
                    <motion.div key="cash-confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                      <div className="p-5 bg-green-500/10 border border-green-500/20 rounded-2xl space-y-3 text-center">
                        <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mx-auto"><DollarSign className="w-7 h-7 text-green-400"/></div>
                        <p className="text-white font-semibold">Pago en efectivo al llegar</p>
                        <p className="text-gray-400 text-sm">Ten el monto exacto disponible. El mecánico cobrará antes de dar el servicio por finalizado.</p>
                      </div>
                      <SliderButton label="Desliza para confirmar pago en efectivo" onConfirm={confirmCash}/>
                      <button onClick={backStep} className="w-full py-3 text-gray-400 hover:text-white text-sm transition-colors">← Volver</button>
                    </motion.div>
                  )}

                  {/* CONFIRMACIÓN */}
                  {step === 'done' && (
                    <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 text-center py-8">
                      <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                        <Check className="w-10 h-10 text-green-400"/>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                          {paymentInfo?.method === 'card' ? '¡Tarjeta guardada!' : paymentInfo?.status === 'paid' ? '¡Pago PSE realizado!' : paymentInfo?.method === 'pse' ? 'Datos PSE guardados' : '¡Confirmado!'}
                        </h3>
                        <p className="text-gray-400">
                          {paymentInfo?.method === 'card' ? 'El mecánico cobrará automáticamente al finalizar.' : paymentInfo?.status === 'paid' ? 'El mecánico fue notificado del pago.' : paymentInfo?.method === 'pse' ? 'El mecánico sabe que pagarás por PSE al llegar.' : 'El mecánico sabe que pagarás en efectivo al llegar.'}
                        </p>
                      </div>
                      <button onClick={() => setOpen(false)} className="w-full py-3.5 btn-primary text-base">Volver al servicio</button>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
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
