import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Camera, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../../controllers/AuthContext';
import { authService, getFullName } from '../../services/authService';

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    idNumber: '',
    password: '',
    role: '',
    // Licencia
    licenseNumber: '',
    // Vehículo
    vehicleBrand: '',
    vehicleModel: '',
    vehiclePlate: '',
    vehicleYear: '',
    vehicleColor: '',
    soatNumber: '',
    tecnomecanicaNumber: '',
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar datos del usuario desde el API al montar
  useEffect(() => {
    (async () => {
      try {
        const res = await authService.me();
        if (res.success && res.data) {
          setFormData({
            name: getFullName(res.data),
            email: res.data.email,
            phone: res.data.phone || '',
            idNumber: res.data.id_number || '',
            password: '',
            role: user?.role || 'user',
            // Licencia
            licenseNumber: res.data.driver_license?.number || '',
            // Vehículo
            vehicleBrand: res.data.vehicle?.make || '',
            vehicleModel: res.data.vehicle?.model || '',
            vehiclePlate: res.data.vehicle?.license_plate || '',
            vehicleYear: res.data.vehicle?.year?.toString() || '',
            vehicleColor: res.data.vehicle?.color || '',
            soatNumber: res.data.vehicle?.soat_number || '',
            tecnomecanicaNumber: res.data.vehicle?.tecnomecanica_number || '',
          });
          setProfileImage(res.data.profile_picture_url || null);
        } else {
          alert('Error al cargar el perfil');
        }
      } catch {
        alert('Error de conexión al cargar el perfil');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [user]);

  const validatePassword = (pwd: string): boolean => {
    if (pwd.length === 0) {
      setPasswordError('');
      return true;
    }
    if (pwd.length < 8) {
      setPasswordError('La contraseña debe tener mínimo 8 caracteres');
      return false;
    }
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    if (!hasUpperCase && !hasNumber) {
      setPasswordError('La contraseña debe contener al menos una mayúscula o un número');
      return false;
    }
    setPasswordError('');
    return true;
  };

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

  const handleRemoveImage = () => {
    setProfileImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password && !validatePassword(formData.password)) {
      return;
    }
    
    try {
      // TODO: authService.updateProfile() cuando el backend lo tenga implementado
      await authService.me(); // Por ahora solo verificar que la sesión sigue activa
      
      if (formData.password) {
        // TODO: authService.changePassword() cuando el backend lo tenga
      }
      
      alert('Perfil actualizado correctamente (mock)');
      setFormData(prev => ({ ...prev, password: '' }));
    } catch {
      alert('Error al actualizar el perfil');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar isAuthenticated userName={user?.name || 'Usuario'} />
      <Sidebar />

      <main className="ml-64 pt-16 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>

          <div className="card p-8 space-y-6">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-2">PERFIL</h1>
              <p className="text-gray-400">Gestiona tu información personal</p>
            </div>

            {/* Profile Photo */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gradient-to-br from-gold-500 to-gold-700 rounded-full flex items-center justify-center">
                    <User className="w-16 h-16 text-anthracite-950" />
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-gold-600 hover:bg-gold-700 rounded-full transition-colors"
                >
                  <Camera className="w-5 h-5 text-anthracite-950" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleRemoveImage}
                  className="px-4 py-2 bg-dark-800 hover:bg-dark-700 text-white rounded-lg transition-colors"
                >
                  Quitar foto
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                >
                  Cambiar la foto
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  disabled
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  disabled
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field"
                  disabled
                />
              </div>

              {/* ID Number */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Cédula
                </label>
                <input
                  type="text"
                  value={formData.idNumber}
                  onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                  className="input-field"
                  disabled
                />
              </div>

              {/* License Number */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Licencia de Conducción
                </label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  className="input-field"
                  disabled
                />
              </div>

              {/* Divider */}
              <div className="border-t border-anthracite-800 pt-4 mt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Datos del Vehículo</h3>
              </div>

              {/* Vehicle Brand */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Marca del Vehículo
                </label>
                <input
                  type="text"
                  value={formData.vehicleBrand}
                  onChange={(e) => setFormData({ ...formData, vehicleBrand: e.target.value })}
                  className="input-field"
                  disabled
                />
              </div>

              {/* Vehicle Model */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Modelo del Vehículo
                </label>
                <input
                  type="text"
                  value={formData.vehicleModel}
                  onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                  className="input-field"
                  disabled
                />
              </div>

              {/* Vehicle Plate */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Placa del Vehículo
                </label>
                <input
                  type="text"
                  value={formData.vehiclePlate}
                  onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value })}
                  className="input-field"
                  disabled
                />
              </div>

              {/* Vehicle Year & Color */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Año
                  </label>
                  <input
                    type="text"
                    value={formData.vehicleYear}
                    onChange={(e) => setFormData({ ...formData, vehicleYear: e.target.value })}
                    className="input-field"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Color
                  </label>
                  <input
                    type="text"
                    value={formData.vehicleColor}
                    onChange={(e) => setFormData({ ...formData, vehicleColor: e.target.value })}
                    className="input-field"
                    disabled
                  />
                </div>
              </div>

              {/* SOAT Number */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Número SOAT
                </label>
                <input
                  type="text"
                  value={formData.soatNumber}
                  onChange={(e) => setFormData({ ...formData, soatNumber: e.target.value })}
                  className="input-field"
                  disabled
                />
              </div>

              {/* Tecnomecánica Number */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Número Tecnomecánica
                </label>
                <input
                  type="text"
                  value={formData.tecnomecanicaNumber}
                  onChange={(e) => setFormData({ ...formData, tecnomecanicaNumber: e.target.value })}
                  className="input-field"
                  disabled
                />
              </div>

              {/* Divider */}
              <div className="border-t border-anthracite-800 pt-4 mt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Cambiar Contraseña</h3>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      if (e.target.value.length > 0) {
                        validatePassword(e.target.value);
                      } else {
                        setPasswordError('');
                      }
                    }}
                    placeholder="Dejar vacío para no cambiar"
                    className={`input-field pr-10 ${passwordError ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-xs text-red-400">{passwordError}</p>
                )}
                {!passwordError && formData.password.length > 0 && (
                  <p className="text-xs text-green-400">✓ Contraseña válida</p>
                )}
                {formData.password.length === 0 && (
                  <p className="text-xs text-gray-500">
                    Mínimo 8 caracteres, con al menos una mayúscula o un número
                  </p>
                )}
              </div>

              {/* Role */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Rol que ocupa
                </label>
                <input
                  type="text"
                  value={formData.role}
                  disabled
                  className="input-field bg-dark-800/30 cursor-not-allowed"
                />
              </div>

              {/* Update Button */}
              <button
                type="submit"
                className="w-full btn-primary py-3"
                disabled
              >
                Actualizar cambios
              </button>

              {/* Delete Account */}
              <button
                type="button"
                className="w-full py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors border border-red-600/50"
                disabled
              >
                Eliminar cuenta
              </button>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
