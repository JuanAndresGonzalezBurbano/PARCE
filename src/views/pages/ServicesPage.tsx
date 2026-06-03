import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Fuel, Battery, Wrench, Clock, ChevronLeft, ChevronRight, MessageCircle, X, Send, Bot, User as UserIcon, Zap, Truck, Key } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useService } from '../context/ServiceContext';

const services = [
  {
    id: 1,
    title: 'Suministro de Combustible a Domicilio',
    description: 'Te quedaste sin gasolina en la vía? Nuestro mecánico llega hasta donde estás con gasolina corriente, extra o ACPM para que puedas continuar tu camino sin necesidad de remolque.',
    duration: '20 – 35 min',
    icon: Fuel,
    gradient: 'from-orange-500 to-red-600',
    emoji: '⛽',
    bgImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  },
  {
    id: 2,
    title: 'Reparación y Cambio de Neumáticos',
    description: 'Llanta pinchada o reventada en plena carretera? Nuestro técnico llega con el equipo necesario para reparar el daño en sitio o instalar el repuesto, dejándote listo para seguir.',
    duration: '25 – 45 min',
    icon: Wrench,
    gradient: 'from-blue-500 to-cyan-600',
    emoji: '🔧',
    bgImage: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&q=80',
  },
  {
    id: 3,
    title: 'Carga y Reemplazo de Batería',
    description: 'Batería descargada o dañada? Te ayudamos con carga rápida mediante cables de arranque o reemplazamos la batería en el lugar. Servicio disponible para autos, camionetas y motos.',
    duration: '15 – 30 min',
    icon: Battery,
    gradient: 'from-yellow-500 to-amber-600',
    emoji: '🔋',
    bgImage: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&q=80',
  },
  {
    id: 4,
    title: 'Diagnóstico y Reparación Mecánica',
    description: 'Ruidos extraños, luces de advertencia encendidas o el motor no arranca? Nuestro mecánico realiza un diagnóstico completo con escáner OBD y repara fallas menores directamente en el lugar.',
    duration: '45 – 90 min',
    icon: Zap,
    gradient: 'from-purple-500 to-violet-600',
    emoji: '🔍',
    bgImage: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80',
  },
  {
    id: 5,
    title: 'Cerrajería Automotriz',
    description: 'Llaves adentro del carro, llave rota en la cerradura o control remoto dañado? Nuestro especialista abre tu vehículo sin daños y puede programar nuevas llaves o controles en el momento.',
    duration: '20 – 40 min',
    icon: Key,
    gradient: 'from-green-500 to-emerald-600',
    emoji: '🔑',
    bgImage: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=600&q=80',
  },
  {
    id: 6,
    title: 'Grúa y Remolque de Vehículos',
    description: 'Accidente, falla grave o vehículo inmovilizado? Enviamos una grúa para transportar tu carro de forma segura al taller de tu preferencia o a un lugar seguro. Disponible 24/7.',
    duration: '30 – 60 min',
    icon: Truck,
    gradient: 'from-red-500 to-rose-600',
    emoji: '🚛',
    bgImage: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&q=80',
  },
];

/* ── CHATBOT ── */
interface ChatMessage { role: 'user' | 'bot'; text: string; }
const PROFANITY = ['mierda','hijueputa','puta','malparido','gonorrea','hp','marica','idiota','imbecil','estupido','pendejo','verga','coño','joder','cabron','perra'];
const hasProfanity = (t: string) => PROFANITY.some(w => t.toLowerCase().includes(w));

function getBotResponse(input: string): string {
  const msg = input.toLowerCase();
  if (/bater[ií]a|descarg|no arranca|no enciende|clic|click/.test(msg))
    return '🔋 Parece un problema de batería. Síntomas típicos: el motor no arranca, escuchas un "clic" al girar la llave, las luces están débiles. Te recomiendo el servicio de Carga y Reemplazo de Batería.';
  if (/llanta|neum[aá]tico|pinch|revent|rueda/.test(msg))
    return '🔧 Problema con una llanta. Si está pinchada o reventada, nuestro técnico llega con equipo para repararla o cambiarla en el lugar. Te recomiendo Reparación y Cambio de Neumáticos.';
  if (/gasolina|combustible|vac[ií]o|sin gas|acpm|diesel/.test(msg))
    return '⛽ Sin combustible en la vía es muy común. Nuestro mecánico puede llevarte gasolina corriente, extra o ACPM. Te recomiendo Suministro de Combustible a Domicilio.';
  if (/llave|cerraj|encerr|bloqu|control remoto/.test(msg))
    return '🔑 Llaves adentro o cerradura bloqueada? Nuestro especialista puede abrir tu vehículo sin daños. Te recomiendo Cerrajería Automotriz.';
  if (/gr[úu]a|remolque|accidente|inmoviliz|taller/.test(msg))
    return '🚛 Si tu vehículo no puede moverse, necesitas una grúa. Te recomiendo el servicio de Grúa y Remolque de Vehículos.';
  if (/recalentar|temperatura|humo|vapor|radiador/.test(msg))
    return '🌡️ El recalentamiento puede dañar el motor. Apaga el motor de inmediato. Te recomiendo Diagnóstico y Reparación Mecánica para revisar el sistema de enfriamiento.';
  if (/freno|frena|chirri|vibra|pedal/.test(msg))
    return '🛑 Problemas con los frenos son emergencia. Detente en lugar seguro. Te recomiendo Diagnóstico y Reparación Mecánica de inmediato.';
  if (/luz|luces|el[eé]ctric|fusible|check engine|tablero/.test(msg))
    return '💡 Problemas eléctricos pueden ser desde un fusible hasta el alternador. Te recomiendo Diagnóstico y Reparación Mecánica con escáner OBD.';
  if (/ruido|sonido|golpe|traqueteo|zumbido/.test(msg))
    return '🔊 Ruidos extraños pueden indicar problemas en suspensión, frenos o motor. Cuéntame más: ¿el ruido es al frenar, al acelerar o constante? Te recomiendo Diagnóstico y Reparación Mecánica.';
  if (/aceite|fuga|goteo|mancha/.test(msg))
    return '🛢️ Una fuga de aceite puede causar daños graves. Detente y llama a un mecánico. Te recomiendo Diagnóstico y Reparación Mecánica.';
  if (/hola|buenos|buenas|hey/.test(msg))
    return '👋 ¡Hola! Soy el asistente de PARCE. Cuéntame qué le está pasando a tu vehículo y te ayudo a identificar el servicio que necesitas.';
  if (/gracias|perfecto|genial/.test(msg))
    return '😊 Con gusto. Puedes pedir cualquier servicio directamente desde esta pantalla. ¿Algo más en lo que pueda ayudarte?';
  if (/no s[eé]|no sabe|ayuda|qu[eé] tiene/.test(msg))
    return '🤔 No te preocupes. Cuéntame los síntomas: ¿hace ruidos? ¿no arranca? ¿hay luces en el tablero? ¿huele a algo? Con eso puedo orientarte mejor.';
  return '🤖 Para darte la mejor recomendación, cuéntame más detalles: ¿qué síntomas presenta el vehículo? Por ejemplo: no arranca, hace ruidos, tiene luces encendidas, perdió potencia, etc.';
}

export default function ServicesPage() {
  const { user } = useAuth();
  const { setSelectedService } = useService();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'bot', text: '👋 ¡Hola! Soy el asistente de PARCE. Si no sabes qué falla tiene tu vehículo, cuéntame los síntomas y te ayudo a identificar el problema.' },
  ]);
  const [inputText, setInputText] = useState('');
  const [lastDiagnosis, setLastDiagnosis] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const itemsPerPage = 3;
  const totalPages = Math.ceil(services.length / itemsPerPage);
  const currentServices = services.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;
    if (hasProfanity(text)) {
      setMessages(prev => [...prev, { role: 'user', text }, { role: 'bot', text: '⚠️ Por favor mantén un lenguaje respetuoso.' }]);
      setInputText(''); return;
    }
    const reply = getBotResponse(text);
    setLastDiagnosis(reply);
    setMessages(prev => [...prev, { role: 'user', text }, { role: 'bot', text: reply }]);
    setInputText('');
  };

  const handleServiceSelect = (service: typeof services[0]) => {
    setSelectedService({ id: service.id, title: service.title, description: service.description, duration: service.duration, chatbotDiagnosis: lastDiagnosis || undefined });
    navigate('/service-in-progress');
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar isAuthenticated userName={user?.name || 'Usuario'} />
      <Sidebar />
      <main className="ml-64 pt-16 p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">SERVICIOS</h1>
            <p className="text-gray-400">Selecciona el servicio que necesitas o consulta con nuestro asistente</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentServices.map((service, index) => (
              <motion.div key={service.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="card overflow-hidden group cursor-pointer hover:ring-2 hover:ring-gold-500 transition-all duration-300">
                {/* Imagen */}
                <div className="relative h-48 overflow-hidden bg-dark-800">
                  <img src={service.bgImage} alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-50`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4">
                    <div className={`w-11 h-11 bg-gradient-to-br ${service.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                      <service.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3 text-2xl">{service.emoji}</div>
                </div>
                {/* Info */}
                <div className="p-5 space-y-3">
                  <h3 className="text-base font-bold text-white leading-snug">{service.title}</h3>
                  <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed">{service.description}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <Clock className="w-4 h-4 text-gold-500" />
                    <span className="text-xs text-gray-400">Tiempo estimado:</span>
                    <span className="text-sm font-bold text-gold-400">{service.duration}</span>
                  </div>
                  <button onClick={() => handleServiceSelect(service)} className="w-full btn-primary mt-2">PEDIR</button>
                </div>
              </motion.div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0}
                className="p-3 bg-dark-800 rounded-lg hover:bg-dark-700 disabled:opacity-50 transition-colors">
                <ChevronLeft className="w-6 h-6 text-gray-400" />
              </button>
              <div className="flex gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button key={i} onClick={() => setCurrentPage(i)}
                    className={`w-3 h-3 rounded-full transition-colors ${currentPage === i ? 'bg-gold-500' : 'bg-dark-700 hover:bg-dark-600'}`} />
                ))}
              </div>
              <button onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))} disabled={currentPage === totalPages - 1}
                className="p-3 bg-dark-800 rounded-lg hover:bg-dark-700 disabled:opacity-50 transition-colors">
                <ChevronRight className="w-6 h-6 text-gray-400" />
              </button>
            </div>
          )}
        </motion.div>
      </main>

      {/* CHATBOT FLOTANTE */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }} transition={{ duration: 0.25 }}
            className="fixed bottom-24 right-6 w-96 max-h-[560px] flex flex-col bg-dark-900 border border-anthracite-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-gold-600 to-gold-500">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-anthracite-950" />
                </div>
                <div>
                  <p className="text-anthracite-950 font-bold text-sm">Asistente PARCE</p>
                  <p className="text-anthracite-800 text-xs">Diagnóstico de vehículos</p>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5 text-anthracite-950" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 max-h-96">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'bot' ? 'bg-gradient-to-br from-gold-500 to-gold-600' : 'bg-dark-600'}`}>
                    {msg.role === 'bot' ? <Bot className="w-4 h-4 text-anthracite-950" /> : <UserIcon className="w-4 h-4 text-white" />}
                  </div>
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'bot' ? 'bg-dark-800 text-gray-200 rounded-tl-sm' : 'bg-gold-600 text-anthracite-950 rounded-tr-sm'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-3 border-t border-anthracite-700">
              <div className="flex gap-2">
                <input type="text" value={inputText} onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Describe el problema de tu vehículo..."
                  className="flex-1 bg-dark-800 border border-anthracite-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors" />
                <button onClick={handleSend} disabled={!inputText.trim()}
                  className="p-2.5 bg-gold-500 hover:bg-gold-600 disabled:opacity-40 rounded-xl transition-colors">
                  <Send className="w-4 h-4 text-anthracite-950" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón flotante */}
      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
        onClick={() => setChatOpen(prev => !prev)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full shadow-2xl flex items-center justify-center z-50">
        <AnimatePresence mode="wait">
          {chatOpen
            ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><X className="w-6 h-6 text-anthracite-950" /></motion.div>
            : <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><MessageCircle className="w-6 h-6 text-anthracite-950" /></motion.div>
          }
        </AnimatePresence>
        {!chatOpen && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">?</span>}
      </motion.button>
    </div>
  );
}
