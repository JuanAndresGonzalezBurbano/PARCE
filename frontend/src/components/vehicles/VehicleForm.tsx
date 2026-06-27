import { useState, FormEvent } from 'react';
import type { Vehicle, CreateVehicleRequest, UpdateVehicleRequest } from '@/types/vehicle';

interface VehicleFormProps {
  vehicle?: Vehicle;
  onSubmit: (data: CreateVehicleRequest | UpdateVehicleRequest) => Promise<boolean>;
  onCancel: () => void;
  isLoading: boolean;
}

/**
 * Formulario de vehículo — PARCE
 *
 * Secciones:
 *  1. Datos básicos (placa, marca, modelo, año, color, tipo, combustible, VIN, apodo)
 *  2. SOAT — número de póliza, fecha de vencimiento, URL del documento
 *  3. Tecnomecánica — número, fecha de vencimiento, URL del documento
 *  4. Opciones adicionales (vehículo principal)
 *
 * Los campos de documentos son opcionales pero se muestran siempre para
 * incentivar al usuario a mantenerlos actualizados.
 */
export default function VehicleForm({ vehicle, onSubmit, onCancel, isLoading }: VehicleFormProps) {
  const [formData, setFormData] = useState({
    // ---- Datos básicos ----
    license_plate:  vehicle?.licensePlate  || '',
    make:           vehicle?.make          || '',
    model:          vehicle?.model         || '',
    year:           vehicle?.year          || new Date().getFullYear(),
    color:          vehicle?.color         || '',
    vin:            vehicle?.vin           || '',
    vehicle_type:   vehicle?.vehicleType   || 'sedan' as const,
    fuel_type:      vehicle?.fuelType      || 'gasoline' as const,
    nickname:       vehicle?.nickname      || '',
    is_primary:     vehicle?.isPrimary     || false,

    // ---- SOAT ----
    soat_number:           vehicle?.soatNumber           || '',
    soat_expiration_date:  vehicle?.soatExpirationDate   || '',
    soat_document_url:     vehicle?.soatDocumentUrl      || '',

    // ---- Tecnomecánica ----
    tecnomecanica_number:           vehicle?.tecnomecanicaNumber           || '',
    tecnomecanica_expiration_date:  vehicle?.tecnomecanicaExpirationDate   || '',
    tecnomecanica_document_url:     vehicle?.tecnomecanicaDocumentUrl      || '',
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    // Copiar todos los campos y limpiar los opcionales vacíos
    const data: any = { ...formData };

    // Campos base opcionales
    if (!data.color)    delete data.color;
    if (!data.vin)      delete data.vin;
    if (!data.nickname) delete data.nickname;

    // Documentos opcionales — solo enviar si tienen valor
    if (!data.soat_number)           delete data.soat_number;
    if (!data.soat_expiration_date)  delete data.soat_expiration_date;
    if (!data.soat_document_url)     delete data.soat_document_url;

    if (!data.tecnomecanica_number)           delete data.tecnomecanica_number;
    if (!data.tecnomecanica_expiration_date)  delete data.tecnomecanica_expiration_date;
    if (!data.tecnomecanica_document_url)     delete data.tecnomecanica_document_url;

    const success = await onSubmit(data);
    if (success) {
      onCancel();
    }
  }

  // Clase CSS reutilizable para los inputs
  const inputClass =
    'w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50';

  const labelClass = 'block text-sm font-medium text-gray-300 mb-1';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-6">
          {vehicle ? 'Editar Vehículo' : 'Agregar Vehículo'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ================================================================
              SECCIÓN 1: Datos básicos
          ================================================================ */}
          <div>
            <h3 className="text-lg font-semibold text-blue-400 mb-3 pb-1 border-b border-gray-700">
              Información del Vehículo
            </h3>
            <div className="space-y-4">

              {/* Placa */}
              <div>
                <label className={labelClass}>Placa *</label>
                <input
                  type="text"
                  required
                  value={formData.license_plate}
                  onChange={(e) => setFormData({ ...formData, license_plate: e.target.value.toUpperCase() })}
                  className={inputClass}
                  disabled={isLoading}
                  placeholder="ABC-123"
                />
              </div>

              {/* Marca / Modelo */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Marca *</label>
                  <input
                    type="text"
                    required
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    className={inputClass}
                    disabled={isLoading}
                    placeholder="ej. Toyota"
                  />
                </div>
                <div>
                  <label className={labelClass}>Modelo *</label>
                  <input
                    type="text"
                    required
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className={inputClass}
                    disabled={isLoading}
                    placeholder="ej. Camry"
                  />
                </div>
              </div>

              {/* Año / Color */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Año *</label>
                  <input
                    type="number"
                    required
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className={inputClass}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className={labelClass}>Color</label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className={inputClass}
                    disabled={isLoading}
                    placeholder="ej. Negro"
                  />
                </div>
              </div>

              {/* Tipo / Combustible */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Tipo de vehículo *</label>
                  <select
                    required
                    value={formData.vehicle_type}
                    onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value as any })}
                    className={inputClass}
                    disabled={isLoading}
                  >
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="truck">Camioneta</option>
                    <option value="motorcycle">Moto</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Combustible *</label>
                  <select
                    required
                    value={formData.fuel_type}
                    onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value as any })}
                    className={inputClass}
                    disabled={isLoading}
                  >
                    <option value="gasoline">Gasolina</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Eléctrico</option>
                    <option value="hybrid">Híbrido</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
              </div>

              {/* VIN / Apodo */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>VIN</label>
                  <input
                    type="text"
                    value={formData.vin}
                    onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                    className={inputClass}
                    disabled={isLoading}
                    placeholder="17 caracteres"
                    maxLength={17}
                  />
                </div>
                <div>
                  <label className={labelClass}>Apodo</label>
                  <input
                    type="text"
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    className={inputClass}
                    disabled={isLoading}
                    placeholder="ej. Mi Carro"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* ================================================================
              SECCIÓN 2: SOAT
          ================================================================ */}
          <div>
            <h3 className="text-lg font-semibold text-yellow-400 mb-1 pb-1 border-b border-gray-700">
              SOAT — Seguro Obligatorio de Accidentes de Tránsito
            </h3>
            <p className="text-xs text-gray-400 mb-3">
              Requerido para operar el vehículo en Colombia. El sistema bloqueará la activación
              del vehículo si el SOAT está vencido.
            </p>
            <div className="space-y-4">

              {/* Número de póliza / Fecha de vencimiento */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Número de póliza</label>
                  <input
                    type="text"
                    value={formData.soat_number}
                    onChange={(e) => setFormData({ ...formData, soat_number: e.target.value })}
                    className={inputClass}
                    disabled={isLoading}
                    placeholder="ej. SO-2024-123456"
                  />
                </div>
                <div>
                  <label className={labelClass}>Fecha de vencimiento</label>
                  <input
                    type="date"
                    value={formData.soat_expiration_date}
                    onChange={(e) => setFormData({ ...formData, soat_expiration_date: e.target.value })}
                    className={inputClass}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* URL del documento */}
              <div>
                <label className={labelClass}>URL del documento escaneado</label>
                <input
                  type="url"
                  value={formData.soat_document_url}
                  onChange={(e) => setFormData({ ...formData, soat_document_url: e.target.value })}
                  className={inputClass}
                  disabled={isLoading}
                  placeholder="https://..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Suba el documento a un servicio externo y pegue aquí la URL pública.
                </p>
              </div>

            </div>
          </div>

          {/* ================================================================
              SECCIÓN 3: Tecnomecánica
          ================================================================ */}
          <div>
            <h3 className="text-lg font-semibold text-green-400 mb-1 pb-1 border-b border-gray-700">
              Tecnomecánica — Revisión Técnico-Mecánica
            </h3>
            <p className="text-xs text-gray-400 mb-3">
              Obligatoria en Colombia para vehículos con más de 3 años. El sistema bloqueará
              la activación del vehículo si la tecnomecánica está vencida.
            </p>
            <div className="space-y-4">

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Número de certificado</label>
                  <input
                    type="text"
                    value={formData.tecnomecanica_number}
                    onChange={(e) => setFormData({ ...formData, tecnomecanica_number: e.target.value })}
                    className={inputClass}
                    disabled={isLoading}
                    placeholder="ej. TM-2024-789"
                  />
                </div>
                <div>
                  <label className={labelClass}>Fecha de vencimiento</label>
                  <input
                    type="date"
                    value={formData.tecnomecanica_expiration_date}
                    onChange={(e) => setFormData({ ...formData, tecnomecanica_expiration_date: e.target.value })}
                    className={inputClass}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>URL del certificado escaneado</label>
                <input
                  type="url"
                  value={formData.tecnomecanica_document_url}
                  onChange={(e) => setFormData({ ...formData, tecnomecanica_document_url: e.target.value })}
                  className={inputClass}
                  disabled={isLoading}
                  placeholder="https://..."
                />
              </div>

            </div>
          </div>

          {/* ================================================================
              SECCIÓN 4: Opciones adicionales
          ================================================================ */}
          <div>
            <h3 className="text-lg font-semibold text-gray-300 mb-3 pb-1 border-b border-gray-700">
              Opciones
            </h3>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_primary"
                checked={formData.is_primary}
                onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
                disabled={isLoading}
              />
              <label htmlFor="is_primary" className="ml-2 block text-sm text-gray-300">
                Marcar como vehículo principal
              </label>
            </div>
          </div>

          {/* ================================================================
              Botones de acción
          ================================================================ */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
            >
              {isLoading ? 'Guardando...' : vehicle ? 'Actualizar' : 'Agregar Vehículo'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
