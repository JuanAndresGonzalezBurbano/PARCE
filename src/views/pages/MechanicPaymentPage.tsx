import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DollarSign, Plus, Trash2, CheckCircle, Package } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../../controllers/AuthContext';

interface Part {
  id: number;
  name: string;
  cost: number;
}

export default function MechanicPaymentPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [parts, setParts] = useState<Part[]>([]);
  const [newPart, setNewPart] = useState({ name: '', cost: '' });
  const [serviceAmount] = useState(80000);
  const [confirmed, setConfirmed] = useState(false);

  const addPart = () => {
    if (!newPart.name.trim() || !newPart.cost) return;
    setParts(prev => [...prev, { id: Date.now(), name: newPart.name, cost: Number(newPart.cost) }]);
    setNewPart({ name: '', cost: '' });
  };

  const removePart = (id: number) => setParts(prev => prev.filter(p => p.id !== id));

  const totalParts = parts.reduce((a, p) => a + p.cost, 0);
  const total = serviceAmount + totalParts;

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(() => navigate('/mechanic-home'), 2500);
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar isAuthenticated userName={user?.name || 'Mecánico'} hideNavLinks />
      <Sidebar />
      <main className="ml-64 pt-16 p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
          {confirmed ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="card p-12 text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
              <h2 className="text-2xl font-bold text-white">¡Cobro registrado!</h2>
              <p className="text-gray-400">El usuario recibirá la factura detallada.</p>
              <p className="text-3xl font-bold text-gold-400">${total.toLocaleString()}</p>
            </motion.div>
          ) : (
            <>
              <div>
                <h1 className="text-3xl font-bold text-white">Registrar Cobro</h1>
                <p className="text-gray-400 text-sm mt-1">Agrega los repuestos utilizados para generar la factura completa</p>
              </div>

              {/* Costo del servicio */}
              <div className="card p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-6 h-6 text-gold-500" />
                    <div>
                      <p className="text-white font-bold">Costo del servicio</p>
                      <p className="text-gray-400 text-sm">Tarifa base del servicio prestado</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-white">${serviceAmount.toLocaleString()}</p>
                </div>
              </div>

              {/* Agregar repuestos */}
              <div className="card p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-orange-400" />
                  <h3 className="text-white font-bold">Repuestos utilizados</h3>
                </div>
                <div className="flex gap-2">
                  <input type="text" value={newPart.name} onChange={e => setNewPart(p => ({ ...p, name: e.target.value }))}
                    placeholder="Nombre del repuesto" className="input-field flex-1 text-sm" />
                  <input type="number" value={newPart.cost} onChange={e => setNewPart(p => ({ ...p, cost: e.target.value }))}
                    placeholder="Costo $" className="input-field w-32 text-sm" min="0" />
                  <button onClick={addPart} disabled={!newPart.name.trim() || !newPart.cost}
                    className="p-2.5 bg-gold-500 hover:bg-gold-600 disabled:opacity-40 rounded-xl transition-colors">
                    <Plus className="w-5 h-5 text-anthracite-950" />
                  </button>
                </div>

                {parts.length === 0 ? (
                  <p className="text-gray-600 text-sm text-center py-4">Sin repuestos — solo se cobra el servicio</p>
                ) : (
                  <div className="space-y-2">
                    {parts.map(part => (
                      <div key={part.id} className="flex items-center justify-between p-3 bg-dark-800 rounded-lg">
                        <span className="text-gray-300 text-sm">{part.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-orange-400 font-medium">${part.cost.toLocaleString()}</span>
                          <button onClick={() => removePart(part.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Resumen total */}
              <div className="card p-5 space-y-3">
                <h3 className="text-white font-bold">Resumen de cobro</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Servicio</span>
                    <span className="text-white">${serviceAmount.toLocaleString()}</span>
                  </div>
                  {parts.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Repuestos ({parts.length})</span>
                      <span className="text-orange-400">${totalParts.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-anthracite-700 text-lg">
                    <span className="text-white font-bold">Total a cobrar</span>
                    <span className="text-gold-400 font-bold">${total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button onClick={handleConfirm} className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" /> Confirmar cobro y generar factura
              </button>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}
