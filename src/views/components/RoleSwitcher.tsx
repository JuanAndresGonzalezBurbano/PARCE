import { useAuth, UserRole } from '../controllers/AuthContext';
import { User, Wrench, LogIn } from 'lucide-react';

export default function RoleSwitcher() {
  const { user, isAuthenticated, login, selectRole, logout } = useAuth();

  // Si no está autenticado, mostrar pantalla de selección de rol
  if (!isAuthenticated) {
    return (
      <div className="card p-8 max-w-sm w-full space-y-6 text-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">P.A.R.C.E</h2>
          <p className="text-gray-400 text-sm">Selecciona un rol para continuar</p>
        </div>
        <div className="space-y-3">
          <button
            onClick={() => login('cliente@parce.com', '123', 'user')}
            className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-anthracite-700 hover:border-gold-500 hover:bg-gold-500/10 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center">
              <User className="w-5 h-5 text-gold-400" />
            </div>
            <div className="text-left">
              <p className="text-white font-semibold group-hover:text-gold-400 transition-colors">Entrar como Cliente</p>
              <p className="text-gray-500 text-xs">Ver módulo de pago del cliente</p>
            </div>
          </button>
          <button
            onClick={() => login('mecanico@parce.com', '123', 'mechanic')}
            className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-anthracite-700 hover:border-blue-500 hover:bg-blue-500/10 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-left">
              <p className="text-white font-semibold group-hover:text-blue-400 transition-colors">Entrar como Mecánico</p>
              <p className="text-gray-500 text-xs">Ver panel de cobros del mecánico</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Si está autenticado, mostrar botón flotante para cambiar de rol
  const roles: { role: UserRole; label: string; icon: React.ElementType; color: string }[] = [
    { role: 'user', label: 'Cliente', icon: User, color: 'text-gold-400' },
    { role: 'mechanic', label: 'Mecánico', icon: Wrench, color: 'text-blue-400' },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      <div className="flex items-center gap-2 bg-anthracite-900 border border-anthracite-700 rounded-full px-3 py-2 shadow-xl">
        {roles.map(({ role, label, icon: Icon, color }) => (
          <button
            key={role}
            onClick={() => selectRole(role)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              user?.role === role
                ? 'bg-anthracite-700 text-white'
                : 'text-gray-500 hover:text-white'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${user?.role === role ? color : ''}`} />
            {label}
          </button>
        ))}
        <div className="w-px h-4 bg-anthracite-700" />
        <button
          onClick={logout}
          className="flex items-center gap-1 px-2 py-1.5 rounded-full text-xs text-red-400 hover:text-red-300 transition-colors"
        >
          <LogIn className="w-3.5 h-3.5" />
          Salir
        </button>
      </div>
      <p className="text-gray-600 text-xs pr-2">
        Rol actual: <span className="text-gray-400">{user?.role === 'mechanic' ? 'Mecánico' : 'Cliente'}</span>
      </p>
    </div>
  );
}
