import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  isAuthenticated?: boolean;
  userName?: string;
  userAvatar?: string;
  hideNavLinks?: boolean;
}

export default function Navbar({ isAuthenticated = false, userName, userAvatar, hideNavLinks = false }: NavbarProps) {
  const { user, logout: authLogout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setShowUserMenu(false);
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    authLogout();
    setShowLogoutModal(false);
    navigate('/');
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const getProfilePath = () => {
    if (user?.role === 'mechanic') return '/mechanic-profile';
    if (user?.role === 'user') return '/profile';
    return '/dashboard'; // Admin doesn't have profile, go to dashboard
  };

  const profilePath = getProfilePath();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-950/80 backdrop-blur-lg border-b border-anthracite-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <span className="text-2xl font-bold text-gradient">P.A.R.C.E</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {!isAuthenticated ? (
              <>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Inicio
                </Link>
                <Link to="/register" className="text-gray-300 hover:text-white transition-colors">
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
            ) : user?.role === 'admin' || user?.role === 'mechanic' || hideNavLinks ? (
              <>
                {/* User Menu for Mechanic or when hideNavLinks is true - No navigation links */}
                <div className="relative ml-auto">
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
                          to={profilePath}
                          className="flex items-center gap-2 px-4 py-3 text-gray-300 hover:bg-dark-800 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="w-4 h-4" />
                          Perfil
                        </Link>
                        {user?.role === 'user' && (
                          <Link
                            to="/payment"
                            className="flex items-center gap-2 px-4 py-3 text-gray-300 hover:bg-dark-800 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <CreditCard className="w-4 h-4" />
                            Métodos de Pago
                          </Link>
                        )}
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
            ) : (
              <>
                <Link to="/services" className="text-gray-300 hover:text-white transition-colors">
                  Servicios
                </Link>
                <Link to="/payment" className="text-gray-300 hover:text-white transition-colors">
                  Pagos
                </Link>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contacto
                </Link>
                
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
                          to={profilePath}
                          className="flex items-center gap-2 px-4 py-3 text-gray-300 hover:bg-dark-800 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="w-4 h-4" />
                          Perfil
                        </Link>
                        {user?.role === 'user' && (
                          <Link
                            to="/payment"
                            className="flex items-center gap-2 px-4 py-3 text-gray-300 hover:bg-dark-800 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <CreditCard className="w-4 h-4" />
                            Métodos de Pago
                          </Link>
                        )}
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
                  <Link to="/register" className="block px-4 py-2 text-gray-300 hover:bg-dark-800 rounded-lg">
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
              ) : hideNavLinks ? (
                <>
                  <Link to={profilePath} className="block px-4 py-2 text-gray-300 hover:bg-dark-800 rounded-lg">
                    Perfil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-400 hover:bg-dark-800 rounded-lg"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <Link to="/services" className="block px-4 py-2 text-gray-300 hover:bg-dark-800 rounded-lg">
                    Servicios
                  </Link>
                  <Link to="/payment" className="block px-4 py-2 text-gray-300 hover:bg-dark-800 rounded-lg">
                    Pagos
                  </Link>
                  <Link to="/contact" className="block px-4 py-2 text-gray-300 hover:bg-dark-800 rounded-lg">
                    Contacto
                  </Link>
                  <Link to="/profile" className="block px-4 py-2 text-gray-300 hover:bg-dark-800 rounded-lg">
                    Perfil
                  </Link>
                  {user?.role === 'user' && (
                    <Link to="/payment" className="block px-4 py-2 text-gray-300 hover:bg-dark-800 rounded-lg">
                      Métodos de Pago
                    </Link>
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

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            style={{ marginLeft: 0 }}
            onClick={cancelLogout}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-anthracite-950 border-2 border-anthracite-700 rounded-2xl p-8 w-full max-w-md shadow-2xl"
            >
              <div className="text-center space-y-6">
                <div className="w-16 h-16 mx-auto bg-red-600/20 rounded-full flex items-center justify-center">
                  <LogOut className="w-8 h-8 text-red-500" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Cerrar Sesión</h3>
                  <p className="text-gray-400">¿Estás seguro de que deseas cerrar sesión?</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={cancelLogout}
                    className="flex-1 px-6 py-3 bg-anthracite-800 hover:bg-anthracite-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmLogout}
                    className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
