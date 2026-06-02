import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, User, Star, MessageSquare, Navigation, Car, AlertTriangle, CheckCircle, Send, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useService } from '../context/ServiceContext';

// coordenadas reservadas para integración futura con Google Maps

/* ── HOOK PROGRESO — 15 segundos de simulación ── */
function useServiceProgress() {
  const [elapsed, setElapsed] = useState(0);
  const totalSeconds = 15; // 15 segundos de demo
  useEffect(() => {
    if (elapsed >= totalSeconds) return;
    const interval = setInterval(() => setElapsed(p => Math.min(p + 1, totalSeconds)), 1000);
    return () => clearInterval(interval);
  }, [elapsed, totalSeconds]);
  return {
    progress: Math.min((elapsed / totalSeconds) * 100, 100),
    remainingMinutes: Math.max(Math.ceil((totalSeconds - elapsed) / 60), 0),
    remainingSeconds: Math.max(totalSeconds - elapsed, 0),
    arrived: elapsed >= totalSeconds,
  };
}

/* ── MAPA VISUAL ANIMADO (sin API key) ── */
function MapComponent({ progress, arrived, distanceKm, remainingSeconds }:
  { progress: number; arrived: boolean; distanceKm: number; remainingSeconds: number }) {
  const mx = 80 + (320 - 80) * (progress / 100);
  const my = 80 + (220 - 80) * (progress / 100);
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-xl overflow-hidden">
      {/* Grid calles */}
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 300" preserveAspectRatio="none">
        {[40,80,120,160,200,240].map(y=><line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#4a5568" strokeWidth="1"/>)}
        {[50,100,150,200,250,300,350].map(x=><line key={x} x1={x} y1="0" x2={x} y2="300" stroke="#4a5568" strokeWidth="1"/>)}
        <line x1="0" y1="150" x2="400" y2="150" stroke="#6b7280" strokeWidth="2.5"/>
        <line x1="200" y1="0" x2="200" y2="300" stroke="#6b7280" strokeWidth="2.5"/>
      </svg>
      {/* Ruta y marcadores */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300" preserveAspectRatio="none">
        <defs>
          <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d97706" stopOpacity="0.9"/>
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.9"/>
          </linearGradient>
        </defs>
        {/* Línea de ruta */}
        <line x1="80" y1="80" x2="320" y2="220" stroke="url(#routeGrad)" strokeWidth="3" strokeDasharray="8,4"/>
        {/* Mecánico (se mueve) */}
        <circle cx={mx} cy={my} r="9" fill="#d97706" stroke="white" strokeWidth="2.5"/>
        <text x={mx} y={my+1} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="white">🚗</text>
        {/* Usuario */}
        <circle cx="320" cy="220" r="11" fill="#0ea5e9" stroke="white" strokeWidth="2.5"/>
        <circle cx="320" cy="220" r="20" fill="#0ea5e9" fillOpacity="0.2"/>
        <text x="320" y="221" textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="white">📍</text>
      </svg>
      {/* Labels */}
      <div className="absolute top-3 left-3 bg-gold-600/90 backdrop-blur-sm rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
        <Car className="w-3.5 h-3.5 text-white"/><span className="text-white text-xs font-bold">Mecánico</span>
      </div>
      <div className="absolute top-3 right-3 bg-primary-600/90 backdrop-blur-sm rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
        <MapPin className="w-3.5 h-3.5 text-white"/><span className="text-white text-xs font-bold">Tu ubicación</span>
      </div>
      {/* Info overlay */}
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

  const sendChat = () => {
    const t = chatInput.trim(); if (!t) return;
    setChatMsgs(p => [...p, { role: 'user', text: t }]);
    setChatInput('');
    setTimeout(() => setChatMsgs(p => [...p, { role: 'mechanic', text: 'Entendido, en breve llego.' }]), 1200);
  };

  // Cuando el mecánico finaliza → redirigir al usuario a pagos
  useEffect(() => {
    if (serviceFinished) {
      setServiceFinished(false);
      navigate('/payment');
    }
  }, [serviceFinished, setServiceFinished, navigate]);

  const mechanicName = 'María González';
  const mechanicStartLocation = 'Cra. 13 #72-45, Chapinero, Bogotá';
  const plate = 'PDF-345';
  const serviceTitle = selectedService?.title || 'Recarga de Gasolina';
  const serviceDescription = selectedService?.chatbotDiagnosis
    ? `Diagnóstico: ${selectedService.chatbotDiagnosis.replace(/[🔋🔧⛽🔑🚛🌡️🛑💡🔊🛢️⚙️👋😊🤔🤖]/gu, '').trim()}`
    : selectedService?.description || 'El mecánico llegará con el equipo necesario.';

  const progressLabel = arrived ? '¡Mecánico llegó!' : progress < 30 ? 'Mecánico asignado' : progress < 70 ? 'En camino' : 'Llegando...';

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar isAuthenticated userName={user?.name || 'Usuario'} />
      <Sidebar />
      <main className="ml-64 pt-16 p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-6">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-white mb-2">SERVICIO EN CURSO</h1>
            <p className="text-gray-400">Tu mecánico está en camino</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Mapa */}
            <div className="card p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Navegación</h3>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Navigation className="w-4 h-4 text-primary-400"/><span>{DISTANCE_KM} km</span>
                  <span className="text-gray-600">•</span>
                  <Clock className="w-4 h-4 text-primary-400"/>
                  <span>{arrived ? 'Llegó' : `~${remainingSeconds}s`}</span>
                </div>
              </div>
              <div className="flex-1 min-h-[420px]">
                <MapComponent progress={progress} arrived={arrived} distanceKm={DISTANCE_KM} remainingSeconds={remainingSeconds}/>
              </div>
              <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-400">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-purple-500"/><span>Mecánico</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-primary-500"/><span>Tu ubicación</span></div>
              </div>
            </div>

            {/* Info */}
            <div className="card p-6 flex flex-col">
              <h3 className="text-xl font-bold text-white mb-5">Servicio en curso</h3>
              <div className="space-y-4 flex-1">
                  {/* Mecánico + botón contactar */}
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
                  <button
                    onClick={() => setChatOpen(p => !p)}
                    className="flex items-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-600 rounded-xl text-anthracite-950 text-sm font-semibold transition-colors flex-shrink-0">
                    <MessageSquare className="w-4 h-4"/>Contactar
                  </button>
                </div>

                {/* Tiempo restante */}
                <div className="flex items-center gap-3 p-4 bg-dark-800/60 rounded-xl border border-anthracite-800">
                  <Clock className="w-5 h-5 text-primary-400 flex-shrink-0"/>
                  <div><p className="text-xs text-gray-400">Tiempo restante</p>
                    <p className="text-white font-bold text-lg">{arrived ? '¡Llegó!' : `${remainingSeconds}s`}</p></div>
                </div>

                {/* Ubicación mecánico */}
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

                {/* Tipo de servicio */}
                <div className="p-4 bg-gradient-to-br from-primary-600/15 to-purple-600/15 rounded-xl border border-primary-500/25">
                  <h4 className="text-base font-bold text-white mb-1">{serviceTitle}</h4>
                  <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">{serviceDescription}</p>
                </div>

                {/* Barra de progreso */}
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

                {/* Mini chat */}
                <AnimatePresence>
                  {chatOpen && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                      className="border border-anthracite-700 rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2.5 bg-dark-800">
                        <span className="text-sm font-semibold text-white flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-gold-500"/>Chat con {mechanicName}
                        </span>
                        <button onClick={() => setChatOpen(false)} className="text-gray-400 hover:text-white"><X className="w-4 h-4"/></button>
                      </div>
                      <div className="h-36 overflow-y-auto p-3 space-y-2 bg-dark-900/50">
                        {chatMsgs.map((m, i) => (
                          <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`max-w-[80%] px-3 py-1.5 rounded-xl text-xs ${m.role === 'user' ? 'bg-gold-600 text-anthracite-950 rounded-tr-sm' : 'bg-dark-700 text-gray-200 rounded-tl-sm'}`}>{m.text}</div>
                          </div>
                        ))}
                        <div ref={chatEndRef}/>
                      </div>
                      <div className="flex gap-2 p-2 bg-dark-800 border-t border-anthracite-700">
                        <input value={chatInput} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChatInput(e.target.value)}
                          onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && sendChat()}
                          placeholder="Escribe un mensaje..."
                          className="flex-1 bg-dark-900 border border-anthracite-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-gold-500"/>
                        <button onClick={sendChat} disabled={!chatInput.trim()} className="p-1.5 bg-gold-500 hover:bg-gold-600 disabled:opacity-40 rounded-lg">
                          <Send className="w-3.5 h-3.5 text-anthracite-950"/>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Solo botón cancelar, centrado */}
                <div className="pt-2 space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/payment')}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-gold-600 to-gold-500 text-anthracite-950 font-bold rounded-xl shadow-lg hover:shadow-glow-gold transition-all duration-300"
                  >
                    💳 Formas de pago
                  </motion.button>
                  <button onClick={() => setShowCancelModal(true)}
                    className="w-full py-3 bg-dark-700 hover:bg-red-900/40 border border-dark-600 hover:border-red-700 text-gray-300 hover:text-red-300 rounded-xl font-semibold transition-all duration-200">
                    Cancelar servicio
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <AnimatePresence>
        {showCancelModal && <CancelModal onConfirm={() => { setShowCancelModal(false); navigate('/services'); }} onClose={() => setShowCancelModal(false)}/>}
      </AnimatePresence>
    </div>
  );
}
