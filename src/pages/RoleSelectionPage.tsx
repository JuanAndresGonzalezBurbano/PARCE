import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Wrench, Shield } from 'lucide-react';
import Logo from '../components/Logo';

export default function RoleSelectionPage() {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'user',
      title: 'Usuario',
      description: 'Solicita servicios de asistencia vehicular',
      icon: User,
      gradient: 'from-gold-500 to-gold-600',
    },
    {
      id: 'mechanic',
      title: 'Mecánico',
      description: 'Ofrece servicios de reparación y asistencia',
      icon: Wrench,
      gradient: 'from-anthracite-500 to-anthracite-600',
    },
    {
      id: 'admin',
      title: 'Administrador',
      description: 'Gestiona la plataforma y usuarios',
      icon: Shield,
      gradient: 'from-anthracite-600 to-anthracite-700',
    },
  ];

  const handleRoleSelect = (_roleId: string) => {
    if (_roleId === 'mechanic') {
      navigate('/mechanic-vehicle-info');
    } else if (_roleId === 'user') {
      navigate('/services');
    } else if (_roleId === 'admin') {
      navigate('/dashboard');
    } else {
      navigate('/services');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-anthracite-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Car Background Placeholder */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full bg-gradient-to-br from-dark-900 to-dark-950"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-4xl"
      >
        <div className="card p-8 space-y-8">
          {/* Logo */}
          <div className="flex justify-center">
            <Logo size="md" />
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">ROL</h2>
            <p className="text-gray-400">Selecciona tu rol en la plataforma</p>
          </div>

          {/* Role Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {roles.map((role, index) => (
              <motion.button
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => handleRoleSelect(role.id)}
                className="card p-6 hover:scale-105 transition-all duration-300 group"
              >
                <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${role.gradient} rounded-full flex items-center justify-center group-hover:shadow-glow-gold`}>
                  <role.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{role.title}</h3>
                <p className="text-gray-400 text-sm">{role.description}</p>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
