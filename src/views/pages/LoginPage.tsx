import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../../controllers/AuthContext';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  // Función que valida la contraseña
  const validatePassword = (pwd: string): boolean => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar contraseña antes de enviar
    if (!validatePassword(password)) {
      return;
    }
    
    // Simular login y redirigir a selección de rol
    login(email, password);
    navigate('/role-selection');
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Car Background Image Placeholder */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full bg-gradient-to-br from-dark-900 to-dark-950"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="card p-8 space-y-6">
          {/* Logo */}
          <div className="flex justify-center">
            <Logo size="md" />
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">Iniciar Sesión</h2>
            <p className="text-gray-400">Accede a tu cuenta de P.A.R.C.E</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Correo
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    // Validar mientras escribe
                    if (e.target.value.length > 0) {
                      validatePassword(e.target.value);
                    } else {
                      setPasswordError('');
                    }
                  }}
                  placeholder="••••••••••••••••••••••••"
                  className={`input-field pl-10 pr-10 ${passwordError ? 'border-red-500' : ''}`}
                  required
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
              {!passwordError && password.length > 0 && (
                <p className="text-xs text-green-400">✓ Contraseña válida</p>
              )}
              {!password && (
                <p className="text-xs text-gray-500">
                  Mínimo 8 caracteres, con al menos una mayúscula o un número
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button type="submit" className="w-full btn-primary">
              Iniciar Sesión
            </button>
          </form>

          {/* Forgot Password Link */}
          <div className="text-center">
            <Link to="/forgot-password" className="text-sm text-gold-400 hover:text-gold-300 transition-colors">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {/* Back to Home */}
          <Link to="/" className="block text-center text-gray-500 hover:text-gray-300 transition-colors text-sm">
            Volver al inicio
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
