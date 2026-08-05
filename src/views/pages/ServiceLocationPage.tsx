import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Navigation, ArrowRight, Search, Star, Wrench, Award } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import TripSimulatorMap from '../components/TripSimulatorMap';
import { useAuth } from '../../controllers/AuthContext';
import { useService } from '../../controllers/ServiceContext';
import { searchAddress, GeocodingResult } from '../../services/mapService';

// Mecánico asignado (mock — en producción vendría del backend)
const ASSIGNED_MECHANIC = {
  name: 'Roberto Silva',
  specialty: 'Mecánica General y Eléctrica',
  rating: 4.9,
  servicesCompleted: 87,
  certTitle: 'Técnico en Mecánica Automotriz',
  plate: 'PDF-345',
  phone: '+57 310 111 2222',
  eta: '12 min',
  distance: '3.2 km',
};

export default function ServiceLocationPage() {
  const { user } = useAuth();
  const { selectedService, setSelectedService } = useService();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [locating, setLocating] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<GeocodingResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const [pickupPoint, setPickupPoint] = useState<{ lat: number; lng: number; label: string } | null>(null);
  const [destinationPoint, setDestinationPoint] = useState<{ lat: number; lng: number; label: string } | null>(null);

  const handleAddressChange = async (value: string) => {
    setAddress(value);
    
    if (value.length > 2) {
      setSearching(true);
      const results = await searchAddress(value);
      setFilteredSuggestions(results);
      setShowSuggestions(results.length > 0);
      setSearching(false);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (result: GeocodingResult) => {
    setAddress(result.display_name);
    setPickupPoint({
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      label: result.display_name,
    });
    setShowSuggestions(false);
  };

  const handleCurrentLocation = () => {
    setLocating(true);
    // Simula obtener ubicación GPS
    setTimeout(() => {
      setAddress('Calle 72 #10-34, Chapinero, Bogotá (Ubicación actual)');
      setUseCurrentLocation(true);
      setLocating(false);
      setShowSuggestions(false);
    }, 1500);
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;
    // Guarda la ubicación en el contexto del servicio
    if (selectedService) {
      setSelectedService({ ...selectedService, userLocation: address });
    }
    navigate('/service-in-progress');
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar isAuthenticated userName={user?.name || 'Usuario'} hideNavLinks />
      <Sidebar />

      <main className="ml-64 pt-16 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto space-y-6"
        >
          {/* Encabezado */}
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">¿Dónde estás?</h1>
            <p className="text-gray-400">El mecánico necesita saber tu ubicación para llegar hasta ti</p>
          </div>

          {/* Servicio seleccionado */}
          {selectedService && (
            <div className="card p-4 border border-gold-500/30 bg-gold-500/5">
              <p className="text-xs text-gold-400 font-medium uppercase tracking-wider mb-1">Servicio seleccionado</p>
              <p className="text-white font-bold">{selectedService.title}</p>
              <p className="text-gray-400 text-sm">{selectedService.duration}</p>
            </div>
          )}

          {/* Mecánico asignado */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-gold-500 to-gold-700 rounded-full flex items-center justify-center flex-shrink-0">
                <Wrench className="w-6 h-6 text-anthracite-950" />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Tu mecánico asignado</p>
                <h3 className="text-lg font-bold text-white">{ASSIGNED_MECHANIC.name}</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <div>
                  <p className="text-xs text-gray-400">Calificación</p>
                  <p className="text-white font-bold text-sm">{ASSIGNED_MECHANIC.rating} ★</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-gold-400" />
                <div>
                  <p className="text-xs text-gray-400">Servicios</p>
                  <p className="text-white font-bold text-sm">{ASSIGNED_MECHANIC.servicesCompleted}</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-dark-800/60 rounded-xl border border-anthracite-700">
              <p className="text-xs text-gray-400 mb-1">Especialidad</p>
              <p className="text-white text-sm font-semibold">{ASSIGNED_MECHANIC.specialty}</p>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <Navigation className="w-4 h-4 text-primary-400" />
                <span>Distancia: <span className="text-white font-semibold">{ASSIGNED_MECHANIC.distance}</span></span>
              </div>
              <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">
                ETA: {ASSIGNED_MECHANIC.eta}
              </div>
            </div>
          </div>

          {/* Formulario de ubicación */}
          <form onSubmit={handleConfirm} className="card p-6 space-y-5">
            {/* Botón de ubicación actual */}
            <button
              type="button"
              onClick={handleCurrentLocation}
              disabled={locating}
              className="w-full flex items-center gap-3 p-4 bg-dark-800 hover:bg-dark-700 border border-anthracite-700 hover:border-gold-500/50 rounded-xl transition-all"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                useCurrentLocation ? 'bg-green-500' : 'bg-gold-500/20'
              }`}>
                {locating
                  ? <span className="w-4 h-4 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
                  : <Navigation className={`w-5 h-5 ${useCurrentLocation ? 'text-white' : 'text-gold-400'}`} />
                }
              </div>
              <div className="text-left">
                <p className="text-white font-semibold text-sm">
                  {locating ? 'Obteniendo ubicación...' : useCurrentLocation ? '✓ Usando ubicación actual' : 'Usar mi ubicación actual'}
                </p>
                <p className="text-gray-500 text-xs">Activa el GPS para mayor precisión</p>
              </div>
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-anthracite-700" />
              <span className="text-gray-500 text-sm">o escribe la dirección</span>
              <div className="flex-1 h-px bg-anthracite-700" />
            </div>

            {/* Campo de dirección */}
            <div className="space-y-2 relative">
              <label className="block text-sm font-medium text-gray-300">Dirección exacta</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={address}
                  onChange={e => handleAddressChange(e.target.value)}
                  onFocus={() => address.length > 2 && setShowSuggestions(filteredSuggestions.length > 0)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Ej: Calle 72 #10-34, Bogotá"
                  className="input-field pl-10"
                  required
                />
                {searching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              {/* Sugerencias */}
              {showSuggestions && (
                <div className="absolute z-10 w-full bg-dark-800 border border-anthracite-700 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                  {filteredSuggestions.map((result, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => selectSuggestion(result)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-dark-700 transition-colors text-sm text-gray-300"
                    >
                      <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="line-clamp-2">{result.display_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Información adicional */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Información adicional <span className="text-gray-500">(opcional)</span>
              </label>
              <textarea
                value={additionalInfo}
                onChange={e => setAdditionalInfo(e.target.value)}
                placeholder="Ej: Estoy en el parqueadero del centro comercial, nivel -1, puesto 34..."
                className="input-field resize-none h-24 text-sm"
              />
            </div>

            {/* Mapa interactivo */}
            <div className="rounded-xl overflow-hidden border border-anthracite-700 bg-dark-800 h-96">
              <TripSimulatorMap
                onPickupChange={(point) => {
                  setPickupPoint(point);
                  if (point) {
                    setAddress(point.label);
                  }
                }}
                onDestinationChange={(point) => {
                  setDestinationPoint(point);
                }}
                initialPickup={pickupPoint}
                initialDestination={destinationPoint}
              />
            </div>

            {/* Botón confirmar */}
            <button
              type="submit"
              disabled={!address.trim()}
              className="w-full btn-primary flex items-center justify-center gap-3 py-4 text-lg disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <MapPin className="w-5 h-5" />
              Confirmar ubicación
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
