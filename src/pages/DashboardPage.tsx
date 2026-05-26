import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Wrench, FileText, Plus, Edit, Trash2, X, Search, Star } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [users, setUsers] = useState([
    { id: 1, name: 'Carlos Rodríguez', email: 'carlos@email.com', phone: '+57 300 123 4567', status: 'active' },
    { id: 2, name: 'María González', email: 'maria@email.com', phone: '+57 301 987 6543', status: 'active' },
  ]);

  const [mechanics, setMechanics] = useState([
    { id: 1, name: 'Juan Burbano', email: 'juan@email.com', phone: '+57 310 111 2222', status: 'active', rating: 4.8 },
    { id: 2, name: 'Ana López', email: 'ana@email.com', phone: '+57 311 333 4444', status: 'active', rating: 4.9 },
  ]);

  const [services, setServices] = useState([
    { id: 1, name: 'Entrega de gasolina', description: 'Servicio de entrega de gasolina', duration: '30-45 min', price: '$50.000', status: 'active' },
    { id: 2, name: 'Cambio de llanta', description: 'Reparación o cambio de neumáticos', duration: '45-60 min', price: '$80.000', status: 'active' },
  ]);

  const handleDelete = (id) => {
    if (!confirm('¿Eliminar este elemento?')) return;
    if (activeTab === 'users') setUsers(users.filter(u => u.id !== id));
    else if (activeTab === 'mechanics') setMechanics(mechanics.filter(m => m.id !== id));
    else setServices(services.filter(s => s.id !== id));
  };

  const getCurrentData = () => {
    if (activeTab === 'users') return users;
    if (activeTab === 'mechanics') return mechanics;
    return services;
  };

  const filteredData = getCurrentData().filter(item =>
    Object.values(item).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar isAuthenticated userName="Administrador" />
      <Sidebar />
      <main className="ml-64 pt-16 p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Panel de Administración</h1>
            <p className="text-gray-400">Gestiona usuarios, mecánicos y servicios</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-400 text-sm font-medium">Usuarios</h3>
                <Users className="w-8 h-8 text-gold-500" />
              </div>
              <p className="text-3xl font-bold text-white">{users.length}</p>
            </div>
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-400 text-sm font-medium">Mecánicos</h3>
                <Wrench className="w-8 h-8 text-anthracite-500" />
              </div>
              <p className="text-3xl font-bold text-white">{mechanics.length}</p>
            </div>
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-400 text-sm font-medium">Servicios</h3>
                <FileText className="w-8 h-8 text-gold-500" />
              </div>
              <p className="text-3xl font-bold text-white">{services.length}</p>
            </div>
          </div>

          <div className="flex gap-4 border-b border-anthracite-800">
            {['users', 'mechanics', 'services'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 font-medium transition-colors ${activeTab === tab ? 'text-gold-500 border-b-2 border-gold-500' : 'text-gray-400 hover:text-white'}`}>
                {tab === 'users' ? 'Usuarios' : tab === 'mechanics' ? 'Mecánicos' : 'Servicios'}
              </button>
            ))}
          </div>

          <div className="flex gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field pl-10 w-full" />
            </div>
            <button onClick={() => { setEditingItem(null); setShowModal(true); }} className="btn-primary flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Crear Nuevo
            </button>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Nombre</th>
                    {activeTab !== 'services' && <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Email</th>}
                    {activeTab === 'services' && <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Precio</th>}
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Estado</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-anthracite-800">
                  {filteredData.map(item => (
                    <tr key={item.id} className="hover:bg-dark-800/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-300">{item.id}</td>
                      <td className="px-6 py-4 text-sm text-white font-medium">{item.name}</td>
                      {activeTab !== 'services' && <td className="px-6 py-4 text-sm text-gray-300">{item.email}</td>}
                      {activeTab === 'services' && <td className="px-6 py-4 text-sm text-gray-300">{item.price}</td>}
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {item.status === 'active' ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingItem(item); setShowModal(true); }} className="p-2 bg-gold-500/20 text-gold-400 rounded-lg hover:bg-gold-500/30 transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
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
        </motion.div>
      </main>
    </div>
  );
}
