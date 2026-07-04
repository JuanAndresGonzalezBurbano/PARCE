import { User } from './types';
import { Edit, Trash2 } from 'lucide-react';

interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
}

export default function UserList({ users, onEdit, onDelete }: UserListProps) {
  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`¿Estás seguro de eliminar al usuario "${name}"?`)) {
      onDelete(id);
    }
  };

  if (users.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-gray-400">No se encontraron usuarios</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-dark-800">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">ID</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Nombre</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Email</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Teléfono</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Rol</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Estado</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-anthracite-800">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-dark-800/50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-300">{user.id}</td>
                <td className="px-6 py-4 text-sm text-white font-medium">{user.name}</td>
                <td className="px-6 py-4 text-sm text-gray-300">{user.email}</td>
                <td className="px-6 py-4 text-sm text-gray-300">{user.phone}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                    user.role === 'mechanic' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {user.role === 'admin' ? 'Admin' : user.role === 'mechanic' ? 'Mecánico' : 'Usuario'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {user.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => onEdit(user)} 
                      className="p-2 bg-gold-500/20 text-gold-400 rounded-lg hover:bg-gold-500/30 transition-colors"
                      title="Editar usuario"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(user.id, user.name)} 
                      className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                      title="Eliminar usuario"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
