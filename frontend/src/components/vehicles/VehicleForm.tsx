import { useState, FormEvent } from 'react';
import type { Vehicle, CreateVehicleRequest, UpdateVehicleRequest } from '@/types/vehicle';
import { fieldErrorFor as sharedFieldErrorFor } from '@/utils/apiErrors';

interface VehicleFormProps {
  vehicle?: Vehicle;
  onSubmit: (data: CreateVehicleRequest | UpdateVehicleRequest) => Promise<boolean>;
  onCancel: () => void;
  isLoading: boolean;
  error?: string | null;
  fieldErrors?: Record<string, string | string[]> | null;
}

const inputCls = 'w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors';
const inputErrorCls = 'w-full px-4 py-2 bg-gray-700 border border-red-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors';

export default function VehicleForm({ vehicle, onSubmit, onCancel, isLoading, error, fieldErrors }: VehicleFormProps) {
  const [formData, setFormData] = useState({
    license_plate:                  vehicle?.licensePlate            || '',
    make:                           vehicle?.make                    || '',
    model:                          vehicle?.model                   || '',
    year:                           vehicle?.year                    || new Date().getFullYear(),
    color:                          vehicle?.color                   || '',
    vin:                            vehicle?.vin                     || '',
    vehicle_type:                   vehicle?.vehicleType             || 'sedan' as const,
    fuel_type:                      vehicle?.fuelType                || 'gasoline' as const,
    nickname:                       vehicle?.nickname                || '',
    is_primary:                     vehicle?.isPrimary               || false,
    soat_expiration_date:           vehicle?.soatExpirationDate      || '',
    tecnomecanica_expiration_date:  vehicle?.tecnomecanicaExpirationDate || '',
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const data: any = { ...formData };
    if (!data.color)                         delete data.color;
    if (!data.vin)                           delete data.vin;
    if (!data.nickname)                      delete data.nickname;
    if (!data.soat_expiration_date)          delete data.soat_expiration_date;
    if (!data.tecnomecanica_expiration_date) delete data.tecnomecanica_expiration_date;
    const success = await onSubmit(data);
    if (success) onCancel();
  }

  function fieldErrorFor(key: keyof typeof formData): string | undefined {
    return sharedFieldErrorFor(fieldErrors, key);
  }

  const field = (key: keyof typeof formData) => ({
    value: formData[key] as any,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setFormData({ ...formData, [key]: e.target.type === 'number' ? parseInt(e.target.value) : e.target.value }),
    disabled: isLoading,
    className: fieldErrorFor(key) ? inputErrorCls : inputCls,
  });

  const FieldError = ({ name }: { name: keyof typeof formData }) => {
    const message = fieldErrorFor(name);
    if (!message) return null;
    return <p className="text-red-400 text-xs mt-1">{message}</p>;
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6">
          {vehicle ? 'Editar Vehículo' : 'Agregar Vehículo'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Placa */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Placa *</label>
            <input type="text" required {...field('license_plate')} placeholder="ej. ABC123" />
            <FieldError name="license_plate" />
          </div>

          {/* Marca y Modelo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Marca *</label>
              <input type="text" required {...field('make')} placeholder="ej. Chevrolet" />
              <FieldError name="make" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Modelo *</label>
              <input type="text" required {...field('model')} placeholder="ej. Spark" />
              <FieldError name="model" />
            </div>
          </div>

          {/* Año y Color */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Año *</label>
              <input type="number" required min="1900" max={new Date().getFullYear() + 1} {...field('year')} />
              <FieldError name="year" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Color</label>
              <input type="text" {...field('color')} placeholder="ej. Rojo" />
              <FieldError name="color" />
            </div>
          </div>

          {/* Tipo de vehículo y Combustible */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Tipo de vehículo *</label>
              <select required value={formData.vehicle_type}
                onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value as any })}
                disabled={isLoading} className={fieldErrorFor('vehicle_type') ? inputErrorCls : inputCls}>
                <option value="sedan">Sedán</option>
                <option value="suv">SUV</option>
                <option value="truck">Camioneta</option>
                <option value="motorcycle">Moto</option>
                <option value="van">Furgoneta</option>
                <option value="other">Otro</option>
              </select>
              <FieldError name="vehicle_type" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Combustible *</label>
              <select required value={formData.fuel_type}
                onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value as any })}
                disabled={isLoading} className={fieldErrorFor('fuel_type') ? inputErrorCls : inputCls}>
                <option value="gasoline">Gasolina</option>
                <option value="diesel">Diésel</option>
                <option value="electric">Eléctrico</option>
                <option value="hybrid">Híbrido</option>
                <option value="other">Otro</option>
              </select>
              <FieldError name="fuel_type" />
            </div>
          </div>

          {/* VIN */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">VIN (Número de identificación)</label>
            <input type="text" {...field('vin')} placeholder="17 caracteres" />
            <FieldError name="vin" />
          </div>

          {/* Apodo */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Apodo</label>
            <input type="text" {...field('nickname')} placeholder="ej. Mi Cheva" />
            <FieldError name="nickname" />
          </div>

          {/* Documentos colombianos */}
          <div className="border-t border-gray-700 pt-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Documentos Colombianos
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Vencimiento SOAT
                </label>
                <input
                  type="date"
                  value={formData.soat_expiration_date}
                  onChange={(e) => setFormData({ ...formData, soat_expiration_date: e.target.value })}
                  disabled={isLoading}
                  className={fieldErrorFor('soat_expiration_date') ? inputErrorCls : inputCls}
                />
                <p className="text-xs text-gray-500 mt-0.5">Seguro Obligatorio de Accidentes de Tránsito</p>
                <FieldError name="soat_expiration_date" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Vencimiento Tecnomecánica
                </label>
                <input
                  type="date"
                  value={formData.tecnomecanica_expiration_date}
                  onChange={(e) => setFormData({ ...formData, tecnomecanica_expiration_date: e.target.value })}
                  disabled={isLoading}
                  className={fieldErrorFor('tecnomecanica_expiration_date') ? inputErrorCls : inputCls}
                />
                <p className="text-xs text-gray-500 mt-0.5">Revisión técnico-mecánica</p>
                <FieldError name="tecnomecanica_expiration_date" />
              </div>
            </div>
          </div>

          {/* Vehículo principal */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_primary"
              checked={formData.is_primary}
              onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
              disabled={isLoading}
            />
            <label htmlFor="is_primary" className="text-sm text-gray-300">
              Establecer como vehículo principal
            </label>
          </div>

          {/* Acciones */}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isLoading}
              className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors">
              {isLoading ? 'Guardando...' : vehicle ? 'Actualizar Vehículo' : 'Agregar Vehículo'}
            </button>
            <button type="button" onClick={onCancel} disabled={isLoading}
              className="flex-1 py-2.5 px-4 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
