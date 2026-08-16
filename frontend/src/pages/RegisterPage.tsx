import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { fieldErrorFor } from '@/utils/apiErrors';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, error, fieldErrors, clearError, isLoading, isAuthenticated, user } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password_confirmation: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'customer' as 'customer' | 'mechanic',
  });
  const [confirmMismatch, setConfirmMismatch] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.roles.includes('administrator') || user.roles.includes('super_admin')) {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.roles.includes('mechanic')) {
        navigate('/mechanic/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  const baseInputCls = 'w-full px-4 py-2.5 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-colors';
  function inputCls(field: string): string {
    return fieldErrorFor(fieldErrors, field)
      ? `${baseInputCls} border-red-600 focus:ring-red-500`
      : `${baseInputCls} border-gray-600 focus:ring-blue-500`;
  }
  function FieldError({ name }: { name: string }) {
    const message = fieldErrorFor(fieldErrors, name);
    if (!message) return null;
    return <p className="mt-1 text-xs text-red-400">{message}</p>;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    clearError();
    setConfirmMismatch(false);
    if (formData.password !== formData.password_confirmation) {
      setConfirmMismatch(true);
      return;
    }
    await register(formData);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 px-4 py-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">P.A.R.C.E</h1>
          <p className="text-gray-400 text-sm">Plataforma de Asistencia Rápida para Conductores en Emergencia</p>
        </div>

        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">Crear Cuenta</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Quiero registrarme como *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'customer' }))}
                  disabled={isLoading}
                  className={`py-2.5 px-4 rounded-lg border text-sm font-medium transition-colors ${
                    formData.role === 'customer'
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  🚗 Cliente
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'mechanic' }))}
                  disabled={isLoading}
                  className={`py-2.5 px-4 rounded-lg border text-sm font-medium transition-colors ${
                    formData.role === 'mechanic'
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  🔧 Mecánico
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-300 mb-1">
                  Nombre *
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={handleChange}
                  className={inputCls('first_name')}
                  placeholder="Juan"
                  disabled={isLoading}
                />
                <FieldError name="first_name" />
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-300 mb-1">
                  Apellido *
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={handleChange}
                  className={inputCls('last_name')}
                  placeholder="García"
                  disabled={isLoading}
                />
                <FieldError name="last_name" />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Correo electrónico *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={inputCls('email')}
                placeholder="tu@correo.com"
                disabled={isLoading}
              />
              <FieldError name="email" />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
                Teléfono <span className="text-gray-500">(opcional)</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className={inputCls('phone')}
                placeholder="+57 300 000 0000"
                disabled={isLoading}
              />
              <FieldError name="phone" />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Contraseña *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={handleChange}
                className={inputCls('password')}
                placeholder="••••••••"
                disabled={isLoading}
              />
              {fieldErrorFor(fieldErrors, 'password') ? (
                <FieldError name="password" />
              ) : (
                <p className="mt-1 text-xs text-gray-500">Mínimo 8 caracteres</p>
              )}
            </div>

            <div>
              <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-300 mb-1">
                Confirmar contraseña *
              </label>
              <input
                id="password_confirmation"
                name="password_confirmation"
                type="password"
                required
                minLength={8}
                value={formData.password_confirmation}
                onChange={handleChange}
                className={inputCls('password_confirmation')}
                placeholder="••••••••"
                disabled={isLoading}
              />
              <FieldError name="password_confirmation" />
              {confirmMismatch && (
                <p className="mt-1 text-xs text-red-400">Las contraseñas no coinciden</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
