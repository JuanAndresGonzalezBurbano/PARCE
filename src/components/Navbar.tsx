import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  isAuthenticated?: boolean;
  userName?: string;
  userAvatar?: string;
}

export default function Navbar({ isAuthenticated: propIsAuthenticated, userName: propUserName, userAvatar }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const { user, logout, isAuthenticated: contextIsAuthenticated } = useAuth();

  // Usar el contexto si está disponible, sino usar las props
  const isAuthenticated = contextIsAuthenticated || propIsAuthenticated;
  const userName = user?.name || propUserName;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Obtener enlaces según el rol
  const getDashboardLink = () => {
    if (!user) return '/dashboard';
    switch (user.role) {
      case 'admin':
        return '/dashboard';
      case 'mechanic':
        return '/mechanic-dashboard';
      case 'user':
      default:
        return '/services';
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-950/80 backdrop-blur-lg border-b border-anthracite-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <Logo size="sm" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {!isAuthenticated ? (
              <>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Inicio
                </Link>
                <Link to="/services" className="text-gray-300 hover:text-white transition-colors">
                  Servicios
                </Link>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contacto
                </Link>
                <Link to="/login" className="btn-outline py-2 px-4">
                  Iniciar Sesión
                </Link>
                <Link to="/register" className="btn-primary py-2 px-4">
                  Registro
                </Link>
              </>
            ) : (
              <>
                {user?.role === 'admin' && (
                  <>
                    <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                      Dashboard
                    </Link>
                    <Link to="/crud" className="text-gray-300 hover:text-white transition-colors">
                      CRUD
                    </Link>
                  </>
                )}
                {user?.role === 'user' && (
                  <Link to="/services" className="text-gray-300 hover:text-white transition-colors">
                    Servicios
                  </Link>
                )}
                {user?.role === 'mechanic' && (
                  <Link to="/mechanic-dashboard" className="text-gray-300 hover:text-white transition-colors">
                    Solicitudes
                  </Link>
                )}
                {user?.role !== 'admin' && (
                  <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">
                    Contacto
                  </Link>
                )}
                
                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-dark-800 transition-colors"
                  >
                    {userAvatar ? (
                      <img src={userAvatar} alt={userName} className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center">
                        <User className="w-5 h-5 text-anthracite-950" />
                      </div>
                    )}
                    <span className="text-gray-300">{userName}</span>
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-dark-900 border border-anthracite-800 rounded-lg shadow-xl overflow-hidden"
                      >
                        <Link
                          to="/profile"
                          className="flex items-center gap-2 px-4 py-3 text-gray-300 hover:bg-dark-800 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="w-4 h-4" />
                          Perfil
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-dark-800 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Cerrar Sesión
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-dark-800 transition-colors"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-300" />
            ) : (
              <Menu className="w-6 h-6 text-gray-300" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-dark-900 border-t border-anthracite-800"
          >
            <div className="px-4 py-4 space-y-2">
              {!isAuthenticated ? (
                <>
                  <Link to="/" className="block px-4 py-2 text-gray-300 hover:bg-dark-800 rounded-lg">
                    Inicio
                  </Link>
                  <Link to="/services" className="block px-4 py-2 text-gray-300 hover:bg-dark-800 rounded-lg">
                    Servicios
                  </Link>
                  <Link to="/contact" className="block px-4 py-2 text-gray-300 hover:bg-dark-800 rounded-lg">
                    Contacto
                  </Link>
                  <Link to="/login" className="block px-4 py-2 text-primary-400 hover:bg-dark-800 rounded-lg">
                    Iniciar Sesión
                  </Link>
                  <Link to="/register" className="block px-4 py-2 bg-primary-600 text-white rounded-lg text-center">
                    Registro
                  </Link>
                </>
              ) : (
                <>
                  {user?.role === 'admin' && (
                    <>
                      <Link to="/dashboard" className="block px-4 py-2 text-gray-300 hover:bg-dark-800 rounded-lg">
                        Dashboard
                      </Link>
                      <Link to="/crud" className="block px-4 py-2 text-gray-300 hover:bg-dark-800 rounded-lg">
                        CRUD
                      </Link>
                    </>
                  )}
                  {user?.role === 'mechanic' && (
                    <Link to="/mechanic-dashboard" className="block px-4 py-2 text-gray-300 hover:bg-dark-800 rounded-lg">
                      Solicitudes
                    </Link>
                  )}
                  {user?.role === 'user' && (
                    <Link to="/services" className="block px-4 py-2 text-gray-300 hover:bg-dark-800 rounded-lg">
                      Servicios
                    </Link>
                  )}
                  {user?.role !== 'admin' && (
                    <>
                      <Link to="/contact" className="block px-4 py-2 text-gray-300 hover:bg-dark-800 rounded-lg">
                        Contacto
                      </Link>
                      <Link to="/profile" className="block px-4 py-2 text-gray-300 hover:bg-dark-800 rounded-lg">
                        Perfil
                      </Link>
                    </>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-400 hover:bg-dark-800 rounded-lg"
                  >
                    Cerrar Sesión
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
