import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '@/services/authService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const response = await authService.forgotPassword(email);
      if (response.success) {
        setSent(true);
      } else {
        setError(response.error);
      }
    } catch {
      setError('No se pudo procesar la solicitud. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">P.A.R.C.E</h1>
          <p className="text-gray-400 text-sm">Plataforma de Asistencia Rápida para Conductores en Emergencia</p>
        </div>

        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-2">Recuperar contraseña</h2>

          {sent ? (
            <>
              <p className="text-gray-300 text-sm mb-6">
                Si <span className="text-white font-medium">{email}</span> corresponde a una cuenta registrada, recibirás un correo con un enlace para restablecer tu contraseña en unos minutos. El enlace vence en 1 hora.
              </p>
              <Link
                to="/login"
                className="block text-center w-full py-2.5 px-4 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
              >
                Volver a iniciar sesión
              </Link>
            </>
          ) : (
            <>
              <p className="text-gray-400 text-sm mb-6">
                Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="tu@correo.com"
                    disabled={isLoading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                >
                  {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                </button>
              </form>
            </>
          )}

          <p className="mt-6 text-center text-sm text-gray-400">
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              ← Volver a iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
