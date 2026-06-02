import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, FileText, Calendar, CreditCard } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function MechanicVehicleInfoPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    licenseCode: '',
    vehicleBrand: '',
    model: '',
    plate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Guardar información del vehículo
    navigate('/mechanic-orders');
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Navbar isAuthenticated userName="Mecánico" userRole="mechanic" />

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
              <h1 className="text-3xl font-bold text-white mb-2">INFORMACIÓN MECÁNICO</h1>
              <p className="text-gray-400">Registra la información de tu vehículo de trabajo</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Código de licencia */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <FileText className="w-4 h-4" />
                  Código de licencia
                </label>
                <input
                  type="text"
                  value={formData.licenseCode}
                  onChange={(e) => setFormData({ ...formData, licenseCode: e.target.value })}
                  placeholder="LCO4548938274"
                  className="input-field"
                  required
                />
              </div>

              {/* Marca vehículo */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <Car className="w-4 h-4" />
                  Marca vehículo
                </label>
                <input
                  type="text"
                  value={formData.vehicleBrand}
                  onChange={(e) => setFormData({ ...formData, vehicleBrand: e.target.value })}
                  placeholder="Chevrolet spark"
                  className="input-field"
                  required
                />
              </div>

              {/* Modelo */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <Calendar className="w-4 h-4" />
                  Modelo
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="2024"
                  className="input-field"
                  required
                />
              </div>

              {/* Placa */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <CreditCard className="w-4 h-4" />
                  Placa
                </label>
                <input
                  type="text"
                  value={formData.plate}
                  onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                  placeholder="PDF345"
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
