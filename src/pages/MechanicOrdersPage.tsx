import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, MapPin, Clock, User, Phone, Star } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

interface Order {
  id: number;
  clientName: string;
  clientPhone: string;
  service: string;
  location: string;
  time: string;
  distance: number; // en km
  status: 'pending' | 'accepted' | 'rejected';
}

export default function MechanicOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 1,
      clientName: 'Carlos Rodríguez',
      clientPhone: '+57 300 123 4567',
      service: 'Servicio de batería',
      location: 'Calle 72 #10-34, Bogotá',
      time: 'Hace 5 minutos',
      distance: 2.5,
      status: 'pending',
    },
    {
      id: 2,
      clientName: 'María González',
      clientPhone: '+57 301 987 6543',
      service: 'Cambio de llanta',
      location: 'Av. Caracas #45-67, Bogotá',
      time: 'Hace 12 minutos',
      distance: 4.2,
      status: 'pending',
    },
    {
      id: 3,
      clientName: 'Juan Pérez',
      clientPhone: '+57 310 456 7890',
      service: 'Entrega de gasolina',
      location: 'Calle 100 #15-20, Bogotá',
      time: 'Hace 18 minutos',
      distance: 6.8,
      status: 'pending',
    },
  ]);

  // Calcular precio estimado: $15,000 base + $3,000 por km
  const calculatePrice = (distance: number): number => {
    const basePrice = 15000;
    const pricePerKm = 3000;
    return basePrice + (distance * pricePerKm);
  };

  const handleAccept = (orderId: number) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: 'accepted' as const } : order
    ));
  };

  const handleReject = (orderId: number) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: 'rejected' as const } : order
    ));
  };

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const acceptedOrders = orders.filter(order => order.status === 'accepted');
  const rating = 4.8;

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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Solicitudes Pendientes */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-400 text-sm font-medium">Solicitudes Pendientes</h3>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
              <p className="text-5xl font-bold text-white">{pendingOrders.length}</p>
            </div>

            {/* Servicios Aceptados */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-400 text-sm font-medium">Servicios Aceptados</h3>
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-5xl font-bold text-white">{acceptedOrders.length}</p>
            </div>

            {/* Calificación */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-400 text-sm font-medium">Calificación</h3>
                <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
              </div>
              <p className="text-5xl font-bold text-white">{rating}</p>
            </div>
          </div>

          {/* Pending Orders */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Solicitudes Pendientes</h2>
            
            {pendingOrders.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="text-gray-400">No hay solicitudes pendientes</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingOrders.map((order) => {
                  const estimatedPrice = calculatePrice(order.distance);
                  
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="card p-6"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          {/* Header with service and distance */}
                          <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white">{order.service}</h3>
                            <span className="px-3 py-1 bg-gold-600 text-anthracite-950 rounded-full text-sm font-bold">
                              {order.distance} km
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">{order.time}</p>

                          {/* Client info */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-300">
                              <User className="w-4 h-4 text-gray-500" />
                              <span className="text-sm">{order.clientName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                              <Phone className="w-4 h-4 text-gray-500" />
                              <span className="text-sm">{order.clientPhone}</span>
                            </div>
                            <div className="flex items-start gap-2 text-gray-300">
                              <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                              <span className="text-sm">{order.location}</span>
                            </div>
                          </div>

                          {/* Estimated Price */}
                          <div className="pt-2 border-t border-anthracite-700">
                            <p className="text-sm text-gray-400">Precio estimado</p>
                            <p className="text-2xl font-bold text-gold-500">
                              ${estimatedPrice.toLocaleString('es-CO')} COP
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Base: $15,000 + ${(order.distance * 3000).toLocaleString('es-CO')} ({order.distance} km × $3,000/km)
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex lg:flex-col gap-3">
                          <button
                            onClick={() => handleAccept(order.id)}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex-1 lg:flex-initial"
                          >
                            <Check className="w-5 h-5" />
                            Aceptar
                          </button>
                          <button
                            onClick={() => handleReject(order.id)}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex-1 lg:flex-initial"
                          >
                            <X className="w-5 h-5" />
                            Rechazar
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
