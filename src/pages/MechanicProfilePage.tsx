import { motion } from 'framer-motion';
import { User, Star, MapPin, Clock, Phone, Wrench, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function MechanicProfilePage() {
  const services = [
    {
      id: 1,
      title: 'Servicio de despinchado para reparar o cambiar llantas pinchadas en el lugar.',
      duration: '1:00 AM',
      price: 'CAMBIO DE ACEITE',
    },
    {
      id: 2,
      title: 'Servicio de cerrajería automotriz para conductores con llaves perdidas o rotas con llaves del vehículo.',
      duration: '1:00 AM',
      price: 'CAMBIO BATERIA',
    },
    {
      id: 3,
      title: 'Servicio de asistencia de batería para vehículos descargados.',
      duration: '1:00 AM',
      price: 'CAMBIO DE LLANTA',
    },
  ];

  const serviceHistory = [
    { time: '1:00 AM', service: 'CAMBIO DE ACEITE' },
    { time: '1:00 AM', service: 'CAMBIO BATERIA' },
    { time: '1:00 AM', service: 'CAMBIO DE LLANTA' },
    { time: '1:00 AM', service: 'CORREO LLANTA' },
  ];

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar isAuthenticated userName="Juan Andrés" />
      <Sidebar />

      <main className="ml-64 pt-16 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto space-y-6"
        >
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="card p-6 space-y-6">
              {/* Profile Photo */}
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 bg-gradient-to-br from-gold-500 to-gold-700 rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-anthracite-950" />
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white">JUAN ANDRÉS</h2>
                  <p className="text-gray-400">MECANICO AUTOMOTRIZ</p>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-300">
                  <MapPin className="w-5 h-5 text-gold-500" />
                  <div>
                    <p className="text-sm text-gray-400">Ubicación</p>
                    <p className="font-medium">Bogotá</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-300">
                  <Clock className="w-5 h-5 text-gold-500" />
                  <div>
                    <p className="text-sm text-gray-400">Años de experiencia</p>
                    <p className="font-medium">5 AÑOS</p>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">SERVICIOS</h3>
                <div className="space-y-2">
                  {serviceHistory.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg">
                      <span className="text-sm text-gray-400">{item.time}</span>
                      <span className="text-sm text-white">{item.service}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Button */}
              <button className="w-full btn-primary flex items-center justify-center gap-2">
                <Phone className="w-5 h-5" />
                Contactar
              </button>
            </div>

            {/* Services and Rating */}
            <div className="lg:col-span-2 space-y-6">
              {/* Rating Card */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">SERVICIOS HOY</h3>
                  <div className="flex items-center gap-2">
                    <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                    <span className="text-2xl font-bold text-white">4.5</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">CALIFICACION</p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < 4 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-500">1320 OPINIONES</p>
                  </div>
                </div>
              </div>

              {/* Services Portfolio */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">PORTAFOLIO</h3>
                  <button className="text-primary-400 hover:text-primary-300 flex items-center gap-1">
                    Ver Más...
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {services.map((service) => (
                    <div key={service.id} className="card overflow-hidden group">
                      <div className="relative h-32 bg-gradient-to-br from-dark-800 to-dark-900 flex items-center justify-center">
                        <Wrench className="w-12 h-12 text-primary-500 group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="p-4 space-y-2">
                        <p className="text-sm text-white line-clamp-2">{service.title}</p>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>{service.duration}</span>
                          <span className="text-primary-400">{service.price}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
