import { motion } from 'framer-motion';
import { MapPin, Clock, User, Star, Phone, Navigation } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function ServiceInProgressPage() {
  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar isAuthenticated userName="Juan Gustavo" />
      <Sidebar />

      <main className="ml-64 pt-16 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto space-y-6"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">SERVICIO EN CURSO</h1>
            <p className="text-gray-400">Tu mecánico está en camino</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Map Section */}
            <div className="card p-6">
              <h3 className="text-xl font-bold text-white mb-4">Navegación</h3>
              
              {/* Map Placeholder */}
              <div className="relative h-80 bg-gradient-to-br from-dark-800 to-dark-900 rounded-lg overflow-hidden mb-4">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <MapPin className="w-16 h-16 mx-auto text-primary-500" />
                    <p className="text-gray-400">Mapa de navegación</p>
                    <div className="flex items-center gap-2 justify-center">
                      <Navigation className="w-5 h-5 text-primary-500" />
                      <span className="text-white font-semibold">4 mi</span>
                      <span className="text-gray-400">405 Freeway</span>
                    </div>
                  </div>
                </div>
                
                {/* Route indicator */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-dark-900/80 backdrop-blur-sm rounded-lg p-3 border border-anthracite-800">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold">Ruta calculada</p>
                        <p className="text-sm text-gray-400">Tiempo estimado: 12 min</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Info */}
            <div className="card p-6">
              <h3 className="text-xl font-bold text-white mb-6">Servicio en curso</h3>

              {/* Mechanic Info */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-white">Maria Gonzales</h4>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 text-yellow-500 fill-yellow-500"
                        />
                      ))}
                      <span className="text-sm text-gray-400 ml-2">(5.0)</span>
                    </div>
                  </div>
                  <button className="p-3 bg-green-600 hover:bg-green-700 rounded-full transition-colors">
                    <Phone className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* Service Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-dark-800/50 rounded-lg">
                    <Clock className="w-5 h-5 text-primary-500" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-400">Tiempo estimado</p>
                      <p className="text-white font-semibold">12 min</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-dark-800/50 rounded-lg">
                    <MapPin className="w-5 h-5 text-primary-500" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-400">Ubicación</p>
                      <p className="text-white font-semibold">Placa: XXX-XXX</p>
                    </div>
                  </div>
                </div>

                {/* Service Type */}
                <div className="p-6 bg-gradient-to-br from-primary-600/20 to-purple-600/20 rounded-lg border border-primary-500/30">
                  <h4 className="text-lg font-semibold text-white mb-2">Recarga de Gasolina</h4>
                  <p className="text-gray-300 text-sm">
                    El mecánico llegará con el combustible necesario para tu vehículo
                  </p>
                </div>

                {/* Progress Indicator */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Progreso del servicio</span>
                    <span className="text-primary-400 font-semibold">En camino</span>
                  </div>
                  <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '60%' }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-primary-500 to-purple-500"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button className="btn-outline">
                    Cancelar
                  </button>
                  <button className="btn-primary">
                    Contactar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
