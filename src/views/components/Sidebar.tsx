// Importa Link para navegación y useLocation para saber en qué ruta está el usuario
import { Link, useLocation } from 'react-router-dom';
// Importa los íconos usados en el sidebar
import { Home, Wrench, Phone, ClipboardList, User, Database } from 'lucide-react';
// Importa motion para la animación de entrada del sidebar
import { motion } from 'framer-motion';
// Importa el hook de autenticación para saber el rol del usuario actual
import { useAuth } from '../../controllers/AuthContext';

// Define las propiedades del Sidebar
interface SidebarProps {
  isOpen?: boolean;  // Si está expandido o colapsado
  hidden?: boolean;  // Si debe ocultarse completamente (ej: en servicio en curso)
}

export default function Sidebar({ isOpen = true, hidden = false }: SidebarProps) {
  // Obtiene la ruta actual para marcar el link activo
  const location = useLocation();
  // Obtiene el usuario para determinar qué menú mostrar según su rol
  const { user } = useAuth();

  // Menú para administrador: Dashboard y CRUD
  const adminMenuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Database, label: 'CRUD', path: '/crud' },
  ];

  // Menú para usuario: Inicio (UserHomePage), Servicios y Contacto
  // RAMA: Soto - Agregado "Inicio" encima de "Servicios" para ir al UserHomePage
  const userMenuItems = [
    { icon: Home, label: 'Inicio', path: '/home' },       // Va al home autenticado del usuario
    { icon: Wrench, label: 'Servicios', path: '/services' }, // Va a la página de servicios
    { icon: Phone, label: 'Contacto', path: '/contact' },    // Va a la página de contacto
  ];

  // Menú para mecánico: solo Solicitudes y Perfil
  // RAMA: Soto - Eliminado "Contacto" del sidebar del mecánico (es solo para usuarios)
  const mechanicMenuItems = [
    { icon: ClipboardList, label: 'Solicitudes', path: '/mechanic-orders' }, // Lista de pedidos
    { icon: User, label: 'Mi Perfil', path: '/mechanic-profile' },           // Perfil del mecánico
  ];

  // Selecciona el menú correcto según el rol del usuario
  const getMenuItems = () => {
    if (user?.role === 'admin') return adminMenuItems;
    if (user?.role === 'mechanic') return mechanicMenuItems;
    return userMenuItems; // Por defecto muestra el menú de usuario
  };

  // Obtiene los items del menú según el rol
  const menuItems = getMenuItems();
  // Función que compara la ruta actual con la del item para resaltarlo como activo
  const isActive = (path: string) => location.pathname === path;

  // Si hidden es true, no renderiza nada (usado en ServicesInProgressPage)
  if (hidden) return null;

  return (
    // Sidebar fijo a la izquierda con animación de entrada desde la izquierda
    <motion.aside
      initial={{ x: -300 }}   // Empieza fuera de pantalla a la izquierda
      animate={{ x: 0 }}      // Desliza hasta su posición normal
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-dark-900/50 backdrop-blur-sm border-r border-anthracite-800 transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-20' // Ancho completo si está abierto, reducido si está colapsado
      }`}
    >
      {/* Lista de links de navegación */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          // Cada link del menú — resaltado si es la ruta activa
          <Link key={item.path} to={item.path}
            className={isActive(item.path) ? 'sidebar-link-active' : 'sidebar-link'}>
            {/* Ícono del item */}
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {/* Texto del item - solo se muestra si el sidebar está expandido */}
            {isOpen && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>
    </motion.aside>
  );
}
