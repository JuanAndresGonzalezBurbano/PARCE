import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Camera, Mail, Lock, Car, FileText, Calendar, CreditCard, Save, Star, Clock, MapPin, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../../controllers/AuthContext';

// ── Validadores colombianos ──────────────────────────────────────────────────
function validateCedula(v: string): string {
  if (!v) return '';
  if (!/^\d+$/.test(v)) return 'La cédula solo debe contener números';
  if (v.length < 6) return 'Mínimo 6 dígitos';
  if (v.length > 10) return 'Máximo 10 dígitos';
  return '';
}

function validatePhone(v: string): string {
  if (!v) return '';
  const digits = v.replace(/[\s\-\+]/g, '');
  const col = digits.startsWith('57') ? digits.slice(2) : digits;
  if (!/^\d{10}$/.test(col)) return 'Número colombiano inválido (10 dígitos, ej: 300 123 4567)';
  if (!col.startsWith('3')) return 'Los celulares colombianos deben empezar por 3';
  return '';
}

function validatePlate(v: string): string {
  if (!v) return '';
  if (!/^[A-Z]{3}[\-]?\d{3}$/.test(v.toUpperCase())) return 'Formato de placa inválido (ej: PDF-345)';
  return '';
}

function validatePassword(v: string): string {
  if (!v) return '';
  if (v.length < 8) return 'Mínimo 8 caracteres';
  if (!/[A-Z]/.test(v) && !/[0-9]/.test(v)) return 'Debe tener mayúscula o número';
  return '';
}

function FieldMsg({ error, ok }: { error: string; ok?: boolean }) {
  if (error) return (
    <p className="flex items-center gap-1 text-xs text-red-400 mt-1">
      <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
    </p>
  );
  if (ok) return (
    <p className="flex items-center gap-1 text-xs text-green-400 mt-1">
      <CheckCircle className="w-3 h-3 flex-shrink-0" />Campo válido
    </p>
  );
  return null;
}

export default function MechanicProfilePage() {
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  // Touched map para mostrar errores solo tras interacción
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const touch = (field: string) => setTouched(prev => ({ ...prev, [field]: true }));

  const [profileData, setProfileData] = useState({
    name: 'Juan Andrés',
    email: 'juanandres@example.com',
    password: '',
    phone: '3001234567',
    cedula: '1023456789',
    location: 'Bogotá',
    experience: '5 años',
  });

  const [vehicleData, setVehicleData] = useState({
    licenseCode: 'LCO4548938274',
    vehicleBrand: 'Chevrolet spark',
    model: '2024',
    plate: 'PDF345',
  });

  // Errores calculados
  const errs = {
    phone:    validatePhone(profileData.phone),
    cedula:   validateCedula(profileData.cedula),
    password: validatePassword(profileData.password),
    plate:    validatePlate(vehicleData.plate),
  };

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
    setTouched(prev => ({ ...prev, phone: true, cedula: true, password: true }));
    if (errs.phone || errs.cedula || errs.password) return;
    alert('Perfil actualizado correctamente');
  };

  const handleVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(prev => ({ ...prev, plate: true }));
    if (errs.plate) return;
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
                      <User className="w-3 h-3" />Nombre
                    </label>
                    <input type="text" value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="input-field text-sm" />
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-300">
                      <Mail className="w-3 h-3" />Correo
                    </label>
                    <input type="email" value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="input-field text-sm" />
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-300">
                      <FileText className="w-3 h-3" />Cédula
                    </label>
                    <input type="text" value={profileData.cedula}
                      onChange={(e) => setProfileData({ ...profileData, cedula: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      onBlur={() => touch('cedula')}
                      placeholder="1023456789"
                      inputMode="numeric"
                      maxLength={10}
                      className={`input-field text-sm ${touched.cedula && errs.cedula ? 'border-red-500' : touched.cedula && !errs.cedula ? 'border-green-500/50' : ''}`} />
                    <FieldMsg error={touched.cedula ? errs.cedula : ''} ok={touched.cedula && !errs.cedula && !!profileData.cedula} />
                    {!touched.cedula && <p className="text-xs text-gray-500">Solo números, 6–10 dígitos</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-300">
                      <User className="w-3 h-3" />Teléfono
                    </label>
                    <input type="tel" value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value.replace(/[^\d\s\+\-]/g, '').slice(0, 15) })}
                      onBlur={() => touch('phone')}
                      placeholder="300 123 4567"
                      maxLength={15}
                      className={`input-field text-sm ${touched.phone && errs.phone ? 'border-red-500' : touched.phone && !errs.phone ? 'border-green-500/50' : ''}`} />
                    <FieldMsg error={touched.phone ? errs.phone : ''} ok={touched.phone && !errs.phone && !!profileData.phone} />
                    {!touched.phone && <p className="text-xs text-gray-500">Número colombiano (ej: 300 123 4567)</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-300">
                      <Lock className="w-3 h-3" />Contraseña
                    </label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} value={profileData.password}
                        onChange={(e) => setProfileData({ ...profileData, password: e.target.value })}
                        onBlur={() => touch('password')}
                        placeholder="Dejar vacío para no cambiar"
                        className={`input-field text-sm pr-10 ${touched.password && errs.password ? 'border-red-500' : touched.password && !errs.password && profileData.password ? 'border-green-500/50' : ''}`} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {touched.password && profileData.password ? (
                      <FieldMsg error={errs.password} ok={!errs.password} />
                    ) : (
                      <p className="text-xs text-gray-500">Mínimo 8 caracteres, con mayúscula o número</p>
                    )}
                  </div>

                  <button type="submit" className="w-full btn-primary py-2 text-sm flex items-center justify-center gap-2">
                    <Save className="w-4 h-4" />Actualizar cambios
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
                      <CreditCard className="w-3 h-3" />Placa
                    </label>
                    <input type="text" value={vehicleData.plate}
                      onChange={(e) => setVehicleData({ ...vehicleData, plate: e.target.value.toUpperCase().replace(/[^A-Z0-9\-]/g, '').slice(0, 7) })}
                      onBlur={() => touch('plate')}
                      placeholder="PDF-345"
                      maxLength={7}
                      className={`input-field text-sm font-mono ${touched.plate && errs.plate ? 'border-red-500' : touched.plate && !errs.plate ? 'border-green-500/50' : ''}`} />
                    <FieldMsg error={touched.plate ? errs.plate : ''} ok={touched.plate && !errs.plate && !!vehicleData.plate} />
                    {!touched.plate && <p className="text-xs text-gray-500">Formato: ABC-123</p>}
                  </div>

                  <button type="submit" className="w-full btn-primary py-2 text-sm flex items-center justify-center gap-2">
                    <Save className="w-4 h-4" />
                    Actualizar cambios
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
