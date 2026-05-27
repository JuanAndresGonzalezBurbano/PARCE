import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Fuel, Battery, Wrench, Car, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

export default function ServicesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);

  const services = [
    {
      id: 1,
      title: 'Servicio de entrega de gasolina para vehículos varados.',
      description: 'Servicio de cerrajería automotriz para conductores con llaves perdidas o rotas con llaves del vehículo.',
      duration: '60-90 minutos',
      icon: Fuel,
      image: '/service-fuel.jpg',
    },
    {
      id: 2,
      title: 'Servicio de despinchado para reparar o cambiar llantas pinchadas en el lugar.',
      description: 'Reparación o cambio de neumáticos en el lugar del incidente.',
      duration: '60-90 minutos',
      icon: Wrench,
      image: '/service-tire.jpg',
    },
    {
      id: 3,
      title: 'Servicio de asistencia de batería para vehículos descargados.',
      description: 'Carga o reemplazo de batería para vehículos con problemas eléctricos.',
      duration: '45 MIN',
      icon: Battery,
      image: '/service-battery.jpg',
    },
    {
      id: 4,
      title: 'Servicio técnico para diagnóstico y reparación de fallas del vehículo.',
      description: 'Diagnóstico completo y reparación de problemas mecánicos.',
      duration: '45 MIN',
      icon: Wrench,
      image: '/service-diagnostic.jpg',
    },
    {
      id: 5,
      title: 'Servicio de cerrajería automotriz para apertura y solución de problemas con llaves del vehículo.',
      description: 'Apertura de vehículos y duplicado de llaves.',
      duration: '45 MIN',
      icon: Car,
      image: '/service-locksmith.jpg',
    },
    {
      id: 6,
      title: 'Servicio que remolca y transporta vehículos averiados o accidentados a un lugar seguro o a un taller.',
      description: 'Transporte de vehículos a talleres o lugares seguros.',
      duration: '45 MIN',
      icon: Car,
      image: '/service-tow.jpg',
    },
  ];

  const itemsPerPage = 3;
  const totalPages = Math.ceil(services.length / itemsPerPage);
  const currentServices = services.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handleServiceSelect = (_serviceId: number) => {
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
            <p className="text-gray-400">Selecciona el servicio que necesitas</p>
          </div>

          {/* Services Grid */}
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentServices.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="card overflow-hidden group cursor-pointer"
                  onClick={() => handleServiceSelect(service.id)}
                >
                  {/* Service Image Placeholder */}
                  <div className="relative h-48 bg-gradient-to-br from-dark-800 to-dark-900 flex items-center justify-center overflow-hidden">
                    <service.icon className="w-24 h-24 text-primary-500 group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-900 to-transparent"></div>
                  </div>

                  {/* Service Info */}
                  <div className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-white line-clamp-2 min-h-[3.5rem]">
                      {service.title}
                    </h3>
                    <p className="text-sm text-gray-400 line-clamp-2">
                      {service.description}
                    </p>

                    {/* Duration */}
                    <div className="flex items-center gap-2 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Tiempo Estimado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-white">{service.duration}</span>
                      <Wrench className="w-5 h-5 text-primary-500" />
                    </div>

                    {/* Action Button */}
                    <button className="w-full btn-primary">
                      PEDIR
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Navigation Arrows */}
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
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        currentPage === index
                          ? 'bg-primary-500'
                          : 'bg-dark-700 hover:bg-dark-600'
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
          </div>
        </motion.div>
      </main>
    </div>
  );
}
