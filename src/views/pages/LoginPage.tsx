import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../../controllers/AuthContext';

// Credenciales de prueba por rol
const ROLE_ACCOUNTS: Record<string, { role: 'admin' | 'user' | 'mechanic'; name: string; redirect: string }> = {
  'admin@parce.com':    { role: 'admin',    name: 'Administrador',    redirect: '/dashboard' },
  'usuario@parce.com':  { role: 'user',     name: 'Carlos Rodríguez', redirect: '/home' },
  'mecanico@parce.com': { role: 'mechanic', name: 'Roberto Silva',    redirect: '/mechanic-home' },
};

// ── Validadores inline ───────────────────────────────────────────────────────
function validateEmail(value: string): string {
  if (!value) return 'El correo es requerido';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Ingresa un correo válido (ej: nombre@dominio.com)';
  return '';
}

function validatePassword(value: string): string {
  if (!value) return 'La contraseña es requerida';
  if (value.length < 8) return 'La contraseña debe tener mínimo 8 caracteres';
  if (!/[A-Z]/.test(value) && !/[0-9]/.test(value)) return 'Debe contener al menos una mayúscula o un número';
  return '';
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touchedEmail, setTouchedEmail] = useState(false);
  const [touchedPassword, setTouchedPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();
  const { login, loginMock, error: authError, user } = useAuth();

  const emailErr = validateEmail(email);
  const passwordErr = validatePassword(password);
  const isFormValid = !emailErr && !passwordErr;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouchedEmail(true);
    setTouchedPassword(true);
    setLoginError('');
    if (!isFormValid) return;

    // Intentar login real contra la API PHP
    const ok = await login(email, password);
    if (ok) {
      // Login exitoso - esperar un momento para que el contexto se actualice
      // y luego redirigir según el rol
      setTimeout(() => {
        const savedUser = localStorage.getItem('parce_user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          console.log('✅ Login exitoso. Rol del usuario:', parsedUser.role);
          
          // Redirigir según el rol del usuario autenticado
          if (parsedUser.role === 'admin') {
            console.log('🔀 Redirigiendo a /dashboard');
            navigate('/dashboard');
          } else if (parsedUser.role === 'mechanic') {
            console.log('🔀 Redirigiendo a /mechanic-home');
            navigate('/mechanic-home');
          } else {
            console.log('🔀 Redirigiendo a /home');
            navigate('/home');
          }
        }
      }, 100);
      return;
    }
    
    // Si el login falló, mostrar error
    setLoginError(authError || 'Credenciales incorrectas. Verifica tu email y contraseña.');
  };

  // Clases de input con estado visual
  const inputClass = (touched: boolean, err: string) =>
    `input-field pl-10 ${touched && err ? 'border-red-500 focus:border-red-500' : touched && !err ? 'border-green-500/50' : ''}`;

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-anthracite-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="relative w-full max-w-md">
        <div className="card p-8 space-y-6">
          <div className="flex justify-center"><Logo size="md" /></div>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">Iniciar Sesión</h2>
            <p className="text-gray-400">Accede a tu cuenta de P.A.R.C.E</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Error general de login */}
            {loginError && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{loginError}</p>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">Correo electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input id="email" type="email" value={email}
                  onChange={e => { setEmail(e.target.value); setLoginError(''); }}
                  onBlur={() => setTouchedEmail(true)}
                  placeholder="example@gmail.com"
                  className={inputClass(touchedEmail, emailErr)}
                  required />
                {touchedEmail && !emailErr && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
                )}
              </div>
              {touchedEmail && emailErr && (
                <p className="flex items-center gap-1 text-xs text-red-400">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />{emailErr}
                </p>
              )}
            </div>

            {/* Contraseña */}
            <div className="space-y-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input id="password" type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => { setPassword(e.target.value); setLoginError(''); }}
                  onBlur={() => setTouchedPassword(true)}
                  placeholder="••••••••••••"
                  className={`${inputClass(touchedPassword, passwordErr)} pr-10`}
                  required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {touchedPassword && passwordErr ? (
                <p className="flex items-center gap-1 text-xs text-red-400">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />{passwordErr}
                </p>
              ) : touchedPassword && !passwordErr ? (
                <p className="flex items-center gap-1 text-xs text-green-400">
                  <CheckCircle className="w-3 h-3 flex-shrink-0" />Contraseña válida
                </p>
              ) : (
                <p className="text-xs text-gray-500">Mínimo 8 caracteres, con mayúscula o número</p>
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

          <Link to="/register" className="block text-center text-gold-400 hover:text-gold-300 transition-colors">
            Crear una cuenta nueva
          </Link>
          <Link to="/" className="block text-center text-gray-500 hover:text-gray-300 transition-colors text-sm">
            Volver al inicio
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
