import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, FileText, Calendar, CreditCard } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function MechanicVehicleInfoPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    vehicleBrand: '',
    model: '',
    plate: '',
    year: '',
    color: '',
    soatCode: '',
    tecnomecanicaCode: '',
    driverLicense: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Guardar información del vehículo
    navigate('/mechanic-orders');
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Navbar isAuthenticated userName="Mecánico" />

      <main className="pt-24 pb-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="card p-8 space-y-6">
            {/* Header */}
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-gold-500 to-gold-700 rounded-full flex items-center justify-center">
                  <Car className="w-10 h-10 text-anthracite-950" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">REGISTRO</h1>
              <p className="text-gray-400">Vehículo Averiado</p>
            </div>

            {/* Info Alert */}
            <div className="flex items-center gap-3 p-4 bg-primary-500/10 border border-primary-500/30 rounded-lg">
              <Car className="w-5 h-5 text-primary-400 flex-shrink-0" />
              <p className="text-sm text-gray-300">Información del vehículo que necesita asistencia</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Marca y Modelo en fila */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Marca vehículo */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Marca
                  </label>
                  <input
                    type="text"
                    value={formData.vehicleBrand}
                    onChange={(e) => setFormData({ ...formData, vehicleBrand: e.target.value })}
                    placeholder="a"
                    className="input-field"
                    required
                  />
                </div>

                {/* Modelo */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Modelo
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="a"
                    className="input-field"
                    required
                  />
                </div>
              </div>

              {/* Placa y Año en fila */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Placa */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Placa
                  </label>
                  <div className="relative">
                    <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={formData.plate}
                      onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                      placeholder="A"
                      className="input-field pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Año */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Año
                  </label>
                  <input
                    type="text"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    placeholder="2026"
                    className="input-field"
                    required
                  />
                </div>
              </div>

              {/* Color */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Color
                </label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="a"
                  className="input-field"
                  required
                />
              </div>

              {/* Código SOAT */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Código SOAT <span className="text-gray-500 text-xs">(para verificar vigencia)</span>
                </label>
                <input
                  type="text"
                  value={formData.soatCode}
                  onChange={(e) => setFormData({ ...formData, soatCode: e.target.value })}
                  placeholder="SOAT-2024-XXXXXXXX"
                  className="input-field"
                  required
                />
              </div>

              {/* Código Tecnomecánica */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Código Tecnomecánica <span className="text-gray-500 text-xs">(para verificar vigencia)</span>
                </label>
                <input
                  type="text"
                  value={formData.tecnomecanicaCode}
                  onChange={(e) => setFormData({ ...formData, tecnomecanicaCode: e.target.value })}
                  placeholder="TM-2024-XXXXXXXX"
                  className="input-field"
                  required
                />
              </div>

              {/* Licencia de Conducción */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Licencia de Conducción <span className="text-gray-500 text-xs">(para verificar vigencia)</span>
                </label>
                <input
                  type="text"
                  value={formData.driverLicense}
                  onChange={(e) => setFormData({ ...formData, driverLicense: e.target.value })}
                  placeholder="LC-2024-XXXXXXXX"
                  className="input-field"
                  required
                />
              </div>

              {/* Submit Button */}
              <button type="submit" className="w-full btn-primary">
                Ingresar
              </button>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
