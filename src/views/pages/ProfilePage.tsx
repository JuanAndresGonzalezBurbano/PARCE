import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Camera, ArrowLeft, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../../controllers/AuthContext';
import { authService } from '../../services/authService';

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Inicializa con los datos del usuario actual o valores por defecto editables
  const [formData, setFormData] = useState({
    name:              user?.name  || '',
    email:             user?.email || '',
    phone:             '',
    idNumber:          '',
    password:          '',
    vehicleBrand:      '',
    vehicleModel:      '',
    vehiclePlate:      '',
    vehicleYear:       '',
    vehicleColor:      '',
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        const response = await authService.me();
        
        if (response.success && response.data) {
          const userData = response.data;
          
          // Poblar formulario con datos reales
          setFormData({
            name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
            email: userData.email || '',
            phone: userData.phone || '',
            idNumber: '', // No está disponible en el backend actualmente
            password: '',
            vehicleBrand: userData.vehicle?.make || '',
            vehicleModel: userData.vehicle?.model || '',
            vehiclePlate: userData.vehicle?.licensePlate || '',
            vehicleYear: userData.vehicle?.year?.toString() || '',
            vehicleColor: userData.vehicle?.color || '',
          });
        }
      } catch (error) {
        console.error('Error cargando datos del usuario:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  const validatePassword = (pwd: string): boolean => {
    if (pwd.length === 0) { setPasswordError(''); return true; }
    if (pwd.length < 8) { setPasswordError('Mínimo 8 caracteres'); return false; }
    if (!/[A-Z]/.test(pwd) && !/[0-9]/.test(pwd)) {
      setPasswordError('Debe tener al menos una mayúscula o un número');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setProfileImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password && !validatePassword(formData.password)) return;

    // Guarda en localStorage para persistir el nombre actualizado
    const stored = localStorage.getItem('parce_user');
    if (stored) {
      const parsed = JSON.parse(stored);
      const updated = { ...parsed, name: formData.name, email: formData.email };
      localStorage.setItem('parce_user', JSON.stringify(updated));
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    setFormData(prev => ({ ...prev, password: '' }));
  };

  const field = (
    label: string,
    key: keyof typeof formData,
    type = 'text',
    placeholder = ''
  ) => (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-300">{label}</label>
      <input
        type={type}
        value={formData[key]}
        onChange={e => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
        placeholder={placeholder}
        className="input-field w-full"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar isAuthenticated userName={user?.name || 'Usuario'} />
      <Sidebar />
      <main className="ml-64 pt-16 p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">

          <button onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-5 h-5" /> Volver
          </button>

          {/* Mostrar loading mientras carga datos */}
          {isLoading ? (
            <div className="card p-8 space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-white mb-1">Mi Perfil</h1>
                <p className="text-gray-400 text-sm">Cargando información...</p>
              </div>
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gold-500 border-t-transparent"></div>
              </div>
            </div>
          ) : (
            <div className="card p-8 space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-1">Mi Perfil</h1>
              <p className="text-gray-400 text-sm">Edita y guarda tu información personal</p>
            </div>

            {/* Foto de perfil */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-28 h-28 rounded-full object-cover border-4 border-gold-500/30" />
                ) : (
                  <div className="w-28 h-28 bg-gradient-to-br from-gold-500 to-gold-700 rounded-full flex items-center justify-center border-4 border-gold-500/30">
                    <User className="w-14 h-14 text-anthracite-950" />
                  </div>
                )}
                <button onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-gold-600 hover:bg-gold-700 rounded-full transition-colors shadow-lg">
                  <Camera className="w-4 h-4 text-anthracite-950" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setProfileImage(null)}
                  className="px-4 py-1.5 bg-dark-800 hover:bg-dark-700 text-white text-sm rounded-lg transition-colors">
                  Quitar foto
                </button>
                <button onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg transition-colors">
                  Cambiar foto
                </button>
              </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Datos personales */}
              <div className="border-b border-anthracite-800 pb-1 mb-2">
                <h3 className="text-sm font-semibold text-gold-400 uppercase tracking-wider">Datos personales</h3>
              </div>

              {field('Nombre completo',       'name')}
              {field('Correo electrónico',    'email',    'email')}
              {field('Teléfono',              'phone',    'tel',  '+57 300 000 0000')}
              {field('Cédula',                'idNumber', 'text', '1.000.000.000')}

              {/* Vehículo */}
              <div className="border-b border-anthracite-800 pb-1 mt-6 mb-2">
                <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Datos del vehículo</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {field('Marca',  'vehicleBrand', 'text', 'Ej: Chevrolet')}
                {field('Modelo', 'vehicleModel', 'text', 'Ej: Spark')}
              </div>
              <div className="grid grid-cols-3 gap-4">
                {field('Placa', 'vehiclePlate', 'text', 'ABC-123')}
                {field('Año',   'vehicleYear',  'text', '2020')}
                {field('Color', 'vehicleColor', 'text', 'Gris')}
              </div>

              {/* Contraseña */}
              <div className="border-b border-anthracite-800 pb-1 mt-6 mb-2">
                <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wider">Cambiar contraseña</h3>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-300">Nueva contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={e => {
                      setFormData(prev => ({ ...prev, password: e.target.value }));
                      validatePassword(e.target.value);
                    }}
                    placeholder="Dejar vacío para no cambiar"
                    className={`input-field w-full pr-10 ${passwordError ? 'border-red-500' : ''}`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordError && (
                  <div className="flex items-center gap-1.5 text-xs text-red-400">
                    <AlertCircle className="w-3.5 h-3.5" /> {passwordError}
                  </div>
                )}
                {!passwordError && formData.password.length > 0 && (
                  <p className="text-xs text-green-400">✓ Contraseña válida</p>
                )}
                {formData.password.length === 0 && (
                  <p className="text-xs text-gray-500">Mínimo 8 caracteres, con al menos una mayúscula o un número</p>
                )}
              </div>

              {/* Rol (solo lectura) */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-300">Rol</label>
                <input type="text" value={user?.role === 'user' ? 'Usuario' : user?.role === 'mechanic' ? 'Mecánico' : 'Administrador'}
                  disabled className="input-field w-full bg-dark-800/30 cursor-not-allowed text-gray-500" />
              </div>

              {/* Botones */}
              <div className="space-y-3 pt-2">
                <button type="submit" className="w-full btn-primary py-3 flex items-center justify-center gap-2">
                  {saved ? <><Check className="w-5 h-5" /> ¡Cambios guardados!</> : 'Actualizar cambios'}
                </button>
                <button type="button"
                  className="w-full py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors border border-red-600/50 text-sm font-semibold">
                  Eliminar cuenta
                </button>
              </div>

              {/* Toast éxito */}
              <AnimatePresence>
                {saved && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500/30 rounded-xl text-green-400 text-sm">
                    <Check className="w-4 h-4 flex-shrink-0" />
                    Perfil actualizado correctamente
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
