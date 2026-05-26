import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Clock, Send } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Mensaje enviado correctamente');
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Navbar isAuthenticated userName="Juan Gustavo" />

      <main className="pt-24 pb-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Contact Image */}
            <div className="relative h-96 lg:h-auto rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-dark-800 to-dark-900 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Phone className="w-24 h-24 mx-auto text-primary-500" />
                  <p className="text-gray-400 text-lg">Imagen de contacto</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="card p-8 space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-white mb-2">
                  Contactanos y danos tu opinion
                </h1>
                <p className="text-gray-400">Estamos aquí para ayudarte</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Numero
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Correo
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                {/* Submit Button */}
                <button type="submit" className="w-full btn-primary flex items-center justify-center gap-2">
                  <Send className="w-5 h-5" />
                  Enviar
                </button>
              </form>

              {/* Contact Info */}
              <div className="pt-6 border-t border-anthracite-800 space-y-4">
                <div className="flex items-center gap-3 text-gray-300">
                  <Clock className="w-5 h-5 text-primary-500" />
                  <div>
                    <p className="text-sm text-gray-400">Horario de atencion</p>
                    <p className="font-medium">Domingo-Domingo 24hs</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-300">
                  <Phone className="w-5 h-5 text-primary-500" />
                  <div>
                    <p className="text-sm text-gray-400">P.A.R.C.E</p>
                    <p className="font-medium">Bogotá: (601) 80 14592</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
