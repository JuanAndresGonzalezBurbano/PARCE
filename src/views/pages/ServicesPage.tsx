import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Fuel, Battery, Wrench, Clock, ChevronLeft, ChevronRight, MessageCircle, X, Send, Bot, User as UserIcon, Zap, Truck, Key } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../../controllers/AuthContext';
import { useService } from '../../controllers/ServiceContext';
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
// Define el tipo de mensaje del chat — puede ser del usuario o del bot
// suggestedService: si el bot sugiere un servicio, guarda el nombre para mostrar el botón
interface ChatMessage { role: 'user' | 'bot'; text: string; suggestedService?: string; }

// Lista de palabras prohibidas — filtra groserías antes de enviar al bot
const PROFANITY = [
  'mierda','hijueputa','puta','malparido','gonorrea','hp','marica',
  'idiota','imbecil','estupido','pendejo','verga','coño','joder','cabron','perra',
  'bobo','bruto','animal','bestia','fuck','shit','bitch','damn','crap',
  'bastard','asshole','dick','pussy','cunt','retrasado','mongolo','subnormal',
  'inutil','maldito','desgraciado','hdp','ptm','ctm','conchatumadre',
  'webon','weon','huevon','mamahuevo','tonto',
];

// Función que detecta groserías usando expresiones regulares con límite de palabra (\b)
// Esto evita falsos positivos como "vehículo" que contiene "culo"
const hasProfanity = (t: string) =>
  PROFANITY.some(w => new RegExp(`\\b${w}\\b`, 'i').test(t));

// Prompt del sistema que le dice a Groq cómo debe comportarse el chatbot
// Define el rol, los servicios disponibles y el formato exacto de respuesta esperado
const SYSTEM_PROMPT = `Eres el asistente virtual de P.A.R.C.E (Plataforma de Asistencia Rápida Para Conductores en Emergencia).
Tu rol es diagnosticar problemas vehiculares y recomendar el servicio adecuado.

Los servicios disponibles en PARCE son EXACTAMENTE estos 6:
1. Suministro de Combustible a Domicilio
2. Reparación y Cambio de Neumáticos
3. Carga y Reemplazo de Batería
4. Diagnóstico y Reparación Mecánica
5. Cerrajería Automotriz
6. Grúa y Remolque de Vehículos

Cuando el usuario describa un problema, responde SIEMPRE así:

Si el problema corresponde a uno de los 6 servicios:
- Explica brevemente qué causó el problema
- Termina con exactamente: "SERVICIO_SUGERIDO: [nombre exacto del servicio de la lista]"

Si el problema NO corresponde a ninguno de los 6 servicios:
- Explica qué causó el problema
- Di qué tipo de servicio especializado necesita (ej: taller de transmisión, servicio de AC, etc.)
- Termina con exactamente: "SERVICIO_SUGERIDO: Diagnóstico y Reparación Mecánica"

Responde siempre en español, de forma clara y breve. Usa emojis relevantes.`;

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
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const itemsPerPage = 3;
  const totalPages = Math.ceil(services.length / itemsPerPage);
  const currentServices = services.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    const text = inputText.trim(); // Elimina espacios al inicio y final
    if (!text || isLoading) return; // No hace nada si está vacío o ya está cargando

    // Verifica si el mensaje tiene groserías antes de enviarlo
    if (hasProfanity(text)) {
      // Agrega el mensaje del usuario y la advertencia del bot
      setMessages(prev => [...prev,
        { role: 'user', text },
        { role: 'bot', text: '⚠️ Por favor mantén un lenguaje respetuoso. Las groserías no están permitidas en este chat. Estoy aquí para ayudarte con tu vehículo 😊' }
      ]);
      setInputText(''); // Limpia el campo de texto
      return; // No continúa al API
    }

    // Agrega el mensaje del usuario al chat inmediatamente
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInputText('');    // Limpia el campo de texto
    setIsLoading(true);  // Activa el indicador de carga (3 puntitos)

    try {
      // Lee la API key de Groq desde las variables de entorno (.env)
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;

      if (!apiKey) {
        throw new Error('API key no configurada. Verifica el archivo .env');
      }

      // Hace la petición HTTP POST a la API de Groq
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: text }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData?.error?.message || `Error ${response.status}`);
      }

      // Convierte la respuesta a JSON
      const data = await response.json();
      // Extrae el texto de la respuesta o usa mensaje de error si no hay
      const rawReply = data?.choices?.[0]?.message?.content
        || '🤖 Lo siento, no pude procesar tu consulta. Intenta de nuevo.';

      // Busca el tag SERVICIO_SUGERIDO en la respuesta con una expresión regular
      const serviceMatch = rawReply.match(/SERVICIO_SUGERIDO:\s*(.+)/);
      // Si encontró el tag, extrae el nombre del servicio; si no, es undefined
      const suggestedService = serviceMatch ? serviceMatch[1].trim() : undefined;
      // Elimina el tag de la respuesta para que no se muestre al usuario
      const cleanReply = rawReply.replace(/SERVICIO_SUGERIDO:\s*.+/, '').trim();

      // Agrega la respuesta limpia del bot al chat, con el servicio sugerido para el botón
      setMessages(prev => [...prev, { role: 'bot', text: cleanReply, suggestedService }]);
    } catch (err) {
      console.error('Groq error:', err); // Registra el error en consola para debugging
      // Convierte el error a string legible
      const errorMsg = err instanceof Error ? err.message : String(err);
      // Muestra el error en el chat
      setMessages(prev => [...prev, {
        role: 'bot',
        text: `⚠️ Error: ${errorMsg}`
      }]);
    } finally {
      setIsLoading(false); // Desactiva el indicador de carga siempre, haya o no error
    }
  };

  // Función que se ejecuta cuando el usuario hace click en "Pedir: [servicio]" en el chat
  const handleRequestFromChat = (suggestedService: string, diagnosis: string) => {
    // Busca el servicio en la lista comparando nombres (insensible a mayúsculas)
    const found = services.find(s =>
      s.title.toLowerCase().includes(suggestedService.toLowerCase()) ||
      suggestedService.toLowerCase().includes(s.title.toLowerCase())
    ) || services[3]; // Si no encuentra coincidencia, usa "Diagnóstico y Reparación Mecánica" (índice 3)
    
    // Configura el servicio seleccionado con el diagnóstico del chatbot como descripción
    setSelectedService({
      id: found.id,
      title: found.title,
      description: diagnosis,       // La descripción es el diagnóstico del chatbot
      duration: found.duration,
      chatbotDiagnosis: diagnosis,  // También lo guarda como diagnóstico del chatbot
    });
    // Navega a la página de servicio en curso
    navigate('/service-in-progress');
  };

  const handleServiceSelect = (service: typeof services[0]) => {
    setSelectedService({ id: service.id, title: service.title, description: service.description, duration: service.duration });
    navigate('/service-in-progress');
  };

  return (
    <div className="min-h-screen bg-dark-950">
      {/* RAMA: Soto - hideNavLinks oculta "Servicios" y "Contacto" del navbar en esta página */}
      <Navbar isAuthenticated userName={user?.name || 'Usuario'} hideNavLinks />
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
                  <div className={`max-w-[75%] flex flex-col gap-2`}>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'bot' ? 'bg-dark-800 text-gray-200 rounded-tl-sm' : 'bg-gold-600 text-anthracite-950 rounded-tr-sm'}`}>
                      {msg.text}
                    </div>
                    {/* RAMA: Soto - Botón "Pedir servicio" cuando el bot sugiere uno */}
                    {msg.role === 'bot' && msg.suggestedService && (
                      <button
                        onClick={() => handleRequestFromChat(msg.suggestedService!, msg.text)}
                        className="self-start flex items-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-anthracite-950 text-xs font-bold rounded-xl transition-colors"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        Pedir: {msg.suggestedService}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {/* Indicador de escritura mientras Groq (LLaMA) responde */}
              {isLoading && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-gold-500 to-gold-600">
                    <Bot className="w-4 h-4 text-anthracite-950" />
                  </div>
                  <div className="bg-dark-800 px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1 items-center">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-3 border-t border-anthracite-700">
              <div className="flex gap-2">
                <input type="text" value={inputText} onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Describe el problema de tu vehículo..."
                  className="flex-1 bg-dark-800 border border-anthracite-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gold-500 transition-colors" />
                <button onClick={handleSend} disabled={!inputText.trim() || isLoading}
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
