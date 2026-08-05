import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, User, Star, MessageSquare, Navigation, Car, AlertTriangle, CheckCircle, Send, X, CreditCard } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ProfileModal from '../components/ProfileModal';
import LiveTrackingMap from '../components/LiveTrackingMap';
import { useAuth } from '../../controllers/AuthContext';
import { useService } from '../../controllers/ServiceContext';

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
  
  // Coordenadas de ejemplo (Bogotá)
  const MECHANIC_START_LAT = 4.6756;  // Chapinero
  const MECHANIC_START_LNG = -74.0513;
  const USER_LAT = 4.7110;  // Zona norte
  const USER_LNG = -74.0721;

  const { progress, remainingSeconds, arrived } = useServiceProgress();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsgs, setChatMsgs] = useState<{role:'user'|'mechanic';text:string}[]>([
    { role: 'mechanic', text: 'Hola, ya voy en camino. Estaré contigo pronto.' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [showMechanicProfile, setShowMechanicProfile] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMsgs]);

  // RAMA: Soto - Filtro de groserías para el chat del usuario
  const PROFANITY = ['mierda','hijueputa','puta','malparido','gonorrea','hp','marica',
    'idiota','imbecil','estupido','pendejo','verga','coño','joder','cabron','perra',
    'bobo','bruto','fuck','shit','bitch','damn','crap','bastard','asshole','dick',
    'retrasado','inutil','maldito','hdp','ptm','ctm','webon','weon','huevon','tonto',
  ];
  const hasProfanity = (t: string) =>
    PROFANITY.some(w => new RegExp(`\\b${w}\\b`, 'i').test(t));

  const sendChat = () => {
    const t = chatInput.trim();
    if (!t) return;
    // Bloquea groserías y muestra aviso
    if (hasProfanity(t)) {
      setChatMsgs(p => [...p,
        { role: 'user', text: t },
        { role: 'mechanic', text: '⚠️ Por favor mantén un lenguaje respetuoso. Las groserías no están permitidas en este chat.' }
      ]);
      setChatInput('');
      return;
    }
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

  // Datos del perfil del mecánico
  const mechanicProfile = {
    name: mechanicName,
    role: 'mechanic' as const,
    phone: '+57 301 234 5678',
    email: 'maria.gonzalez@parce.com',
    rating: 5.0,
    totalServices: 247,
    joinedDate: 'Enero 2024',
    location: mechanicStartLocation,
    specialties: ['Batería', 'Neumáticos', 'Diagnóstico Eléctrico', 'Suministro de Combustible'],
  };

  const progressLabel = arrived ? '¡Mecánico llegó!' : progress < 30 ? 'Mecánico asignado' : progress < 70 ? 'En camino' : 'Llegando...';

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar isAuthenticated userName={user?.name || 'Usuario'} hideNavLinks />
      {/* RAMA: Soto - Sidebar oculto en servicio en curso, igual que la vista del mecánico */}
      <Sidebar hidden />
      <main className="ml-0 pt-16 p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* RAMA: Soto - Título con estado igual al del mecánico */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Servicio en Curso</h1>
              <p className="text-gray-400 text-sm mt-1">Tu mecánico está en camino</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-bold ${arrived ? 'bg-green-500/20 text-green-400' : 'bg-primary-500/20 text-primary-400'}`}>
              {arrived ? '¡Llegó!' : progress < 30 ? 'Mecánico asignado' : progress < 70 ? 'En camino' : 'Llegando...'}
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
                <LiveTrackingMap
                  mechanicStartLat={MECHANIC_START_LAT}
                  mechanicStartLng={MECHANIC_START_LNG}
                  userLat={USER_LAT}
                  userLng={USER_LNG}
                  progress={progress}
                  arrived={arrived}
                  distanceKm={DISTANCE_KM}
                  remainingSeconds={remainingSeconds}
                />
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
                  {/* Mecánico + botón perfil y contactar */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowMechanicProfile(true)}
                    className="w-14 h-14 bg-gradient-to-br from-gold-500 to-gold-700 rounded-full flex items-center justify-center flex-shrink-0 hover:shadow-glow-gold transition-shadow cursor-pointer"
                  >
                    <User className="w-7 h-7 text-anthracite-950"/>
                  </button>
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => setShowMechanicProfile(true)}
                      className="text-lg font-bold text-white hover:text-gold-400 transition-colors text-left"
                    >
                      {mechanicName}
                    </button>
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

                {/* Mini chat — eliminado de aquí, ahora es panel inferior */}

                {/* Botones de acción */}
                <div className="pt-2 space-y-3">
                  {/* Botón cancelar servicio */}
                  <button onClick={() => setShowCancelModal(true)}
                    className="w-full py-3 bg-dark-700 hover:bg-red-900/40 border border-dark-600 hover:border-red-700 text-gray-300 hover:text-red-300 rounded-xl font-semibold transition-all duration-200">
                    Cancelar servicio
                  </button>
                  
                  {/* Botón seleccionar forma de pago */}
                  <button
                    onClick={() => navigate('/payment')}
                    className="w-full py-3 bg-gold-600 hover:bg-gold-700 text-anthracite-950 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-5 h-5" />
                    Seleccionar forma de pago
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* RAMA: Soto - Chat desplegable en panel inferior, igual al del mecánico */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-dark-900 border-t border-anthracite-700 shadow-2xl"
          >
            <div className="max-w-6xl mx-auto p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-gold-500" />
                  Chat con {mechanicName}
                </h3>
                <button onClick={() => setChatOpen(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="h-48 overflow-y-auto space-y-3 p-3 bg-dark-800/50 rounded-xl">
                {chatMsgs.map((m, i) => (
                  <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${m.role === 'user' ? 'bg-gold-500' : 'bg-dark-600'}`}>
                      <User className="w-4 h-4 text-anthracite-950" />
                    </div>
                    <div className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${m.role === 'user' ? 'bg-gold-600/30 text-white rounded-tr-sm' : 'bg-dark-700 text-gray-200 rounded-tl-sm'}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="flex gap-2">
                <input
                  value={chatInput}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChatInput(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && sendChat()}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 bg-dark-800 border border-anthracite-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-500"
                />
                <button onClick={sendChat} disabled={!chatInput.trim()} className="p-2.5 bg-gold-500 hover:bg-gold-600 disabled:opacity-40 rounded-xl">
                  <Send className="w-4 h-4 text-anthracite-950" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCancelModal && <CancelModal onConfirm={() => { setShowCancelModal(false); navigate('/services'); }} onClose={() => setShowCancelModal(false)}/>}
      </AnimatePresence>

      {/* Modal de perfil del mecánico */}
      <ProfileModal
        isOpen={showMechanicProfile}
        onClose={() => setShowMechanicProfile(false)}
        profile={mechanicProfile}
      />
    </div>
  );
}
