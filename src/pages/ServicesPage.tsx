import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Fuel, Battery, Wrench, Car, Clock, ChevronLeft, ChevronRight,
  MessageCircle, X, Send, Bot, User as UserIcon, Zap, Truck, Key
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useService } from '../context/ServiceContext';

/* ─────────────────────────────────────────────
   DATOS DE SERVICIOS
───────────────────────────────────────────── */
const services = [
  {
    id: 1,
    title: 'Suministro de Combustible a Domicilio',
    description:
      'Te quedaste sin gasolina en la vía? Nuestro mecánico llega hasta donde estás con el combustible que necesitas (gasolina corriente, extra o ACPM) para que puedas continuar tu camino sin necesidad de remolque.',
    duration: '20 – 35 min',
    icon: Fuel,
    gradient: 'from-orange-500 to-red-600',
    emoji: '⛽',
    bgImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  },
  {
    id: 2,
    title: 'Reparación y Cambio de Neumáticos',
    description:
      'Llanta pinchada o reventada en plena carretera? Nuestro técnico llega con el equipo necesario para reparar el daño en sitio o instalar el repuesto, dejándote listo para seguir.',
    duration: '25 – 45 min',
    icon: Wrench,
    gradient: 'from-blue-500 to-cyan-600',
    emoji: '🔧',
    bgImage: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&q=80',
  },
  {
    id: 3,
    title: 'Carga y Reemplazo de Batería',
    description:
      'Batería descargada o dañada? Te ayudamos con carga rápida mediante cables de arranque o reemplazamos la batería en el lugar. Servicio disponible para autos, camionetas y motos.',
    duration: '15 – 30 min',
    icon: Battery,
    gradient: 'from-yellow-500 to-amber-600',
    emoji: '🔋',
    bgImage: 'https://images.unsplash.com/photo-1609592806596-b8d7a49f4a8e?w=600&q=80',
  },
  {
    id: 4,
    title: 'Diagnóstico y Reparación Mecánica',
    description:
      'Ruidos extraños, luces de advertencia encendidas o el motor no arranca? Nuestro mecánico realiza un diagnóstico completo con escáner OBD y repara fallas menores directamente en el lugar.',
    duration: '45 – 90 min',
    icon: Zap,
    gradient: 'from-purple-500 to-violet-600',
    emoji: '🔍',
    bgImage: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80',
  },
  {
    id: 5,
    title: 'Cerrajería Automotriz',
    description:
      'Llaves adentro del carro, llave rota en la cerradura o control remoto dañado? Nuestro especialista abre tu vehículo sin daños y puede programar nuevas llaves o controles en el momento.',
    duration: '20 – 40 min',
    icon: Key,
    gradient: 'from-green-500 to-emerald-600',
    emoji: '🔑',
    bgImage: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&q=80',
  },
  {
    id: 6,
    title: 'Grúa y Remolque de Vehículos',
    description:
      'Accidente, falla grave o vehículo inmovilizado? Enviamos una grúa para transportar tu carro de forma segura al taller de tu preferencia o a un lugar seguro. Servicio disponible 24/7.',
    duration: '30 – 60 min',
    icon: Truck,
    gradient: 'from-red-500 to-rose-600',
    emoji: '🚛',
    bgImage: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&q=80',
  },
];

/* ─────────────────────────────────────────────
   LÓGICA DEL CHATBOT
───────────────────────────────────────────── */
interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
}

const PROFANITY = [
  'mierda','hijueputa','puta','malparido','gonorrea','hp','marica','idiota',
  'imbecil','estupido','pendejo','verga','coño','joder','cabron','perra',
];

function containsProfanity(text: string): boolean {
  const lower = text.toLowerCase();
  return PROFANITY.some(w => lower.includes(w));
}

function getBotResponse(input: string): string {
  const msg = input.toLowerCase().trim();

  // Batería
  if (/bater[ií]a|descarg|no arranca|no enciende|clic|click|arranque/.test(msg)) {
    return '🔋 Parece un problema de batería. Los síntomas típicos son: el motor no arranca, escuchas un "clic" al girar la llave, las luces están débiles o el tablero no enciende. Te recomiendo el servicio de **Carga y Reemplazo de Batería**. ¿Quieres que te lo asigne?';
  }
  // Llanta / neumático
  if (/llanta|neum[aá]tico|pinch|revent|rueda|goma/.test(msg)) {
    return '🔧 Entiendo que tienes un problema con una llanta. Si está pinchada o reventada, nuestro técnico llega con el equipo para repararla o cambiarla en el lugar. Te recomiendo el servicio de **Reparación y Cambio de Neumáticos**. ¿Necesitas que enviemos a alguien?';
  }
  // Gasolina / combustible
  if (/gasolina|combustible|vac[ií]o|sin gas|sin combustible|acpm|diesel/.test(msg)) {
    return '⛽ Sin combustible en la vía es una situación muy común. Nuestro mecánico puede llevarte gasolina corriente, extra o ACPM directamente donde estás. Te recomiendo el servicio de **Suministro de Combustible a Domicilio**. ¿Lo pedimos?';
  }
  // Llaves / cerrajería
  if (/llave|cerraj|encerr|bloqu|control remoto|cerradura/.test(msg)) {
    return '🔑 Llaves adentro del carro o cerradura bloqueada? Nuestro especialista en cerrajería automotriz puede abrir tu vehículo sin daños y programar nuevas llaves. Te recomiendo el servicio de **Cerrajería Automotriz**. ¿Lo solicitamos?';
  }
  // Grúa / remolque
  if (/gr[úu]a|remolque|accidente|inmoviliz|taller|transportar/.test(msg)) {
    return '🚛 Si tu vehículo no puede moverse por sí solo, necesitas una grúa. Podemos enviarte una para llevarlo al taller de tu preferencia de forma segura. Te recomiendo el servicio de **Grúa y Remolque**. ¿Lo pedimos?';
  }
  // Recalentamiento
  if (/recalentar|temperatura|humo|vapor|radiador|refrigerante|agua/.test(msg)) {
    return '🌡️ El recalentamiento puede dañar gravemente el motor. Síntomas: aguja de temperatura al máximo, humo blanco del capó, olor a quemado. Apaga el motor de inmediato y no abras el radiador en caliente. Te recomiendo el servicio de **Diagnóstico y Reparación Mecánica** para que un técnico evalúe el sistema de enfriamiento.';
  }
  // Frenos
  if (/freno|frena|chirri|vibra|pedal/.test(msg)) {
    return '🛑 Problemas con los frenos son una emergencia de seguridad. Si el pedal está blando, el carro vibra al frenar o escuchas chirridos, detente en un lugar seguro. Te recomiendo el servicio de **Diagnóstico y Reparación Mecánica** para revisión inmediata.';
  }
  // Luces / eléctrico
  if (/luz|luces|el[eé]ctric|fusible|corto|tablero|check engine|testigo/.test(msg)) {
    return '💡 Los problemas eléctricos pueden ser desde un fusible quemado hasta fallas en el alternador. Si el "Check Engine" está encendido o hay luces parpadeando, nuestro mecánico puede hacer un diagnóstico con escáner OBD. Te recomiendo el servicio de **Diagnóstico y Reparación Mecánica**.';
  }
  // Ruido / sonido
  if (/ruido|sonido|golpe|traqueteo|vibra|zumbido/.test(msg)) {
    return '🔊 Los ruidos extraños en el vehículo pueden indicar problemas en la suspensión, frenos, motor o transmisión. Descríbeme más: ¿el ruido es al frenar, al acelerar, o constante? Mientras tanto, te recomiendo el servicio de **Diagnóstico y Reparación Mecánica** para una evaluación completa.';
  }
  // Aceite
  if (/aceite|oil|mancha|fuga|goteo/.test(msg)) {
    return '🛢️ Una fuga de aceite puede causar daños graves al motor si no se atiende. Si ves manchas oscuras debajo del carro o el nivel de aceite baja rápido, detente y llama a un mecánico. Te recomiendo el servicio de **Diagnóstico y Reparación Mecánica**.';
  }
  // Transmisión / caja
  if (/transmisi[oó]n|caja|cambios|marcha|velocidad/.test(msg)) {
    return '⚙️ Problemas de transmisión como dificultad para cambiar marchas, golpes al cambiar o patinaje son señales de alerta. Te recomiendo el servicio de **Diagnóstico y Reparación Mecánica** para que un técnico evalúe la situación.';
  }
  // Saludo
  if (/hola|buenos|buenas|hey|hi|saludos/.test(msg)) {
    return '👋 ¡Hola! Soy el asistente virtual de PARCE. Estoy aquí para ayudarte a identificar el problema de tu vehículo y recomendarte el servicio adecuado. Cuéntame, ¿qué le está pasando a tu carro?';
  }
  // Gracias
  if (/gracias|thank|perfecto|genial|excelente/.test(msg)) {
    return '😊 Con gusto. Recuerda que puedes pedir cualquier servicio directamente desde esta pantalla. ¿Hay algo más en lo que pueda ayudarte?';
  }
  // No sé qué tiene
  if (/no s[eé]|no sabe|no entiendo|ayuda|qu[eé] tiene|qu[eé] le pasa/.test(msg)) {
    return '🤔 No te preocupes, para eso estamos. Cuéntame los síntomas que notas: ¿hace ruidos? ¿no arranca? ¿hay luces encendidas en el tablero? ¿huele a algo? Con esa información puedo orientarte mejor.';
  }

  return '🤖 Entiendo tu consulta. Para darte la mejor recomendación, cuéntame más detalles: ¿qué síntomas presenta el vehículo? Por ejemplo: no arranca, hace ruidos, tiene luces encendidas, perdió potencia, etc. Así puedo indicarte exactamente qué servicio necesitas.';
}

/* ─────────────────────────────────────────────
   COMPONENTE PRINCIPAL
───────────────────────────────────────────── */
export default function ServicesPage() {
  const { user } = useAuth();
  const { setSelectedService } = useService();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'bot',
      text: '👋 ¡Hola! Soy el asistente de PARCE. Si no sabes qué falla tiene tu vehículo, cuéntame los síntomas y te ayudo a identificar el problema y el servicio que necesitas.',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [lastDiagnosis, setLastDiagnosis] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const itemsPerPage = 3;
  const totalPages = Math.ceil(services.length / itemsPerPage);
  const currentServices = services.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;

    if (containsProfanity(text)) {
      setMessages(prev => [
        ...prev,
        { role: 'user', text },
        { role: 'bot', text: '⚠️ Por favor mantén un lenguaje respetuoso. Estoy aquí para ayudarte con tu vehículo.' },
      ]);
      setInputText('');
      return;
    }

    const botReply = getBotResponse(text);
    setLastDiagnosis(botReply);
    setMessages(prev => [
      ...prev,
      { role: 'user', text },
      { role: 'bot', text: botReply },
    ]);
    setInputText('');
  };

  const handleServiceSelect = (service: typeof services[0]) => {
    const serviceData = {
      id: service.id,
      title: service.title,
      description: service.description,
      duration: service.duration,
      chatbotDiagnosis: lastDiagnosis || undefined,
    };
    setSelectedService(serviceData);
    navigate('/service-in-progress');
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar isAuthenticated userName={user?.name || 'Usuario'} />
      <Sidebar />

      <main className="ml-64 pt-16 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">SERVICIOS</h1>
            <p className="text-gray-400">Selecciona el servicio que necesitas o consulta con nuestro asistente</p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="card overflow-hidden group cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all duration-300"
              >
                {/* Service Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={service.bgImage}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      // Fallback si la imagen no carga
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-60`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${service.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                      <service.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3 text-2xl">{service.emoji}</div>
                </div>

                {/* Service Info */}
                <div className="p-5 space-y-3">
                  <h3 className="text-base font-bold text-white leading-snug">
                    {service.title}
                  </h3>
                  <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Duration */}
                  <div className="flex items-center gap-2 pt-1">
                    <Clock className="w-4 h-4 text-primary-400" />
                    <span className="text-xs text-gray-400">Tiempo estimado:</span>
                    <span className="text-sm font-bold text-primary-400">{service.duration}</span>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleServiceSelect(service)}
                    className="w-full btn-primary mt-2"
                  >
                    PEDIR
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="p-3 bg-dark-800 rounded-lg hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-gray-400" />
              </button>
              <div className="flex gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      currentPage === i ? 'bg-primary-500' : 'bg-dark-700 hover:bg-dark-600'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                className="p-3 bg-dark-800 rounded-lg hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-gray-400" />
              </button>
            </div>
          )}
        </motion.div>
      </main>

      {/* ── CHATBOT FLOTANTE ── */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-24 right-6 w-96 max-h-[560px] flex flex-col bg-dark-900 border border-anthracite-700 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-primary-600 to-purple-600">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Asistente PARCE</p>
                  <p className="text-white/70 text-xs">Diagnóstico de vehículos</p>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 max-h-96">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${
                    msg.role === 'bot'
                      ? 'bg-gradient-to-br from-primary-500 to-purple-600'
                      : 'bg-gradient-to-br from-gray-600 to-gray-700'
                  }`}>
                    {msg.role === 'bot'
                      ? <Bot className="w-4 h-4 text-white" />
                      : <UserIcon className="w-4 h-4 text-white" />
                    }
                  </div>
                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'bot'
                        ? 'bg-dark-800 text-gray-200 rounded-tl-sm'
                        : 'bg-primary-600 text-white rounded-tr-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-anthracite-700 bg-dark-900">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Describe el problema de tu vehículo..."
                  className="flex-1 bg-dark-800 border border-anthracite-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="p-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón flotante del chatbot */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setChatOpen(prev => !prev)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center z-50 hover:shadow-primary-500/40"
      >
        <AnimatePresence mode="wait">
          {chatOpen
            ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                <X className="w-6 h-6 text-white" />
              </motion.div>
            : <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                <MessageCircle className="w-6 h-6 text-white" />
              </motion.div>
          }
        </AnimatePresence>
        {/* Badge de notificación */}
        {!chatOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
            ?
          </span>
        )}
      </motion.button>
    </div>
  );
}
