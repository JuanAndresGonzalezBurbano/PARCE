import { Link, useLocation } from 'react-router-dom';
import { Home, Wrench, Phone, User, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
  isOpen?: boolean;
}

export default function Sidebar({ isOpen = true }: SidebarProps) {
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: 'Inicio', path: '/dashboard' },
    { icon: Wrench, label: 'Servicio', path: '/services' },
    { icon: Phone, label: 'Contacto', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-dark-900/50 backdrop-blur-sm border-r border-graphite-800 transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={
              isActive(item.path)
                ? 'sidebar-link-active'
                : 'sidebar-link'
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>
    </motion.aside>
  );
}
