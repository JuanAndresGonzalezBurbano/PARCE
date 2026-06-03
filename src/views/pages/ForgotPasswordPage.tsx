import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle, Lock, Eye, EyeOff } from 'lucide-react';
import Logo from '../components/Logo';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'password'>('email');
  const navigate = useNavigate();

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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simular verificación de correo
    setTimeout(() => {
      setIsLoading(false);
      setStep('password'); // Pasar al paso de crear nueva contraseña
    }, 2000);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar contraseña
    if (!validatePassword(newPassword)) {
      return;
    }
    
    // Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }
    
    setIsLoading(true);

    // Simular cambio de contraseña
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 2000);
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-anthracite-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Background Gradient */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full bg-gradient-to-br from-dark-900 to-dark-950"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Back Button */}
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver al inicio de sesión
        </Link>

        <div className="card p-8 space-y-6">
          {/* Logo */}
          <div className="flex justify-center">
            <Logo size="md" />
          </div>

          {!isSubmitted ? (
            <>
              {step === 'email' ? (
                <>
                  {/* Header */}
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-white mb-2">¿Olvidaste tu contraseña?</h2>
                    <p className="text-gray-400">
                      Ingresa tu correo para continuar
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    {/* Email Input */}
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                        Correo Electrónico
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
                      <p className="text-xs text-gray-500">
                        Ingresa el correo asociado a tu cuenta
                      </p>
                    </div>

                    {/* Submit Button */}
                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Verificando...
                        </span>
                      ) : (
                        'Continuar'
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  {/* Header */}
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-white mb-2">Crear nueva contraseña</h2>
                    <p className="text-gray-400">
                      Ingresa tu nueva contraseña para {email}
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    {/* New Password Input */}
                    <div className="space-y-2">
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300">
                        Nueva Contraseña
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          id="newPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            setPasswordError('');
                          }}
                          placeholder="••••••••••••••••••••••••"
                          className={`input-field pl-10 pr-10 ${passwordError ? 'border-red-500' : ''}`}
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                        >
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password Input */}
                    <div className="space-y-2">
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                        Confirmar Contraseña
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            setPasswordError('');
                          }}
                          placeholder="••••••••••••••••••••••••"
                          className={`input-field pl-10 pr-10 ${passwordError ? 'border-red-500' : ''}`}
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {passwordError && (
                        <p className="text-xs text-red-400">{passwordError}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        Mínimo 8 caracteres, con al menos una mayúscula o un número
                      </p>
                    </div>

                    {/* Submit Button */}
                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Guardando...
                        </span>
                      ) : (
                        'Cambiar contraseña'
                      )}
                    </button>
                  </form>
                </>
              )}
            </>
          ) : (
            <>
              {/* Success Message */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                {/* Success Icon */}
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-12 h-12 text-anthracite-950" />
                  </div>
                </div>

                {/* Success Text */}
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    ¡Contraseña cambiada!
                  </h3>
                  <p className="text-gray-400 mb-1">
                    Tu contraseña ha sido actualizada exitosamente
                  </p>
                  <p className="text-gold-400 font-semibold">{email}</p>
                </div>

                {/* Instructions */}
                <div className="bg-dark-800 border border-anthracite-700 rounded-lg p-4 text-left">
                  <p className="text-sm text-gray-400">
                    Ya puedes iniciar sesión con tu nueva contraseña
                  </p>
                </div>

                {/* Back to Login Button */}
                <button
                  onClick={handleBackToLogin}
                  className="w-full btn-primary"
                >
                  Volver al inicio de sesión
                </button>
              </motion.div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
