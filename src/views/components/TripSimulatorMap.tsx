import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Point {
  lat: number;
  lng: number;
  label: string;
}

interface TripSimulatorMapProps {
  onPickupChange?: (point: Point | null) => void;
  onDestinationChange?: (point: Point | null) => void;
  initialPickup?: Point | null;
  initialDestination?: Point | null;
}

export default function TripSimulatorMap({
  onPickupChange,
  onDestinationChange,
  initialPickup,
  initialDestination,
}: TripSimulatorMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const pickupMarkerRef = useRef<L.Marker | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  const [clickStage, setClickStage] = useState<'pickup' | 'dest'>('pickup');
  const [pickup, setPickup] = useState<Point | null>(initialPickup || null);
  const [destination, setDestination] = useState<Point | null>(initialDestination || null);

  // Iconos personalizados
  const pickupIcon = L.divIcon({
    className: '',
    html: '<div style="background:#34d399;width:20px;height:20px;border-radius:50%;border:3px solid #06231a;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  const destIcon = L.divIcon({
    className: '',
    html: '<div style="background:#f87171;width:20px;height:20px;border-radius:50%;border:3px solid #2a0f0f;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  const driverIcon = L.divIcon({
    className: '',
    html: '<div style="font-size:28px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">🚗</div>',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

  // Inicializar mapa
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current).setView([4.7110, -74.0721], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Click en el mapa para seleccionar puntos
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (clickStage === 'pickup') {
        const newPickup = {
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          label: 'Punto seleccionado en el mapa',
        };
        setPickup(newPickup);
        onPickupChange?.(newPickup);
        setClickStage('dest');
      } else {
        const newDest = {
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          label: 'Destino seleccionado en el mapa',
        };
        setDestination(newDest);
        onDestinationChange?.(newDest);
        setClickStage('pickup');
      }
    });

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Actualizar marcador de recogida
  useEffect(() => {
    if (!mapInstance.current) return;

    if (pickup) {
      if (pickupMarkerRef.current) {
        pickupMarkerRef.current.setLatLng([pickup.lat, pickup.lng]);
      } else {
        pickupMarkerRef.current = L.marker([pickup.lat, pickup.lng], {
          icon: pickupIcon,
        })
          .addTo(mapInstance.current)
          .bindPopup(`<strong>Punto de recogida</strong><br>${pickup.label}`);
      }
    } else {
      if (pickupMarkerRef.current) {
        pickupMarkerRef.current.remove();
        pickupMarkerRef.current = null;
      }
    }
  }, [pickup]);

  // Actualizar marcador de destino
  useEffect(() => {
    if (!mapInstance.current) return;

    if (destination) {
      if (destMarkerRef.current) {
        destMarkerRef.current.setLatLng([destination.lat, destination.lng]);
      } else {
        destMarkerRef.current = L.marker([destination.lat, destination.lng], {
          icon: destIcon,
        })
          .addTo(mapInstance.current)
          .bindPopup(`<strong>Destino</strong><br>${destination.label}`);
      }

      // Ajustar vista para mostrar ambos puntos
      if (pickup) {
        const bounds = L.latLngBounds([
          [pickup.lat, pickup.lng],
          [destination.lat, destination.lng],
        ]);
        mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
      }
    } else {
      if (destMarkerRef.current) {
        destMarkerRef.current.remove();
        destMarkerRef.current = null;
      }
    }
  }, [destination, pickup]);

  // Dibujar ruta (simplificada - línea recta)
  useEffect(() => {
    if (!mapInstance.current) return;

    if (pickup && destination) {
      if (routeLineRef.current) {
        routeLineRef.current.remove();
      }

      routeLineRef.current = L.polyline(
        [
          [pickup.lat, pickup.lng],
          [destination.lat, destination.lng],
        ],
        {
          color: '#fbbf24',
          weight: 4,
          opacity: 0.7,
          dashArray: '10, 10',
        }
      ).addTo(mapInstance.current);
    } else {
      if (routeLineRef.current) {
        routeLineRef.current.remove();
        routeLineRef.current = null;
      }
    }
  }, [pickup, destination]);

  // Método público para agregar marcador del conductor
  const addDriverMarker = (lat: number, lng: number) => {
    if (!mapInstance.current) return;

    if (driverMarkerRef.current) {
      driverMarkerRef.current.setLatLng([lat, lng]);
    } else {
      driverMarkerRef.current = L.marker([lat, lng], {
        icon: driverIcon,
      })
        .addTo(mapInstance.current)
        .bindPopup('<strong>Mecánico</strong>');
    }
  };

  // Método público para animar el conductor a lo largo de la ruta
  const animateDriver = (coords: [number, number][], durationMs: number, onUpdate?: (progress: number) => void) => {
    if (!mapInstance.current || !driverMarkerRef.current || coords.length === 0) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / durationMs, 1);

      const index = Math.floor(progress * (coords.length - 1));
      const [lat, lng] = coords[index];

      if (driverMarkerRef.current) {
        driverMarkerRef.current.setLatLng([lat, lng]);
      }

      onUpdate?.(progress);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  };

  return (
    <div
      ref={mapRef}
      className="w-full h-full relative"
      style={{ minHeight: '400px' }}
    >
      {/* Indicador de etapa de clic */}
      <div className="absolute top-4 left-4 z-[1000] bg-dark-900/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-anthracite-700 text-sm">
        {clickStage === 'pickup' ? (
          <span className="text-green-400">📍 Haz clic para seleccionar punto de recogida</span>
        ) : (
          <span className="text-red-400">🎯 Haz clic para seleccionar destino</span>
        )}
      </div>
    </div>
  );
}
