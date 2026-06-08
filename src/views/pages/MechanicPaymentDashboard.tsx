import { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, CheckCircle, Clock, Package, Eye } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../../controllers/AuthContext';

interface Payment {
  id: number;
  userName: string;
  serviceType: string;
  serviceAmount: number;
  partsAmount: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'transfer';
  status: 'pending_confirmation' | 'confirmed';
  date: string;
  parts?: { name: string; cost: number }[];
}

const MOCK: Payment[] = [
  {
    id: 1, userName: 'Carlos Rodríguez', serviceType: 'Cambio de llanta',
    serviceAmount: 50000, partsAmount: 30000, totalAmount: 80000,
    paymentMethod: 'cash', status: 'pending_confirmation', date: '2026-06-07 10:30',
    parts: [{ name: 'Llanta 195/65 R15', cost: 30000 }],
  },
  {
    id: 2, userName: 'María González', serviceType: 'Diagnóstico mecánico',
    serviceAmount: 80000, partsAmount: 45000, totalAmount: 125000,
    paymentMethod: 'card', status: 'confirmed', date: '2026-06-07 11:00',
    parts: [{ name: 'Filtro de aceite', cost: 20000 }, { name: 'Aceite 5W-30 (4L)', cost: 25000 }],
  },
];

const methodLabel = { cash: '💵 Efectivo', card: '💳 Tarjeta', transfer: '📱 Transferencia' };

export default function MechanicPaymentDashboard() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>(MOCK);
  const [viewDetail, setViewDetail] = useState<Payment | null>(null);

  const handleConfirm = (id: number) => {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'confirmed' as const } : p));
  };

  const totalEarned = payments.filter(p => p.status === 'confirmed').reduce((a, p) => a + p.totalAmount, 0);

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar isAuthenticated userName={user?.name || 'Mecánico'} hideNavLinks />
      <Sidebar />
      <main className="ml-64 pt-16 p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Mis Pagos</h1>
            <p className="text-gray-400 text-sm mt-1">Confirma los pagos recibidos de tus servicios</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="card p-5 flex items-center gap-4">
              <DollarSign className="w-10 h-10 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">${totalEarned.toLocaleString()}</p>
                <p className="text-gray-400 text-xs">Total confirmado</p>
              </div>
            </div>
            <div className="card p-5 flex items-center gap-4">
              <Clock className="w-10 h-10 text-yellow-400" />
              <div>
                <p className="text-2xl font-bold text-white">{payments.filter(p => p.status === 'pending_confirmation').length}</p>
                <p className="text-gray-400 text-xs">Por confirmar</p>
              </div>
            </div>
            <div className="card p-5 flex items-center gap-4">
              <CheckCircle className="w-10 h-10 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">{payments.filter(p => p.status === 'confirmed').length}</p>
                <p className="text-gray-400 text-xs">Confirmados</p>
              </div>
            </div>
          </div>

          {/* Lista de pagos */}
          <div className="space-y-3">
            {payments.map(p => (
              <div key={p.id} className={`card p-5 border-l-4 ${p.status === 'confirmed' ? 'border-green-500' : 'border-yellow-500'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <p className="text-white font-bold">{p.serviceType}</p>
                    <p className="text-gray-400 text-sm">Cliente: {p.userName}</p>
                    <p className="text-gray-500 text-xs">{p.date} · {methodLabel[p.paymentMethod]}</p>
                    <div className="flex items-center gap-4 pt-1">
                      <span className="text-white font-bold text-lg">${p.totalAmount.toLocaleString()}</span>
                      {p.partsAmount > 0 && (
                        <span className="flex items-center gap-1 text-orange-400 text-xs">
                          <Package className="w-3 h-3" /> Repuestos: ${p.partsAmount.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setViewDetail(p)}
                      className="p-2 hover:bg-dark-700 rounded-lg transition-colors text-gray-400 hover:text-white">
                      <Eye className="w-4 h-4" />
                    </button>
                    {p.status === 'pending_confirmation' ? (
                      <button onClick={() => handleConfirm(p.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Confirmar pago
                      </button>
                    ) : (
                      <span className="flex items-center gap-1.5 px-3 py-2 bg-green-500/20 text-green-400 rounded-xl text-sm font-medium">
                        <CheckCircle className="w-4 h-4" /> Confirmado
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Modal detalle */}
      {viewDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setViewDetail(null)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            onClick={e => e.stopPropagation()} className="card p-6 max-w-md w-full mx-4 space-y-4">
            <h3 className="text-xl font-bold text-white">Detalle del Pago</h3>
            <div className="space-y-2 text-sm">
              {[
                ['Servicio', viewDetail.serviceType], ['Cliente', viewDetail.userName],
                ['Fecha', viewDetail.date], ['Método', methodLabel[viewDetail.paymentMethod]],
                ['Servicio', `$${viewDetail.serviceAmount.toLocaleString()}`],
                ['Repuestos', `$${viewDetail.partsAmount.toLocaleString()}`],
                ['TOTAL', `$${viewDetail.totalAmount.toLocaleString()}`],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-2 border-b border-anthracite-800">
                  <span className="text-gray-400">{label}</span>
                  <span className={label === 'TOTAL' ? 'text-gold-400 font-bold' : 'text-white'}>{value}</span>
                </div>
              ))}
              {viewDetail.parts && viewDetail.parts.length > 0 && (
                <div className="pt-2">
                  <p className="text-gray-500 text-xs uppercase mb-2">Repuestos</p>
                  {viewDetail.parts.map((part, i) => (
                    <div key={i} className="flex justify-between text-sm py-1">
                      <span className="text-gray-300">{part.name}</span>
                      <span className="text-orange-400">${part.cost.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => setViewDetail(null)} className="w-full btn-primary">Cerrar</button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
