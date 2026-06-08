import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../../controllers/AuthContext';

// Credenciales predefinidas por rol para pruebas
const ROLE_ACCOUNTS: Record<string, { role: 'admin' | 'user' | 'mechanic'; name: string; redirect: string }> = {
  'admin@parce.com':    { role: 'admin',    name: 'Administrador',  redirect: '/dashboard' },
  'usuario@parce.com':  { role: 'user',     name: 'Carlos Rodríguez', redirect: '/home' },
  'mecanico@parce.com': { role: 'mechanic', name: 'Roberto Silva',  redirect: '/mechanic-home' },
};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar contraseña
    if (password.length < 8) {
      setPasswordError('La contraseña debe tener mínimo 8 caracteres');
      return;
    }
    if (!/[A-Z]/.test(password) && !/[0-9]/.test(password)) {
      setPasswordError('La contraseña debe contener al menos una mayúscula o un número');
      return;
    }
    
    setPasswordError('');
    const account = ROLE_ACCOUNTS[email.toLowerCase()];
    if (account) {
      login(email, password, account.role, account.name);
      navigate(account.redirect);
    } else {
      // Cualquier otro email → selección de rol
      login(email, password);
      navigate('/role-selection');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full bg-gradient-to-br from-dark-900 to-dark-950" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="card p-8 space-y-6">
          <div className="flex justify-center">
            <Logo size="md" />
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">Iniciar Sesión</h2>
            <p className="text-gray-400">Accede a tu cuenta de P.A.R.C.E</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">Correo</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input id="email" type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="input-field pl-10" required />
              </div>
            </div>

            {/* Contraseña */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input id="password" type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    setPasswordError('');
                  }}
                  placeholder="••••••••••••"
                  className={`input-field pl-10 pr-10 ${passwordError ? 'border-red-500 focus:border-red-500' : ''}`}
                  required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {passwordError ? (
                <p className="text-xs text-red-400">{passwordError}</p>
              ) : (
                <p className={`text-xs transition-colors ${
                  password.length === 0 ? 'text-gray-500' :
                  password.length >= 8 && (/[A-Z]/.test(password) || /[0-9]/.test(password))
                    ? 'text-green-400' : 'text-red-400'
                }`}>
                  Mínimo 8 caracteres, con al menos una mayúscula o un número
                </p>
              )}
              <Link to="/forgot-password" className="block text-right text-xs text-gray-500 hover:text-gray-300 transition-colors">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button type="submit" className="w-full btn-primary">Iniciar Sesión</button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-anthracite-800" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-dark-900 text-gray-500">¿No tienes cuenta?</span>
            </div>
          </div>

          <Link to="/register" className="block text-center text-primary-400 hover:text-primary-300 transition-colors">
            Crear una cuenta nueva
          </Link>
          <Link to="/" className="block text-center text-gray-500 hover:text-gray-300 transition-colors text-sm">
            Volver al inicio
          </Link>

          {/* Credenciales de prueba */}
          <div className="p-3 bg-dark-800/60 border border-anthracite-700 rounded-lg">
            <p className="text-xs text-gray-500 font-medium mb-1.5">Accesos de prueba:</p>
            <div className="space-y-1 text-xs">
              <p><span className="text-gold-400">Admin:</span> <span className="text-gray-400">admin@parce.com</span></p>
              <p><span className="text-blue-400">Usuario:</span> <span className="text-gray-400">usuario@parce.com</span></p>
              <p><span className="text-green-400">Mecánico:</span> <span className="text-gray-400">mecanico@parce.com</span></p>
              <p className="text-gray-600 mt-1">Contraseña: cualquiera</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
