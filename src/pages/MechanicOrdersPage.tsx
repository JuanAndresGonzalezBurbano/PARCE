import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, MapPin, Clock, User, Navigation,
  MessageSquare, Send, AlertTriangle, CheckCircle, Car, Bot
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useService } from '../context/ServiceContext';
import { useNavigate } from 'react-router-dom';

interface Order {
  id: number; clientName: string; clientPhone: string;
  service: string; serviceDescription: string; chatbotDiagnosis?: string;
  location: string; time: string; distance: number;
  status: 'pending' | 'accepted' | 'rejected';
}
interface ChatMsg { role: 'mechanic' | 'client'; text: string; }

const PROFANITY = ['mierda','hijueputa','puta','malparido','gonorrea','hp','marica',
  'idiota','imbecil','estupido','pendejo','verga','coño','joder','cabron','perra'];
const hasProfanity = (t: string) => PROFANITY.some(w => t.toLowerCase().includes(w));

const INITIAL_ORDERS: Order[] = [
  { id: 1, clientName: 'Carlos Rodríguez', clientPhone: '+57 300 123 4567',
    service: 'Carga y Reemplazo de Batería',
    serviceDescription: 'El vehículo no arranca. Se escucha un clic al girar la llave.',
    chatbotDiagnosis: 'Batería descargada o defectuosa. Llevar cables de arranque y batería de repuesto.',
    location: 'Calle 72 #10-34, Chapinero, Bogotá', time: 'Hace 5 minutos', distance: 2.5, status: 'pending' },
  { id: 2, clientName: 'María González', clientPhone: '+57 301 987 6543',
    service: 'Reparación y Cambio de Neumáticos',
    serviceDescription: 'Llanta trasera derecha completamente pinchada.',
    location: 'Av. Caracas #45-67, Teusaquillo, Bogotá', time: 'Hace 12 minutos', distance: 4.2, status: 'pending' },
  { id: 3, clientName: 'Juan Pérez', clientPhone: '+57 310 456 7890',
    service: 'Suministro de Combustible a Domicilio',
    serviceDescription: 'Se quedó sin gasolina. Necesita gasolina corriente.',
    location: 'Calle 100 #15-20, Usaquén, Bogotá', time: 'Hace 18 minutos', distance: 6.8, status: 'pending' },
];

// API key reservada para integración futura con Google Maps
const _GMAPS_KEY = 'AIzaSyD-PLACEHOLDER';

function useProgress(totalSec: number, active: boolean) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!active || elapsed >= totalSec) return;
    const t = setInterval(() => setElapsed(p => Math.min(p + 1, totalSec)), 1000);
    return () => clearInterval(t);
  }, [active, elapsed, totalSec]);
  return {
    progress: Math.min((elapsed / totalSec) * 100, 100),
    remaining: Math.max(totalSec - elapsed, 0),
    arrived: elapsed >= totalSec,
  };
}

declare global { interface Window { google: any; } }

function MechanicMap({ progress, arrived, distanceKm, remainingMin }:
  { progress: number; arrived: boolean; distanceKm: number; remainingMin: number }) {
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
          <linearGradient id="rg3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d97706" stopOpacity="0.9"/>
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.9"/>
          </linearGradient>
        </defs>
        <line x1="80" y1="80" x2="320" y2="220" stroke="url(#rg3)" strokeWidth="3" strokeDasharray="8,4"/>
        <circle cx={mx} cy={my} r="9" fill="#d97706" stroke="white" strokeWidth="2.5"/>
        <text x={mx} y={my+1} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="white">🚗</text>
        <circle cx="320" cy="220" r="11" fill="#0ea5e9" stroke="white" strokeWidth="2.5"/>
        <circle cx="320" cy="220" r="20" fill="#0ea5e9" fillOpacity="0.2"/>
        <text x="320" y="221" textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="white">📍</text>
      </svg>
      <div className="absolute top-3 left-3 bg-gold-600/90 backdrop-blur-sm rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
        <Car className="w-3.5 h-3.5 text-white"/><span className="text-white text-xs font-bold">Tú</span>
      </div>
      <div className="absolute top-3 right-3 bg-primary-600/90 backdrop-blur-sm rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
        <MapPin className="w-3.5 h-3.5 text-white"/><span className="text-white text-xs font-bold">Cliente</span>
      </div>
      <div className="absolute bottom-3 left-3 bg-dark-900/90 backdrop-blur-sm rounded-xl p-2.5 border border-anthracite-700">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-gold-400"/>
          <div>
            <p className="text-white text-xs font-bold">{distanceKm} km</p>
            <p className="text-gray-400 text-xs">{arrived ? '¡Llegaste!' : `~${remainingMin}s`}</p>
          </div>
        </div>
      </div>
      {arrived && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-950/70 backdrop-blur-sm rounded-xl">
          <div className="text-center">
            <CheckCircle className="w-14 h-14 text-green-400 mx-auto mb-2"/>
            <p className="text-white font-bold">¡Llegaste al cliente!</p>
          </div>
        </div>
      )}
    </div>
  );
}

function CancelModal({ onConfirm, onClose }: { onConfirm: ()=>void; onClose: ()=>void }) {
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-50 flex items-center justify-center bg-dark-950/80 backdrop-blur-sm">
      <motion.div initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.9,opacity:0}}
        className="card p-8 max-w-sm w-full mx-4 space-y-6 text-center">
        <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-400"/></div>
        <div><h3 className="text-xl font-bold text-white mb-2">¿Cancelar servicio?</h3>
          <p className="text-gray-400 text-sm">¿Estás seguro? El cliente está esperando.</p></div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={onClose} className="px-4 py-3 bg-dark-700 hover:bg-dark-600 text-white rounded-xl font-semibold transition-colors">Seguir servicio</button>
          <button onClick={onConfirm} className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors">Cancelar servicio</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ActiveServiceView({ order, onCancel, onFinish }:
  { order: Order; onCancel: ()=>void; onFinish: ()=>void }) {
  const { progress, remaining, arrived } = useProgress(15, true); // 15 segundos
  const DIST = order.distance;
  const [showCancel, setShowCancel] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    { role: 'client', text: `Hola, soy ${order.clientName}. Estoy esperando tu llegada.` },
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const sendMsg = () => {
    const t = input.trim(); if (!t) return;
    if (hasProfanity(t)) {
      setMsgs(p => [...p, {role:'mechanic' as const,text:t}, {role:'client' as const,text:'⚠️ Por favor usa un lenguaje respetuoso.'}]);
      setInput(''); return;
    }
    setMsgs(p => [...p, {role:'mechanic' as const,text:t}]); setInput('');
    setTimeout(() => setMsgs(p => [...p, {role:'client' as const,text:'Entendido, te espero aquí. ¡Gracias!'}]), 1500);
  };

  const label = arrived ? '¡Llegaste!' : progress < 30 ? 'Iniciando ruta' : progress < 70 ? 'En camino' : 'Llegando...';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold text-white">Servicio en Curso</h1>
          <p className="text-gray-400 text-sm mt-1">Dirígete hacia el cliente</p></div>
        <span className={`px-4 py-2 rounded-full text-sm font-bold ${arrived ? 'bg-green-500/20 text-green-400' : 'bg-primary-500/20 text-primary-400'}`}>{label}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-white">Navegación</h3>
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <span className="flex items-center gap-1"><Navigation className="w-3.5 h-3.5 text-primary-400"/>{DIST} km</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-primary-400"/>{arrived ? 'Llegaste' : `~${remaining} min`}</span>
            </div>
          </div>
          <div className="flex-1 min-h-[380px]">
            <MechanicMap progress={progress} arrived={arrived} distanceKm={DIST} remainingMin={remaining}/>
          </div>
        </div>

        <div className="card p-5 flex flex-col space-y-4">
          <h3 className="text-lg font-bold text-white">Detalles del servicio</h3>
          <div className="flex items-center gap-3 p-3 bg-dark-800/60 rounded-xl border border-anthracite-800">
            <div className="w-10 h-10 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-anthracite-950"/></div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm">{order.clientName}</p>
              <p className="text-gray-400 text-xs">{order.clientPhone}</p></div>
            <button onClick={() => setChatOpen(p=>!p)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gold-500 hover:bg-gold-600 rounded-lg text-anthracite-950 text-xs font-semibold transition-colors">
              <MessageSquare className="w-3.5 h-3.5"/>Contactar</button>
          </div>

          <div className="p-4 bg-gradient-to-br from-primary-600/15 to-purple-600/15 rounded-xl border border-primary-500/25">
            <h4 className="text-sm font-bold text-white mb-2">{order.service}</h4>
            {order.chatbotDiagnosis
              ? <div className="flex items-start gap-2"><Bot className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5"/>
                  <div><p className="text-purple-300 text-xs font-semibold mb-0.5">Diagnóstico del asistente:</p>
                    <p className="text-purple-200 text-xs leading-relaxed">{order.chatbotDiagnosis}</p></div></div>
              : <p className="text-gray-300 text-xs leading-relaxed">{order.serviceDescription}</p>}
          </div>

          <div className="flex items-start gap-2 p-3 bg-dark-800/60 rounded-xl border border-anthracite-800">
            <MapPin className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5"/>
            <div><p className="text-xs text-gray-400">Ubicación del cliente</p>
              <p className="text-white text-sm font-semibold">{order.location}</p></div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Progreso</span>
              <span className={`font-bold ${arrived ? 'text-green-400' : 'text-primary-400'}`}>{label}</span>
            </div>
            <div className="h-3 bg-dark-800 rounded-full overflow-hidden">
              <motion.div animate={{width:`${progress}%`}} transition={{duration:0.5}}
                className={`h-full rounded-full ${arrived ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-primary-500 to-purple-500'}`}/>
            </div>
            <div className="flex justify-between text-xs text-gray-500"><span>Inicio</span><span>En camino</span><span>Llegó</span></div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button onClick={() => setShowCancel(true)}
              className="py-3 bg-dark-700 hover:bg-red-900/40 border border-dark-600 hover:border-red-700 text-gray-300 hover:text-red-300 rounded-xl font-semibold transition-all text-sm">
              Cancelar</button>
            <button onClick={arrived ? onFinish : undefined} disabled={!arrived}
              className={`py-3 rounded-xl font-semibold text-sm transition-all ${arrived ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-dark-700 text-gray-600 cursor-not-allowed border border-dark-600'}`}>
              {arrived ? 'Finalizar servicio' : `Finalizar (${remaining} min)`}</button>
          </div>
          {!arrived && <p className="text-xs text-gray-500 text-center">El botón se habilita cuando llegues al cliente</p>}
        </div>
      </div>

      <AnimatePresence>
        {chatOpen && (
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:20}} className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2"><MessageSquare className="w-5 h-5 text-primary-400"/>Chat con {order.clientName}</h3>
              <button onClick={() => setChatOpen(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            <div className="h-48 overflow-y-auto space-y-3 p-3 bg-dark-800/50 rounded-xl">
              {msgs.map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.role==='mechanic' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${m.role==='mechanic' ? 'bg-gold-500' : 'bg-dark-600'}`}>
                    <User className="w-4 h-4 text-anthracite-950"/></div>
                  <div className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${m.role==='mechanic' ? 'bg-gold-600/30 text-white rounded-tr-sm' : 'bg-dark-700 text-gray-200 rounded-tl-sm'}`}>{m.text}</div>
                </div>
              ))}
              <div ref={endRef}/>
            </div>
            <div className="flex gap-2">
              <input value={input} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent) => e.key==='Enter' && sendMsg()}
                placeholder="Escribe un mensaje..."
                className="flex-1 bg-dark-800 border border-anthracite-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"/>
              <button onClick={sendMsg} disabled={!input.trim()} className="p-2.5 bg-gold-500 hover:bg-gold-600 disabled:opacity-40 rounded-xl">
                <Send className="w-4 h-4 text-anthracite-950"/></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>{showCancel && <CancelModal onConfirm={onCancel} onClose={() => setShowCancel(false)}/>}</AnimatePresence>
    </div>
  );
}

export default function MechanicOrdersPage() {
  const { user } = useAuth();
  const { setServiceFinished } = useService();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  const calculatePrice = (d: number) => 15000 + d * 3000;

  const handleAccept = (id: number) => {
    const order = orders.find(o => o.id === id);
    if (order) {
      setOrders(prev => prev.map(o => o.id === id ? {...o, status: 'accepted' as const} : o));
      setActiveOrder(order);
    }
  };
  const handleReject = (id: number) => setOrders(prev => prev.map(o => o.id === id ? {...o, status: 'rejected' as const} : o));
  const handleCancel = () => { setOrders(INITIAL_ORDERS); setActiveOrder(null); };

  // Al finalizar: notifica al usuario (ServiceContext) y vuelve a solicitudes
  const handleFinish = () => {
    setServiceFinished(true);   // → ServiceInProgressPage detecta esto y redirige a /payment
    setActiveOrder(null);
    setOrders(INITIAL_ORDERS);
    navigate('/mechanic-orders');
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar isAuthenticated userName={user?.name || 'Mecánico'} hideNavLinks />
      <Sidebar hidden={!!activeOrder} />
      <main className={`${activeOrder ? 'ml-0' : 'ml-64'} pt-16 p-8`}>
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="space-y-6">
          {activeOrder ? (
            <ActiveServiceView order={activeOrder} onCancel={handleCancel} onFinish={handleFinish}/>
          ) : (
            <>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Solicitudes de Servicio</h1>
                <p className="text-gray-400">Acepta o rechaza las solicitudes cercanas a ti</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card p-5 flex items-center justify-between">
                  <div><p className="text-gray-400 text-sm">Solicitudes Pendientes</p>
                    <p className="text-4xl font-bold text-white mt-1">{pendingOrders.length}</p></div>
                  <Clock className="w-10 h-10 text-yellow-500"/>
                </div>
                <div className="card p-5 flex items-center justify-between">
                  <div><p className="text-gray-400 text-sm">Radio de atención</p>
                    <p className="text-4xl font-bold text-white mt-1">10 km</p></div>
                  <Navigation className="w-10 h-10 text-primary-500"/>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white">Solicitudes Pendientes</h2>
                {pendingOrders.length === 0 ? (
                  <div className="card p-10 text-center">
                    <Clock className="w-14 h-14 mx-auto text-gray-600 mb-3"/>
                    <p className="text-gray-400">No hay solicitudes pendientes</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingOrders.map(order => (
                      <motion.div key={order.id} initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} className="card p-6">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="text-xl font-bold text-white">{order.service}</h3>
                              <span className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm font-bold">{order.distance} km</span>
                            </div>
                            <p className="text-xs text-gray-500">{order.time}</p>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-gray-300"><User className="w-4 h-4 text-gray-500"/><span className="text-sm">{order.clientName}</span></div>
                              <div className="flex items-start gap-2 text-gray-300"><MapPin className="w-4 h-4 text-gray-500 mt-0.5"/><span className="text-sm">{order.location}</span></div>
                            </div>
                            <div className="p-3 bg-dark-800/60 rounded-xl border border-anthracite-800">
                              {order.chatbotDiagnosis
                                ? <div className="flex items-start gap-2"><Bot className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5"/>
                                    <div><p className="text-purple-300 text-xs font-semibold mb-0.5">Diagnóstico:</p>
                                      <p className="text-purple-200 text-xs">{order.chatbotDiagnosis}</p></div></div>
                                : <p className="text-gray-400 text-xs">{order.serviceDescription}</p>}
                            </div>
                            <div className="pt-1 border-t border-anthracite-700">
                              <p className="text-xs text-gray-400">Precio estimado</p>
                              <p className="text-xl font-bold text-yellow-400">${calculatePrice(order.distance).toLocaleString('es-CO')} COP</p>
                            </div>
                          </div>
                          <div className="flex lg:flex-col gap-3">
                            <button onClick={() => handleAccept(order.id)}
                              className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors flex-1 lg:flex-initial">
                              <CheckCircle className="w-5 h-5"/>Aceptar</button>
                            <button onClick={() => handleReject(order.id)}
                              className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors flex-1 lg:flex-initial">
                              <X className="w-5 h-5"/>Rechazar</button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}
