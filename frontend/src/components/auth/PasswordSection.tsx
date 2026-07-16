import { useState, FormEvent } from 'react';
import { authService } from '@/services/authService';
import type { ChangePasswordRequest } from '@/types/auth';

// El backend convierte las claves de error a camelCase (ver ResponseFormatter::convertToCamelCase)
function toCamelCase(snakeKey: string): string {
  return snakeKey.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

const EMPTY_FORM: ChangePasswordRequest = {
  current_password: '',
  new_password: '',
  new_password_confirmation: '',
};

/**
 * PasswordSection — PARCE
 *
 * Sección del perfil para cambiar la contraseña. Requiere la contraseña
 * actual; al tener éxito, el backend cierra la sesión en todos los demás
 * dispositivos (esta pestaña se mantiene autenticada).
 */
export default function PasswordSection() {
  const [editing, setEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<ChangePasswordRequest>(EMPTY_FORM);

  function fieldErrorFor(field: string): string | undefined {
    if (!fieldErrors) return undefined;
    return fieldErrors[toCamelCase(field)];
  }

  function resetForm() {
    setFormData(EMPTY_FORM);
    setError(null);
    setFieldErrors(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setFieldErrors(null);

    try {
      const response = await authService.changePassword(formData);

      if (response.success) {
        setEditing(false);
        setFormData(EMPTY_FORM);
        setSuccessMessage('Contraseña actualizada. Se cerró la sesión en tus otros dispositivos.');
        setTimeout(() => setSuccessMessage(null), 6000);
      } else {
        setError(response.error);
        setFieldErrors(response.fields ?? null);
      }
    } catch {
      setError('No se pudo cambiar la contraseña. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }

  const inputClass = (field: string) =>
    `w-full px-3 py-2 bg-gray-700 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 disabled:opacity-50 ${
      fieldErrorFor(field)
        ? 'border-red-600 focus:ring-red-500'
        : 'border-gray-600 focus:ring-blue-500'
    }`;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-white">Contraseña</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Cambiar tu contraseña cerrará la sesión en tus otros dispositivos.
          </p>
        </div>
      </div>

      {successMessage && !editing && (
        <div className="mb-4 px-3 py-2 bg-green-900/40 border border-green-700 rounded-lg text-xs text-green-300">
          {successMessage}
        </div>
      )}

      {editing && (
        <form onSubmit={handleSubmit} className="space-y-3 mb-4">
          {error && (
            <p className="text-xs text-red-400 bg-red-900/30 border border-red-700 rounded px-3 py-2">
              {error}
            </p>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Contraseña actual
            </label>
            <input
              type="password"
              value={formData.current_password}
              onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
              className={inputClass('current_password')}
              disabled={isLoading}
              autoComplete="current-password"
            />
            {fieldErrorFor('current_password') && (
              <p className="text-xs text-red-400 mt-1">{fieldErrorFor('current_password')}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Nueva contraseña
            </label>
            <input
              type="password"
              value={formData.new_password}
              onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
              className={inputClass('new_password')}
              disabled={isLoading}
              autoComplete="new-password"
            />
            {fieldErrorFor('new_password') && (
              <p className="text-xs text-red-400 mt-1">{fieldErrorFor('new_password')}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Confirmar nueva contraseña
            </label>
            <input
              type="password"
              value={formData.new_password_confirmation}
              onChange={(e) => setFormData({ ...formData, new_password_confirmation: e.target.value })}
              className={inputClass('new_password_confirmation')}
              disabled={isLoading}
              autoComplete="new-password"
            />
            {fieldErrorFor('new_password_confirmation') && (
              <p className="text-xs text-red-400 mt-1">{fieldErrorFor('new_password_confirmation')}</p>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {isLoading ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={() => { setEditing(false); resetForm(); }}
              disabled={isLoading}
              className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {!editing && (
        <button
          onClick={() => { setEditing(true); setSuccessMessage(null); }}
          className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Cambiar contraseña
        </button>
      )}
    </div>
  );
}
