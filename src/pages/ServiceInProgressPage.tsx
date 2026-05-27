import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, User, Star, MessageSquare, Navigation, Car, AlertTriangle, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useService } from '../context/ServiceContext';

/* ─────────────────────────────────────────────
   CONSTANTES
───────────────────────────────────────────── */
// Coordenadas simuladas (Bogotá)
const MECHANIC_START = { lat: 4.6351, lng: -74.0703 }; // Chapinero
const USER_LOCATION  = { lat: 4.6097, lng: -74.0817 }; // Centro

const GOOGLE_MAPS_API_KEY = 'AIzaSyD-PLACEHOLDER'; // Reemplaza con tu API key real

/* ─────────────────────────────────────────────
   HOOK: simulación de progreso
───────────────────────────────────────────── */
function useServiceProgress(totalMinutes: number) {
  const [elapsed, setElapsed] = useState(0); // segundos transcurridos
  const totalSeconds = totalMinutes * 60;

  useEffect(() => {
    if (elapsed >= totalSeconds) return;
    const interval = setInterval(() => {
      setElapsed(prev => Math.min(prev + 1, totalSeconds));
    }, 1000); // 1 segundo real = 1 segundo simulado (para demo)
    return () => clearInterval(interval);
  }, [elapsed, totalSeconds]);

  const progress = Math.min((elapsed / totalSeconds) * 100, 100);
  const remainingSeconds = Math.max(totalSeconds - elapsed, 0);
  const remainingMinutes = Math.ceil(remainingSeconds / 60);
  const arrived = elapsed >= totalSeconds;

  return { progress, remainingMinutes, arrived, elapsed };
}

/* ─────────────────────────────────────────────
   COMPONENTE MAPA
───────────────────────────────────────────── */
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

interface MapComponentProps {
  progress: number;
  arrived: boolean;
  distanceKm: number;
  remainingMinutes: number;
}

function MapComponent({ progress, arrived, distanceKm, remainingMinutes }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  const initializeMap = useCallback(() => {
    if (!mapRef.current || !window.google) return;

    try {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: (MECHANIC_START.lat + USER_LOCATION.lat) / 2, lng: (MECHANIC_START.lng + USER_LOCATION.lng) / 2 },
        zoom: 13,
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2d3561' }] },
          { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
          { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
          { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
          { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        ],
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });

      mapInstanceRef.current = map;

      // Marcador del usuario
      new window.google.maps.Marker({
        position: USER_LOCATION,
        map,
        title: 'Tu ubicación',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#0ea5e9',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });

      // Marcador del mecánico (se moverá)
      const mechanicMarker = new window.google.maps.Marker({
        position: MECHANIC_START,
        map,
        title: 'Mecánico',
        icon: {
          path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: '#a855f7',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          rotation: 180,
        },
      });
      markerRef.current = mechanicMarker;

      // Línea de ruta
      new window.google.maps.Polyline({
        path: [MECHANIC_START, USER_LOCATION],
        geodesic: true,
        strokeColor: '#0ea5e9',
        strokeOpacity: 0.8,
        strokeWeight: 3,
        map,
      });

      setMapLoaded(true);
    } catch {
      setMapError(true);
    }
  }, []);

  // Cargar Google Maps script
  useEffect(() => {
    if (window.google) {
      initializeMap();
      return;
    }

    // Verificar si ya hay un script cargando
    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      existingScript.addEventListener('load', initializeMap);
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = initializeMap;
    script.onerror = () => setMapError(true);
    document.head.appendChild(script);

    return () => {
      script.removeEventListener('load', initializeMap);
    };
  }, [initializeMap]);

  // Animar el marcador del mecánico según el progreso
  useEffect(() => {
    if (!markerRef.current || !mapLoaded) return;
    const t = Math.min(progress / 100, 1);
    const lat = MECHANIC_START.lat + (USER_LOCATION.lat - MECHANIC_START.lat) * t;
    const lng = MECHANIC_START.lng + (USER_LOCATION.lng - MECHANIC_START.lng) * t;
    markerRef.current.setPosition({ lat, lng });
  }, [progress, mapLoaded]);

  if (mapError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-dark-800 rounded-xl gap-4">
        {/* Mapa simulado visual cuando no hay API key */}
        <div className="relative w-full h-full bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-xl overflow-hidden">
          {/* Grid de calles simuladas */}
          <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 300">
            {/* Calles horizontales */}
            {[50, 100, 150, 200, 250].map(y => (
              <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#4a5568" strokeWidth="1" />
            ))}
            {/* Calles verticales */}
            {[60, 120, 180, 240, 300, 360].map(x => (
              <line key={x} x1={x} y1="0" x2={x} y2="300" stroke="#4a5568" strokeWidth="1" />
            ))}
            {/* Avenida principal */}
            <line x1="0" y1="150" x2="400" y2="150" stroke="#6b7280" strokeWidth="3" />
            <line x1="200" y1="0" x2="200" y2="300" stroke="#6b7280" strokeWidth="3" />
          </svg>

          {/* Ruta animada */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300">
            <defs>
              <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.9" />
              </linearGradient>
            </defs>
            {/* Línea de ruta */}
            <line x1="80" y1="80" x2="320" y2="220" stroke="url(#routeGrad)" strokeWidth="3" strokeDasharray="8,4" />
            {/* Punto mecánico (se mueve) */}
            <circle
              cx={80 + (320 - 80) * (progress / 100)}
              cy={80 + (220 - 80) * (progress / 100)}
              r="8"
              fill="#a855f7"
              stroke="white"
              strokeWidth="2"
            />
            {/* Punto usuario */}
            <circle cx="320" cy="220" r="10" fill="#0ea5e9" stroke="white" strokeWidth="2" />
            <circle cx="320" cy="220" r="18" fill="#0ea5e9" fillOpacity="0.2" />
          </svg>

          {/* Labels */}
          <div className="absolute top-4 left-4 bg-purple-600/80 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2">
            <Car className="w-4 h-4 text-white" />
            <span className="text-white text-xs font-semibold">Mecánico</span>
          </div>
          <div className="absolute bottom-4 right-4 bg-primary-600/80 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-white" />
            <span className="text-white text-xs font-semibold">Tu ubicación</span>
          </div>

          {/* Info overlay */}
          <div className="absolute bottom-4 left-4 bg-dark-900/90 backdrop-blur-sm rounded-xl p-3 border border-anthracite-700">
            <div className="flex items-center gap-3">
              <Navigation className="w-5 h-5 text-primary-400" />
              <div>
                <p className="text-white text-sm font-bold">{distanceKm} km</p>
                <p className="text-gray-400 text-xs">{arrived ? '¡Llegó!' : `~${remainingMinutes} min restantes`}</p>
              </div>
            </div>
          </div>

          {arrived && (
            <div className="absolute inset-0 flex items-center justify-center bg-dark-950/60 backdrop-blur-sm rounded-xl">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-2" />
                <p className="text-white font-bold text-lg">¡Mecánico llegó!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-800 rounded-xl">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-400 text-sm">Cargando mapa...</p>
          </div>
        </div>
      )}
      {/* Info overlay sobre el mapa real */}
      {mapLoaded && (
        <div className="absolute bottom-4 left-4 bg-dark-900/90 backdrop-blur-sm rounded-xl p-3 border border-anthracite-700">
          <div className="flex items-center gap-3">
            <Navigation className="w-5 h-5 text-primary-400" />
            <div>
              <p className="text-white text-sm font-bold">{distanceKm} km</p>
              <p className="text-gray-400 text-xs">{arrived ? '¡Llegó!' : `~${remainingMinutes} min restantes`}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MODAL DE CANCELACIÓN
───────────────────────────────────────────── */
function CancelModal({ onConfirm, onClose }: { onConfirm: () => void; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-dark-950/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="card p-8 max-w-sm w-full mx-4 space-y-6 text-center"
      >
        <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white mb-2">¿Cancelar servicio?</h3>
          <p className="text-gray-400 text-sm">
            ¿Estás seguro de que deseas cancelar el servicio? El mecánico ya está en camino.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="px-4 py-3 bg-dark-700 hover:bg-dark-600 text-white rounded-xl font-semibold transition-colors"
          >
            Seguir servicio
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors"
          >
            Cancelar servicio
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   COMPONENTE PRINCIPAL
───────────────────────────────────────────── */
export default function ServiceInProgressPage() {
  const { user } = useAuth();
  const { selectedService } = useService();
  const navigate = useNavigate();

  const ESTIMATED_MINUTES = 12;
  const DISTANCE_KM = 3.2;

  const { progress, remainingMinutes, arrived } = useServiceProgress(ESTIMATED_MINUTES);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const mechanicName = 'María González';
  const mechanicRating = 5.0;
  const mechanicStartLocation = 'Cra. 13 #72-45, Chapinero, Bogotá';
  const plate = 'PDF-345';

  const serviceTitle = selectedService?.title || 'Recarga de Gasolina';
  const serviceDescription = selectedService?.chatbotDiagnosis
    ? `Diagnóstico del asistente: ${selectedService.chatbotDiagnosis.replace(/[🔋🔧⛽🔑🚛🌡️🛑💡🔊🛢️⚙️👋😊🤔🤖]/gu, '').trim()}`
    : selectedService?.description || 'El mecánico llegará con el equipo necesario para tu vehículo.';

  const progressLabel = arrived
    ? '¡Mecánico llegó!'
    : progress < 30
    ? 'Mecánico asignado'
    : progress < 70
    ? 'En camino'
    : 'Llegando...';

  const handleCancel = () => {
    setShowCancelModal(false);
    navigate('/services');
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar isAuthenticated userName={user?.name || 'Usuario'} />
      <Sidebar />

      <main className="ml-64 pt-16 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto space-y-6"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-white mb-2">SERVICIO EN CURSO</h1>
            <p className="text-gray-400">Tu mecánico está en camino</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* ── MAPA ── */}
            <div className="card p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Navegación</h3>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Navigation className="w-4 h-4 text-primary-400" />
                  <span>{DISTANCE_KM} km</span>
                  <span className="text-gray-600">•</span>
                  <Clock className="w-4 h-4 text-primary-400" />
                  <span>{arrived ? 'Llegó' : `~${remainingMinutes} min`}</span>
                </div>
              </div>

              {/* Mapa expandido */}
              <div className="flex-1 min-h-[420px]">
                <MapComponent
                  progress={progress}
                  arrived={arrived}
                  distanceKm={DISTANCE_KM}
                  remainingMinutes={remainingMinutes}
                />
              </div>

              {/* Leyenda */}
              <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span>Mecánico</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-primary-500" />
                  <span>Tu ubicación</span>
                </div>
              </div>
            </div>

            {/* ── INFO DEL SERVICIO ── */}
            <div className="card p-6 flex flex-col">
              <h3 className="text-xl font-bold text-white mb-5">Servicio en curso</h3>

              <div className="space-y-5 flex-1">
                {/* Mecánico */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-bold text-white">{mechanicName}</h4>
                    <div className="flex items-center gap-1 mt-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      ))}
                      <span className="text-xs text-gray-400 ml-1">({mechanicRating})</span>
                    </div>
                  </div>
                  {/* Botón Contactar al lado del nombre */}
                  <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-xl text-white text-sm font-semibold transition-colors flex-shrink-0">
                    <MessageSquare className="w-4 h-4" />
                    Contactar
                  </button>
                </div>

                {/* Tiempo restante */}
                <div className="flex items-center gap-3 p-4 bg-dark-800/60 rounded-xl border border-anthracite-800">
                  <Clock className="w-5 h-5 text-primary-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Tiempo restante</p>
                    <p className="text-white font-bold text-lg">
                      {arrived ? '¡Llegó!' : `${remainingMinutes} min`}
                    </p>
                  </div>
                </div>

                {/* Ubicación del mecánico */}
                <div className="flex items-start gap-3 p-4 bg-dark-800/60 rounded-xl border border-anthracite-800">
                  <MapPin className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400">Ubicación de inicio del mecánico</p>
                    <p className="text-white font-semibold text-sm">{mechanicStartLocation}</p>
                  </div>
                </div>

                {/* Placa */}
                <div className="flex items-center gap-3 p-4 bg-dark-800/60 rounded-xl border border-anthracite-800">
                  <Car className="w-5 h-5 text-primary-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Placa del vehículo</p>
                    <p className="text-white font-bold tracking-widest">{plate}</p>
                  </div>
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
                    <span className={`font-semibold ${arrived ? 'text-green-400' : 'text-primary-400'}`}>
                      {progressLabel}
                    </span>
                  </div>
                  <div className="h-3 bg-dark-800 rounded-full overflow-hidden">
                    <motion.div
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className={`h-full rounded-full ${
                        arrived
                          ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                          : 'bg-gradient-to-r from-primary-500 to-purple-500'
                      }`}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Asignado</span>
                    <span>En camino</span>
                    <span>Llegó</span>
                  </div>
                </div>

                {/* Botón cancelar (centrado, sin contactar) */}
                <div className="pt-2">
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="w-full py-3 bg-dark-700 hover:bg-red-900/40 border border-dark-600 hover:border-red-700 text-gray-300 hover:text-red-300 rounded-xl font-semibold transition-all duration-200"
                  >
                    Cancelar servicio
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Modal de cancelación */}
      <AnimatePresence>
        {showCancelModal && (
          <CancelModal
            onConfirm={handleCancel}
            onClose={() => setShowCancelModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
