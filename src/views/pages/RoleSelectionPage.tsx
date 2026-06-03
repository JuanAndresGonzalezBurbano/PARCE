// Importa useNavigate para redirigir al usuario después de seleccionar el rol
import { useNavigate } from 'react-router-dom';
// Importa motion para animaciones de los cards de rol
import { motion } from 'framer-motion';
// Importa íconos para cada tipo de rol
import { User, Wrench, Shield } from 'lucide-react';
// Importa useState y useEffect para manejar el rol pendiente y esperar confirmación
import { useState, useEffect } from 'react';
// Importa el componente del logo
import Logo from '../components/Logo';
// Importa el hook de autenticación para seleccionar el rol y acceder al usuario
import { useAuth } from '../../controllers/AuthContext';

export default function RoleSelectionPage() {
  // Hook para navegar programáticamente a otra ruta
  const navigate = useNavigate();
  // Obtiene la función de selección de rol y el usuario actual del contexto
  const { selectRole, user } = useAuth();
  // RAMA: Soto - Estado que guarda el rol que el usuario eligió pero aún no se confirmó en el contexto
  const [pendingRole, setPendingRole] = useState<string | null>(null);

  // RAMA: Soto - useEffect que escucha cambios en el usuario para navegar DESPUÉS de que el rol se actualice
  // Esto soluciona el problema donde ProtectedRoute bloqueaba la navegación por rol desactualizado
  useEffect(() => {
    // Si no hay rol pendiente o no hay usuario, no hace nada
    if (!pendingRole || !user) return;
    // Solo navega cuando el rol del usuario en el contexto ya coincide con el rol elegido
    if (user.role === pendingRole) {
      // Redirige según el rol confirmado
      if (pendingRole === 'mechanic') navigate('/mechanic-vehicle-info'); // Mecánico
      else if (pendingRole === 'user') navigate('/home');                  // Usuario → home autenticado
      else if (pendingRole === 'admin') navigate('/dashboard');            // Admin → dashboard
      setPendingRole(null); // Limpia el rol pendiente
    }
  }, [user, pendingRole, navigate]); // Se ejecuta cada vez que cambia el usuario, el rol pendiente o navigate

  // Función que se ejecuta cuando el usuario hace click en un rol
  const handleRoleSelect = (_roleId: string) => {
    // Solo procesa roles válidos
    if (_roleId === 'admin' || _roleId === 'user' || _roleId === 'mechanic') {
      selectRole(_roleId);        // Actualiza el rol en el contexto y localStorage
      setPendingRole(_roleId);    // Guarda el rol pendiente para que useEffect navegue cuando se confirme
    }
  };

  // Define los 3 roles disponibles con sus datos visuales
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

  return (
    // Contenedor principal con fondo oscuro y centrado vertical/horizontal
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center px-4 relative overflow-hidden">
      {/* Fondo animado con círculos borrosos decorativos */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-anthracite-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Overlay oscuro para dar profundidad */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full bg-gradient-to-br from-dark-900 to-dark-950"></div>
      </div>

      {/* Card principal con animación de entrada desde abajo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-4xl"
      >
        <div className="card p-8 space-y-8">
          {/* Logo de la plataforma */}
          <div className="flex justify-center">
            <Logo size="md" />
          </div>

          {/* Título e instrucción */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">ROL</h2>
            <p className="text-gray-400">Selecciona tu rol en la plataforma</p>
          </div>

          {/* Grid de cards de rol - 3 columnas en pantallas medianas */}
          <div className="grid md:grid-cols-3 gap-6">
            {roles.map((role, index) => (
              // Cada card de rol con animación de entrada escalonada
              <motion.button
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }} // Retraso escalonado por índice
                onClick={() => handleRoleSelect(role.id)} // Llama a handleRoleSelect al hacer click
                className="card p-6 hover:scale-105 transition-all duration-300 group"
              >
                {/* Ícono del rol en círculo con gradiente */}
                <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${role.gradient} rounded-full flex items-center justify-center group-hover:shadow-glow-gold`}>
                  <role.icon className="w-8 h-8 text-white" />
                </div>
                {/* Nombre del rol */}
                <h3 className="text-xl font-bold text-white mb-2">{role.title}</h3>
                {/* Descripción del rol */}
                <p className="text-gray-400 text-sm">{role.description}</p>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
