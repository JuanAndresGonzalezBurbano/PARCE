import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, MapPin, Phone, User } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../../controllers/AuthContext';

interface ServiceRequest {
  id: number;
  clientName: string;
  clientPhone: string;
  serviceType: string;
  location: string;
  distance: string;
  time: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export default function MechanicDashboardPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([
    {
      id: 1,
      clientName: 'Carlos Rodríguez',
      clientPhone: '+57 300 123 4567',
      serviceType: 'Servicio de batería',
      location: 'Calle 72 #10-34, Bogotá',
      distance: '2.5 km',
      time: 'Hace 5 minutos',
      status: 'pending',
    },
    {
      id: 2,
      clientName: 'María González',
      clientPhone: '+57 301 987 6543',
      serviceType: 'Cambio de llanta',
      location: 'Av. Caracas #45-67, Bogotá',
      distance: '4.2 km',
      time: 'Hace 12 minutos',
      status: 'pending',
    },
    {
      id: 3,
      clientName: 'Pedro Martínez',
      clientPhone: '+57 302 456 7890',
      serviceType: 'Entrega de gasolina',
      location: 'Calle 100 #15-20, Bogotá',
      distance: '6.8 km',
      time: 'Hace 20 minutos',
      status: 'pending',
    },
  ]);

  const handleAccept = (id: number) => {
    setRequests(requests.map(req => 
      req.id === id ? { ...req, status: 'accepted' as const } : req
    ));
  };

  const handleReject = (id: number) => {
    setRequests(requests.map(req => 
      req.id === id ? { ...req, status: 'rejected' as const } : req
    ));
  };

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const acceptedRequests = requests.filter(req => req.status === 'accepted');

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar isAuthenticated userName={user?.name || 'Mecánico'} hideNavLinks />
      <Sidebar />

      <main className="ml-64 pt-16 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Panel de Mecánico</h1>
            <p className="text-gray-400">Gestiona tus solicitudes de servicio</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Solicitudes Pendientes</p>
                  <p className="text-3xl font-bold text-white mt-2">{pendingRequests.length}</p>
                </div>
                <Clock className="w-12 h-12 text-gold-500" />
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Servicios Aceptados</p>
                  <p className="text-3xl font-bold text-white mt-2">{acceptedRequests.length}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Calificación</p>
                  <p className="text-3xl font-bold text-white mt-2">4.8</p>
                </div>
                <div className="text-yellow-500 text-2xl">★</div>
              </div>
            </div>
          </div>

          {/* Pending Requests */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Solicitudes Pendientes</h2>
            
            {pendingRequests.length === 0 ? (
              <div className="card p-8 text-center">
                <Clock className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400">No hay solicitudes pendientes en este momento</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {pendingRequests.map((request) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="card p-6"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-white">{request.serviceType}</h3>
                            <p className="text-sm text-gray-500">{request.time}</p>
                          </div>
                          <span className="px-3 py-1 bg-gold-500/20 text-gold-400 rounded-full text-sm">
                            {request.distance}
                          </span>
                        </div>

                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="flex items-center gap-2 text-gray-300">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">{request.clientName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">{request.clientPhone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300 md:col-span-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">{request.location}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex lg:flex-col gap-3">
                        <button
                          onClick={() => handleAccept(request.id)}
                          className="flex-1 lg:flex-none px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Aceptar
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          className="flex-1 lg:flex-none px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-5 h-5" />
                          Rechazar
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Accepted Services */}
          {acceptedRequests.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Servicios Aceptados</h2>
              <div className="grid gap-4">
                {acceptedRequests.map((request) => (
                  <div key={request.id} className="card p-6 border-l-4 border-green-500">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-white">{request.serviceType}</h3>
                        <div className="flex items-center gap-2 text-gray-300">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{request.clientName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{request.location}</span>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                        En progreso
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
