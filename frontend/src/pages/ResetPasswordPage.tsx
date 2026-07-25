import { useState, FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '@/services/authService';

function toCamelCase(snakeKey: string): string {
  return snakeKey.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(null);
  const [success, setSuccess] = useState(false);

  function fieldErrorFor(snakeKey: string): string | undefined {
    return fieldErrors?.[toCamelCase(snakeKey)];
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors(null);
    setIsLoading(true);
    try {
      const response = await authService.resetPassword(token, newPassword, confirmPassword);
      if (response.success) {
        setSuccess(true);
        setTimeout(() => navigate('/login', { replace: true }), 2500);
      } else {
        setError(response.error);
        setFieldErrors(response.fields ?? null);
      }
    } catch {
      setError('No se pudo restablecer la contraseña. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 px-4">
        <div className="max-w-md w-full">
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">Enlace inválido</h2>
            <p className="text-gray-400 text-sm mb-6">
              Este enlace de recuperación no incluye un token válido. Solicita uno nuevo.
            </p>
            <Link
              to="/forgot-password"
              className="block w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Solicitar nuevo enlace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">P.A.R.C.E</h1>
        </div>

        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">Restablecer contraseña</h2>

          {success ? (
            <div className="p-3 bg-green-900/50 border border-green-700 rounded-lg text-green-200 text-sm">
              Tu contraseña fue restablecida correctamente. Redirigiendo a inicio de sesión...
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-1">
                    Nueva contraseña
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                  {fieldErrorFor('new_password') && (
                    <p className="text-red-400 text-xs mt-1">{fieldErrorFor('new_password')}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                    Confirmar nueva contraseña
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                  {fieldErrorFor('new_password_confirmation') && (
                    <p className="text-red-400 text-xs mt-1">{fieldErrorFor('new_password_confirmation')}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                >
                  {isLoading ? 'Restableciendo...' : 'Restablecer contraseña'}
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
