import { useState, FormEvent } from 'react';
import type { DriverLicense, UpdateProfileRequest, LicenseStatus } from '@/types/auth';
import { fieldErrorFor as sharedFieldErrorFor } from '@/utils/apiErrors';

interface DriverLicenseSectionProps {
  license: DriverLicense | undefined;
  onSave: (data: UpdateProfileRequest) => Promise<boolean>;
  isLoading: boolean;
  // Error real de la última actualización de perfil (compartido con el resto
  // de AuthContext) — reemplaza el mensaje genérico que se mostraba antes.
  error: string | null;
  fieldErrors: Record<string, string | string[]> | null;
  clearError: () => void;
}

/** Etiqueta y color por estado de la licencia */
const STATUS_CONFIG: Record<LicenseStatus, { label: string; className: string }> = {
  not_set:       { label: 'Sin registrar',        className: 'bg-gray-600 text-gray-300' },
  valid:         { label: 'Vigente',               className: 'bg-green-600 text-green-100' },
  expiring_soon: { label: 'Por vencer (≤30 días)', className: 'bg-yellow-600 text-yellow-100' },
  expired:       { label: 'Vencida',              className: 'bg-red-600 text-red-100' },
};

/**
 * DriverLicenseSection — PARCE
 *
 * Sección del perfil de usuario para registrar la licencia de conducción.
 * Principalmente usada por mecánicos — el sistema bloquea la aceptación
 * de solicitudes si la licencia está vencida.
 *
 * Muestra el estado calculado por el backend ('valid', 'expiring_soon', 'expired')
 * y permite actualizar el número, fecha de vencimiento y URL del documento.
 */
export default function DriverLicenseSection({ license, onSave, isLoading, error, fieldErrors, clearError }: DriverLicenseSectionProps) {
  const [editing, setEditing]       = useState(false);
  const [formData, setFormData]     = useState({
    driver_license_number:           license?.number           ?? '',
    driver_license_expiration_date:  license?.expirationDate   ?? '',
    driver_license_document_url:     license?.documentUrl      ?? '',
  });

  const status        = license?.status ?? 'not_set';
  const statusConfig  = STATUS_CONFIG[status];

  function fieldErrorFor(field: string): string | undefined {
    return sharedFieldErrorFor(fieldErrors, field);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const payload: UpdateProfileRequest = {};
    if (formData.driver_license_number.trim())
      payload.driver_license_number = formData.driver_license_number.trim();
    if (formData.driver_license_expiration_date)
      payload.driver_license_expiration_date = formData.driver_license_expiration_date;
    if (formData.driver_license_document_url.trim())
      payload.driver_license_document_url = formData.driver_license_document_url.trim();

    const success = await onSave(payload);
    if (success) {
      setEditing(false);
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
      {/* Cabecera */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-white">Licencia de Conducción</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Requerida para mecánicos. El sistema bloquea la aceptación de solicitudes
            si la licencia está vencida.
          </p>
        </div>
        {/* Badge de estado */}
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusConfig.className}`}>
          {statusConfig.label}
        </span>
      </div>

      {/* Datos actuales (modo lectura) */}
      {!editing && (
        <div className="space-y-2 mb-4">
          <div className="flex gap-2 text-sm">
            <span className="text-gray-400 w-36">Número:</span>
            <span className="text-white">{license?.number ?? '—'}</span>
          </div>
          <div className="flex gap-2 text-sm">
            <span className="text-gray-400 w-36">Vencimiento:</span>
            <span className={`font-medium ${
              status === 'expired'       ? 'text-red-400'    :
              status === 'expiring_soon' ? 'text-yellow-400' :
              'text-white'
            }`}>
              {license?.expirationDate
                ? new Date(license.expirationDate + 'T00:00:00').toLocaleDateString('es-CO')
                : '—'}
            </span>
          </div>
          {license?.documentUrl && (
            <div className="flex gap-2 text-sm">
              <span className="text-gray-400 w-36">Documento:</span>
              <a
                href={license.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline truncate"
              >
                Ver documento ↗
              </a>
            </div>
          )}
          {license?.uploadedAt && (
            <div className="flex gap-2 text-sm">
              <span className="text-gray-400 w-36">Subido el:</span>
              <span className="text-gray-300">
                {new Date(license.uploadedAt).toLocaleDateString('es-CO')}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Alertas de estado */}
      {status === 'expired' && !editing && (
        <div className="mb-4 px-3 py-2 bg-red-900/40 border border-red-700 rounded-lg text-xs text-red-300">
          ⚠️ Tu licencia está vencida. No podrás aceptar solicitudes hasta renovarla.
        </div>
      )}
      {status === 'expiring_soon' && !editing && (
        <div className="mb-4 px-3 py-2 bg-yellow-900/40 border border-yellow-700 rounded-lg text-xs text-yellow-300">
          ⚠️ Tu licencia vence en 30 días o menos. Renuévala pronto.
        </div>
      )}

      {/* Formulario de edición */}
      {editing && (
        <form onSubmit={handleSubmit} className="space-y-3 mb-4">
          {error && (
            <p className="text-xs text-red-400 bg-red-900/30 border border-red-700 rounded px-3 py-2">
              {error}
            </p>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Número de licencia
            </label>
            <input
              type="text"
              value={formData.driver_license_number}
              onChange={(e) => setFormData({ ...formData, driver_license_number: e.target.value })}
              className={inputClass('driver_license_number')}
              disabled={isLoading}
              placeholder="ej. 12345678"
            />
            {fieldErrorFor('driver_license_number') && (
              <p className="text-xs text-red-400 mt-1">{fieldErrorFor('driver_license_number')}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Fecha de vencimiento
            </label>
            <input
              type="date"
              value={formData.driver_license_expiration_date}
              onChange={(e) => setFormData({ ...formData, driver_license_expiration_date: e.target.value })}
              className={inputClass('driver_license_expiration_date')}
              disabled={isLoading}
            />
            {fieldErrorFor('driver_license_expiration_date') && (
              <p className="text-xs text-red-400 mt-1">{fieldErrorFor('driver_license_expiration_date')}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              URL del documento escaneado
            </label>
            <input
              type="url"
              value={formData.driver_license_document_url}
              onChange={(e) => setFormData({ ...formData, driver_license_document_url: e.target.value })}
              className={inputClass('driver_license_document_url')}
              disabled={isLoading}
              placeholder="https://..."
            />
            {fieldErrorFor('driver_license_document_url') ? (
              <p className="text-xs text-red-400 mt-1">{fieldErrorFor('driver_license_document_url')}</p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">
                Suba el documento a S3/Cloudinary y pegue la URL aquí.
              </p>
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
              onClick={() => { setEditing(false); clearError(); }}
              disabled={isLoading}
              className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Botón de edición */}
      {!editing && (
        <button
          onClick={() => { clearError(); setEditing(true); }}
          className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {license?.number ? 'Actualizar licencia' : 'Registrar licencia'}
        </button>
      )}
    </div>
  );
}
