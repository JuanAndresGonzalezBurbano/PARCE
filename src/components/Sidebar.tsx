import { Link, useLocation } from 'react-router-dom';
import { Home, Wrench, Phone, ClipboardList, User, Database } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen?: boolean;
  hidden?: boolean;
}

export default function Sidebar({ isOpen = true, hidden = false }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();

  const adminMenuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Database, label: 'CRUD', path: '/crud' },
  ];

  const userMenuItems = [
    // RAMA: Soto - Agregado "Inicio" encima de "Servicios" para ir al UserHomePage
    { icon: Home, label: 'Inicio', path: '/home' },
    { icon: Wrench, label: 'Servicios', path: '/services' },
    { icon: Phone, label: 'Contacto', path: '/contact' },
  ];

  // RAMA: Soto - Eliminado "Contacto" del sidebar del mecánico (es solo para usuarios)
  const mechanicMenuItems = [
    { icon: ClipboardList, label: 'Solicitudes', path: '/mechanic-orders' },
    { icon: User, label: 'Mi Perfil', path: '/mechanic-profile' },
  ];

  const getMenuItems = () => {
    if (user?.role === 'admin') return adminMenuItems;
    if (user?.role === 'mechanic') return mechanicMenuItems;
    return userMenuItems;
  };

  const menuItems = getMenuItems();
  const isActive = (path: string) => location.pathname === path;

  if (hidden) return null;

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-dark-900/50 backdrop-blur-sm border-r border-anthracite-800 transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <Link key={item.path} to={item.path}
            className={isActive(item.path) ? 'sidebar-link-active' : 'sidebar-link'}>
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>
    </motion.aside>
  );
}
