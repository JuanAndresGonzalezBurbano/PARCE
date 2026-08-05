import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LiveTrackingMapProps {
  mechanicStartLat: number;
  mechanicStartLng: number;
  userLat: number;
  userLng: number;
  progress: number; // 0-100
  arrived: boolean;
  distanceKm: number;
  remainingSeconds: number;
}

export default function LiveTrackingMap({
  mechanicStartLat,
  mechanicStartLng,
  userLat,
  userLng,
  progress,
  arrived,
  distanceKm,
  remainingSeconds,
}: LiveTrackingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const mechanicMarkerRef = useRef<L.Marker | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  const [currentMechanicPos, setCurrentMechanicPos] = useState({ lat: mechanicStartLat, lng: mechanicStartLng });

  // Iconos personalizados
  const mechanicIcon = L.divIcon({
    className: '',
    html: '<div style="font-size:32px;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.4))">🚗</div>',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  const userIcon = L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:40px;height:40px;">
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:40px;height:40px;background:rgba(14,165,233,0.2);border-radius:50%;animation:pulse 2s infinite"></div>
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:24px;height:24px;background:#0ea5e9;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>
      </div>
      <style>
        @keyframes pulse {
          0%, 100% { transform: translate(-50%,-50%) scale(1); opacity: 1; }
          50% { transform: translate(-50%,-50%) scale(1.2); opacity: 0.5; }
        }
      </style>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

  // Inicializar mapa
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Centrar entre mecánico y usuario
    const centerLat = (mechanicStartLat + userLat) / 2;
    const centerLng = (mechanicStartLng + userLng) / 2;

    const map = L.map(mapRef.current).setView([centerLat, centerLng], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapInstance.current = map;

    // Ajustar vista para mostrar ambos puntos
    const bounds = L.latLngBounds([
      [mechanicStartLat, mechanicStartLng],
      [userLat, userLng],
    ]);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Actualizar posición del mecánico basado en el progreso
  useEffect(() => {
    const lat = mechanicStartLat + (userLat - mechanicStartLat) * (progress / 100);
    const lng = mechanicStartLng + (userLng - mechanicStartLng) * (progress / 100);
    setCurrentMechanicPos({ lat, lng });
  }, [progress, mechanicStartLat, mechanicStartLng, userLat, userLng]);

  // Marcador del mecánico
  useEffect(() => {
    if (!mapInstance.current) return;

    if (mechanicMarkerRef.current) {
      mechanicMarkerRef.current.setLatLng([currentMechanicPos.lat, currentMechanicPos.lng]);
    } else {
      mechanicMarkerRef.current = L.marker([currentMechanicPos.lat, currentMechanicPos.lng], {
        icon: mechanicIcon,
      })
        .addTo(mapInstance.current)
        .bindPopup('<strong>🚗 Mecánico</strong><br>En camino hacia ti');
    }
  }, [currentMechanicPos]);

  // Marcador del usuario
  useEffect(() => {
    if (!mapInstance.current) return;

    if (!userMarkerRef.current) {
      userMarkerRef.current = L.marker([userLat, userLng], {
        icon: userIcon,
      })
        .addTo(mapInstance.current)
        .bindPopup('<strong>📍 Tu ubicación</strong><br>Esperando al mecánico');
    }
  }, [userLat, userLng]);

  // Línea de ruta
  useEffect(() => {
    if (!mapInstance.current) return;

    if (routeLineRef.current) {
      routeLineRef.current.remove();
    }

    routeLineRef.current = L.polyline(
      [
        [currentMechanicPos.lat, currentMechanicPos.lng],
        [userLat, userLng],
      ],
      {
        color: '#d97706',
        weight: 4,
        opacity: 0.7,
        dashArray: '10, 10',
      }
    ).addTo(mapInstance.current);
  }, [currentMechanicPos, userLat, userLng]);

  return (
    <div className="relative w-full h-full" style={{ minHeight: '320px' }}>
      <div ref={mapRef} className="w-full h-full rounded-xl overflow-hidden" />

      {/* Info overlay superior */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-[1000] pointer-events-none">
        <div className="bg-gold-600/90 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2 pointer-events-auto">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-white text-sm font-bold">Mecánico en vivo</span>
        </div>
        <div className="bg-primary-600/90 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2 pointer-events-auto">
          <span className="text-white text-sm font-bold">Tu ubicación</span>
        </div>
      </div>

      {/* Info overlay inferior */}
      <div className="absolute bottom-3 left-3 bg-dark-900/95 backdrop-blur-md rounded-xl p-3 border border-anthracite-700 z-[1000] min-w-[140px]">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-gold-500 animate-pulse" />
          <span className="text-xs text-gray-400">Distancia</span>
        </div>
        <p className="text-white text-xl font-bold mb-1">{distanceKm.toFixed(1)} km</p>
        <p className="text-gray-400 text-xs">
          {arrived ? '¡Mecánico llegó!' : `~${Math.floor(remainingSeconds / 60)}:${String(remainingSeconds % 60).padStart(2, '0')} restantes`}
        </p>
      </div>

      {/* Overlay cuando llegó */}
      {arrived && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-950/80 backdrop-blur-sm rounded-xl z-[1001]">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3 animate-bounce">
              <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white font-bold text-2xl mb-1">¡Mecánico llegó!</p>
            <p className="text-gray-400 text-sm">Está en tu ubicación</p>
          </div>
        </div>
      )}
    </div>
  );
}
