import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Camera, Mail, Lock, Car, FileText, Calendar, CreditCard, Save, Star, Clock, MapPin } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

export default function MechanicProfilePage() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    name: 'Juan Andrés',
    email: 'juanandres@example.com',
    password: '********',
    phone: '+57 300 123 4567',
    location: 'Bogotá',
    experience: '5 años',
  });

  const [vehicleData, setVehicleData] = useState({
    licenseCode: 'LCO4548938274',
    vehicleBrand: 'Chevrolet spark',
    model: '2024',
    plate: 'PDF345',
  });

  const serviceHistory = [
    {
      id: 1,
      date: '25 May 2026',
      time: '10:30 AM',
      service: 'Servicio de batería',
      client: 'Carlos Rodríguez',
      location: 'Calle 72 #10-34, Bogotá',
      price: 22500,
      rating: 5,
    },
    {
      id: 2,
      date: '24 May 2026',
      time: '3:45 PM',
      service: 'Cambio de llanta',
      client: 'María González',
      location: 'Av. Caracas #45-67, Bogotá',
      price: 27600,
      rating: 4,
    },
    {
      id: 3,
      date: '24 May 2026',
      time: '11:20 AM',
      service: 'Entrega de gasolina',
      client: 'Juan Pérez',
      location: 'Calle 100 #15-20, Bogotá',
      price: 35400,
      rating: 5,
    },
    {
      id: 4,
      date: '23 May 2026',
      time: '2:15 PM',
      service: 'Servicio técnico',
      client: 'Ana Martínez',
      location: 'Carrera 15 #85-40, Bogotá',
      price: 45000,
      rating: 5,
    },
    {
      id: 5,
      date: '23 May 2026',
      time: '9:00 AM',
      service: 'Cerrajería automotriz',
      client: 'Pedro López',
      location: 'Calle 26 #68-22, Bogotá',
      price: 38000,
      rating: 4,
    },
  ];

  const totalServices = serviceHistory.length;
  const averageRating = (serviceHistory.reduce((acc, service) => acc + service.rating, 0) / totalServices).toFixed(1);
  const totalEarnings = serviceHistory.reduce((acc, service) => acc + service.price, 0);

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Perfil actualizado correctamente');
  };

  const handleVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Información del vehículo actualizada correctamente');
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar isAuthenticated userName={user?.name || 'Mecánico'} hideNavLinks />
      <Sidebar />

      <main className="ml-64 pt-16 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto space-y-6"
        >
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Mi Perfil</h1>
            <p className="text-gray-400">Gestiona tu información personal y de vehículo</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Profile and Vehicle */}
            <div className="space-y-6">
              {/* Profile Information Card */}
              <div className="card p-6 space-y-6">
                <h2 className="text-xl font-bold text-white">Información Personal</h2>

                {/* Profile Photo */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gradient-to-br from-gold-500 to-gold-700 rounded-full flex items-center justify-center">
                        <User className="w-12 h-12 text-anthracite-950" />
                      </div>
                    )}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 p-2 bg-gold-600 hover:bg-gold-700 rounded-full transition-colors"
                    >
                      <Camera className="w-4 h-4 text-anthracite-950" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                  <p className="text-xs text-gray-400 text-center">Haz clic para cambiar foto</p>
                </div>

                {/* Profile Form */}
                <form onSubmit={handleProfileSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-300">
                      <User className="w-3 h-3" />
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="input-field text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-300">
                      <Mail className="w-3 h-3" />
                      Correo
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="input-field text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-300">
                      <Lock className="w-3 h-3" />
                      Contraseña
                    </label>
                    <input
                      type="password"
                      value={profileData.password}
                      onChange={(e) => setProfileData({ ...profileData, password: e.target.value })}
                      className="input-field text-sm"
                    />
                  </div>

                  <button type="submit" className="w-full btn-primary py-2 text-sm flex items-center justify-center gap-2">
                    <Save className="w-4 h-4" />
                    Guardar
                  </button>
                </form>
              </div>

              {/* Vehicle Information Card */}
              <div className="card p-6 space-y-4">
                <h2 className="text-xl font-bold text-white">Vehículo</h2>

                <form onSubmit={handleVehicleSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-300">
                      <FileText className="w-3 h-3" />
                      Licencia
                    </label>
                    <input
                      type="text"
                      value={vehicleData.licenseCode}
                      onChange={(e) => setVehicleData({ ...vehicleData, licenseCode: e.target.value })}
                      className="input-field text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-300">
                      <Car className="w-3 h-3" />
                      Marca
                    </label>
                    <input
                      type="text"
                      value={vehicleData.vehicleBrand}
                      onChange={(e) => setVehicleData({ ...vehicleData, vehicleBrand: e.target.value })}
                      className="input-field text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-300">
                      <Calendar className="w-3 h-3" />
                      Modelo
                    </label>
                    <input
                      type="text"
                      value={vehicleData.model}
                      onChange={(e) => setVehicleData({ ...vehicleData, model: e.target.value })}
                      className="input-field text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-300">
                      <CreditCard className="w-3 h-3" />
                      Placa
                    </label>
                    <input
                      type="text"
                      value={vehicleData.plate}
                      onChange={(e) => setVehicleData({ ...vehicleData, plate: e.target.value })}
                      className="input-field text-sm"
                    />
                  </div>

                  <button type="submit" className="w-full btn-primary py-2 text-sm flex items-center justify-center gap-2">
                    <Save className="w-4 h-4" />
                    Actualizar
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column - History and Stats */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-400">Servicios</p>
                    <Clock className="w-5 h-5 text-gold-500" />
                  </div>
                  <p className="text-3xl font-bold text-white">{totalServices}</p>
                </div>

                <div className="card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-400">Calificación</p>
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  </div>
                  <p className="text-3xl font-bold text-white">{averageRating}</p>
                </div>

                <div className="card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-400">Experiencia</p>
                    <Calendar className="w-5 h-5 text-gold-500" />
                  </div>
                  <p className="text-2xl font-bold text-white">{profileData.experience}</p>
                </div>
              </div>

              {/* Service History */}
              <div className="card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Historial de Servicios</h2>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Total ganado</p>
                    <p className="text-xl font-bold text-gold-500">${totalEarnings.toLocaleString('es-CO')} COP</p>
                  </div>
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {serviceHistory.map((service) => (
                    <div key={service.id} className="card p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white">{service.service}</h3>
                          <p className="text-sm text-gray-400">{service.date} • {service.time}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-bold text-white">{service.rating}.0</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <User className="w-3 h-3 text-gray-500" />
                          <span>{service.client}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <MapPin className="w-3 h-3 text-gray-500" />
                          <span>{service.location}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-anthracite-700 flex items-center justify-between">
                        <span className="text-xs text-gray-400">Ganancia</span>
                        <span className="text-lg font-bold text-gold-500">${service.price.toLocaleString('es-CO')} COP</span>
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
