import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Camera, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../../controllers/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [formData, setFormData] = useState({
    name: 'Juan Burbano',
    email: 'example@gmail.com',
    password: '',
    role: 'Usuario/Mecanico',
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Función que valida la contraseña
  const validatePassword = (pwd: string): boolean => {
    if (pwd.length === 0) {
      setPasswordError('');
      return true; // Permitir campo vacío (no cambiar contraseña)
    }
    
    // Mínimo 8 caracteres
    if (pwd.length < 8) {
      setPasswordError('La contraseña debe tener mínimo 8 caracteres');
      return false;
    }
    
    // Debe tener al menos una mayúscula O un número
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    
    if (!hasUpperCase && !hasNumber) {
      setPasswordError('La contraseña debe contener al menos una mayúscula o un número');
      return false;
    }
    
    setPasswordError('');
    return true;
  };

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

  const handleRemoveImage = () => {
    setProfileImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar contraseña solo si no está vacía
    if (formData.password && !validatePassword(formData.password)) {
      return;
    }
    
    // Show success message
    alert('Perfil actualizado correctamente');
  };

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
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Correo Electronico
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Contraseña
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
              >
                Actualizar cambios
              </button>

              {/* Delete Account */}
              <button
                type="button"
                className="w-full py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors border border-red-600/50"
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
