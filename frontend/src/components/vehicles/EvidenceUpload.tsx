import { useState, FormEvent } from 'react';
import type { ServiceRequestEvidence, AddEvidenceRequest } from '@/types/serviceRequest';

interface EvidenceUploadProps {
  serviceRequestId: number;
  existingEvidences: ServiceRequestEvidence[];
  onAdd?: (data: AddEvidenceRequest) => Promise<boolean>;
  isLoading?: boolean;
  /** Cuando es true, solo muestra las evidencias registradas (sin formulario de carga). Vista del cliente. */
  readOnly?: boolean;
  /**
   * Mensaje de error real devuelto por el backend en el último intento
   * fallido (URL/extensión inválida, estado de la solicitud no permite
   * evidencias, no asignado, etc. — ver ServiceRequestEvidenceService). El
   * llamador es responsable de limpiarlo antes de cada nuevo intento.
   */
  serverError?: string | null;
}

const EVIDENCE_TYPE_LABELS: Record<string, string> = {
  before: 'Antes del servicio',
  during: 'Durante el servicio',
  after:  'Después del servicio',
};

const EVIDENCE_TYPE_COLORS: Record<string, string> = {
  before: 'bg-yellow-500/20 text-yellow-300 border-yellow-600',
  during: 'bg-blue-500/20   text-blue-300  border-blue-600',
  after:  'bg-green-500/20  text-green-300 border-green-600',
};

/**
 * EvidenceUpload — PARCE
 *
 * Permite al mecánico asignado registrar evidencias fotográficas
 * clasificadas en 3 momentos: antes, durante y después del servicio.
 *
 * El componente recibe las evidencias ya cargadas y muestra un formulario
 * para agregar nuevas. La URL de la imagen debe haberse subido previamente
 * a un servicio externo (S3, Cloudinary, etc.).
 */
export default function EvidenceUpload({
  existingEvidences,
  onAdd,
  isLoading = false,
  readOnly = false,
  serverError = null,
}: EvidenceUploadProps) {
  const [formData, setFormData] = useState<AddEvidenceRequest>({
    evidence_type: 'before',
    image_url: '',
    original_filename: '',
    file_size: undefined,
  });
  // Validación local (antes de llamar al backend). El error del backend
  // llega por separado vía `serverError` — se muestra el que aplique.
  const [clientError, setClientError] = useState<string | null>(null);
  const error = clientError ?? serverError;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setClientError(null);

    if (!onAdd) return;

    if (!formData.image_url.trim()) {
      setClientError('La URL de la imagen es requerida');
      return;
    }

    const payload: AddEvidenceRequest = {
      evidence_type: formData.evidence_type,
      image_url: formData.image_url.trim(),
    };
    if (formData.original_filename?.trim()) {
      payload.original_filename = formData.original_filename.trim();
    }
    if (formData.file_size) {
      payload.file_size = formData.file_size;
    }

    const success = await onAdd(payload);
    if (success) {
      // Limpiar formulario después de agregar
      setFormData({ evidence_type: 'before', image_url: '', original_filename: '', file_size: undefined });
    }
  }

  const inputClass =
    'w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50';

  return (
    <div className="space-y-6">

      {/* ---- Evidencias existentes ---- */}
      {existingEvidences.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-300 mb-3">
            Evidencias registradas ({existingEvidences.length})
          </h4>
          <div className="space-y-2">
            {existingEvidences.map((ev) => (
              <div
                key={ev.id}
                className={`flex items-start gap-3 p-3 border rounded-lg ${EVIDENCE_TYPE_COLORS[ev.evidenceType]}`}
              >
                {/* Miniatura si la URL es una imagen accesible */}
                <img
                  src={ev.imageUrl}
                  alt={ev.originalFilename ?? ev.evidenceType}
                  className="w-14 h-14 object-cover rounded-md border border-gray-600 flex-shrink-0 bg-gray-700"
                  onError={(e) => {
                    // Si la imagen no carga mostrar un placeholder
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="min-w-0 flex-1">
                  <span className="inline-block text-xs font-medium mb-1">
                    {EVIDENCE_TYPE_LABELS[ev.evidenceType]}
                  </span>
                  {ev.originalFilename && (
                    <p className="text-xs text-gray-400 truncate">{ev.originalFilename}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(ev.createdAt).toLocaleString('es-CO')}
                    {ev.fileSize && ` · ${(ev.fileSize / 1024).toFixed(1)} KB`}
                  </p>
                  <a
                    href={ev.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:underline mt-0.5 block truncate"
                  >
                    Ver imagen ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {existingEvidences.length === 0 && readOnly && (
        <p className="text-sm text-gray-400">
          El mecánico aún no ha registrado evidencias fotográficas para esta solicitud.
        </p>
      )}

      {/* ---- Formulario para agregar nueva evidencia ---- */}
      {!readOnly && onAdd && (
      <form onSubmit={handleSubmit} className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-300">Agregar nueva evidencia</h4>

        {error && (
          <p className="text-xs text-red-400 bg-red-900/30 border border-red-700 rounded px-3 py-2">
            {error}
          </p>
        )}

        {/* Tipo de evidencia */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Momento *</label>
          <select
            value={formData.evidence_type}
            onChange={(e) => setFormData({ ...formData, evidence_type: e.target.value as any })}
            className={inputClass}
            disabled={isLoading}
          >
            <option value="before">Antes del servicio</option>
            <option value="during">Durante el servicio</option>
            <option value="after">Después del servicio</option>
          </select>
        </div>

        {/* URL de imagen */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            URL de la imagen * (jpg, jpeg, png, webp)
          </label>
          <input
            type="url"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            className={inputClass}
            disabled={isLoading}
            placeholder="https://..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Suba la foto a S3/Cloudinary y pegue la URL aquí.
          </p>
        </div>

        {/* Nombre original (opcional) */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Nombre del archivo (opcional)
          </label>
          <input
            type="text"
            value={formData.original_filename ?? ''}
            onChange={(e) => setFormData({ ...formData, original_filename: e.target.value })}
            className={inputClass}
            disabled={isLoading}
            placeholder="foto_motor.jpg"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !formData.image_url}
          className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {isLoading ? 'Guardando...' : 'Agregar evidencia'}
        </button>
      </form>
      )}
    </div>
  );
}
