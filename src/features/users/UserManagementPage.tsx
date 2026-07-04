import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import UserList from './UserList';
import UserForm from './UserForm';
import UserFilters from './UserFilters';
import { User, UserFormData, UserFilters as UserFiltersType } from './types';

export default function UserManagementPage() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [filters, setFilters] = useState<UserFiltersType>({
    search: '',
    status: undefined,
    role: undefined,
  });

  // Datos de ejemplo - en producción vendrían de una API
  const [users, setUsers] = useState<User[]>([
    { 
      id: 1, 
      name: 'Carlos Rodríguez', 
      email: 'carlos@email.com', 
      phone: '+57 300 123 4567', 
      status: 'active',
      role: 'user',
      createdAt: '2024-01-15',
    },
    { 
      id: 2, 
      name: 'María González', 
      email: 'maria@email.com', 
      phone: '+57 301 987 6543', 
      status: 'active',
      role: 'user',
      createdAt: '2024-02-20',
    },
    { 
      id: 3, 
      name: 'Juan Burbano', 
      email: 'juan@email.com', 
      phone: '+57 310 111 2222', 
      status: 'active',
      role: 'mechanic',
      createdAt: '2024-01-10',
    },
    { 
      id: 4, 
      name: 'Ana López', 
      email: 'ana@email.com', 
      phone: '+57 311 333 4444', 
      status: 'inactive',
      role: 'mechanic',
      createdAt: '2024-03-05',
    },
    { 
      id: 5, 
      name: 'Admin Principal', 
      email: 'admin@parce.com', 
      phone: '+57 320 555 7777', 
      status: 'active',
      role: 'admin',
      createdAt: '2023-12-01',
    },
  ]);

  // Filtrar usuarios
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         user.email.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = !filters.status || user.status === filters.status;
    const matchesRole = !filters.role || user.role === filters.role;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleCreateUser = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleSaveUser = (data: UserFormData) => {
    if (editingUser) {
      // Actualizar usuario existente
      setUsers(users.map(u => 
        u.id === editingUser.id 
          ? { ...u, ...data, updatedAt: new Date().toISOString() }
          : u
      ));
    } else {
      // Crear nuevo usuario
      const newUser: User = {
        id: Math.max(...users.map(u => u.id)) + 1,
        ...data,
        createdAt: new Date().toISOString(),
      };
      setUsers([...users, newUser]);
    }
    setShowModal(false);
    setEditingUser(null);
  };

  const handleDeleteUser = (id: number) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const handleCancelForm = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  // Estadísticas
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
    admins: users.filter(u => u.role === 'admin').length,
    mechanics: users.filter(u => u.role === 'mechanic').length,
    regularUsers: users.filter(u => u.role === 'user').length,
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar isAuthenticated userName={user?.name || 'Administrador'} hideNavLinks />
      <Sidebar />
      
      <main className="ml-64 pt-16 p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Users className="w-8 h-8 text-gold-500" />
                Gestión de Usuarios
              </h1>
              <p className="text-gray-400">Administra todos los usuarios de la plataforma</p>
            </div>
            <button 
              onClick={handleCreateUser}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nuevo Usuario
            </button>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="card p-4">
              <p className="text-gray-400 text-sm mb-1">Total</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="card p-4">
              <p className="text-gray-400 text-sm mb-1">Activos</p>
              <p className="text-2xl font-bold text-green-400">{stats.active}</p>
            </div>
            <div className="card p-4">
              <p className="text-gray-400 text-sm mb-1">Inactivos</p>
              <p className="text-2xl font-bold text-red-400">{stats.inactive}</p>
            </div>
            <div className="card p-4">
              <p className="text-gray-400 text-sm mb-1">Usuarios</p>
              <p className="text-2xl font-bold text-blue-400">{stats.regularUsers}</p>
            </div>
            <div className="card p-4">
              <p className="text-gray-400 text-sm mb-1">Mecánicos</p>
              <p className="text-2xl font-bold text-purple-400">{stats.mechanics}</p>
            </div>
            <div className="card p-4">
              <p className="text-gray-400 text-sm mb-1">Admins</p>
              <p className="text-2xl font-bold text-gold-400">{stats.admins}</p>
            </div>
          </div>

          {/* Filtros */}
          <UserFilters filters={filters} onFilterChange={setFilters} />

          {/* Lista de usuarios */}
          <UserList 
            users={filteredUsers}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
          />

          {/* Resultados */}
          <div className="text-center text-gray-400 text-sm">
            Mostrando {filteredUsers.length} de {users.length} usuarios
          </div>
        </motion.div>
      </main>

      {/* Modal de formulario */}
      <AnimatePresence>
        {showModal && (
          <UserForm
            user={editingUser}
            onSave={handleSaveUser}
            onCancel={handleCancelForm}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
