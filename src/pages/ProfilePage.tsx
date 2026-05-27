import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Camera, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: 'Juan Burbano',
    email: 'example@gmail.com',
    password: '********',
    role: 'Usuario/Mecanico',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Show success message
    alert('Perfil actualizado correctamente');
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar isAuthenticated userName="Juan Burbano" />
      <Sidebar />

      <main className="ml-64 pt-16 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>

          <div className="card p-8 space-y-6">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-2">PERFIL</h1>
              <p className="text-gray-400">Gestiona tu información personal</p>
            </div>

            {/* Profile Photo */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-gold-500 to-gold-700 rounded-full flex items-center justify-center">
                  <User className="w-16 h-16 text-anthracite-950" />
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-gold-600 hover:bg-gold-700 rounded-full transition-colors">
                  <Camera className="w-5 h-5 text-anthracite-950" />
                </button>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-dark-800 hover:bg-dark-700 text-white rounded-lg transition-colors">
                  Quitar foto
                </button>
                <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
                  Cambiar la foto
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Nombre
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field flex-1"
                  />
                  <button
                    type="button"
                    className="px-4 py-2 bg-dark-800 hover:bg-dark-700 text-white rounded-lg transition-colors"
                  >
                    Editar
                  </button>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Correo Electronico
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field flex-1"
                  />
                  <button
                    type="button"
                    className="px-4 py-2 bg-dark-800 hover:bg-dark-700 text-white rounded-lg transition-colors"
                  >
                    Editar
                  </button>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Contraseña
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-field flex-1"
                  />
                  <button
                    type="button"
                    className="px-4 py-2 bg-dark-800 hover:bg-dark-700 text-white rounded-lg transition-colors"
                  >
                    Editar
                  </button>
                </div>
              </div>

              {/* Role */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Rol que ocupa
                </label>
                <input
                  type="text"
                  value={formData.role}
                  disabled
                  className="input-field bg-dark-800/30 cursor-not-allowed"
                />
              </div>

              {/* Delete Account */}
              <button
                type="button"
                className="w-full py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors border border-red-600/50"
              >
                Eliminar cuenta
              </button>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
