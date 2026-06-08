import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Eye, DollarSign, CheckCircle, Clock, XCircle, Package } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../../controllers/AuthContext';

interface PaymentRecord {
  id: number;
  serviceType: string;
  userName: string;
  mechanicName: string;
  serviceAmount: number;
  partsAmount: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'transfer';
  status: 'pending' | 'confirmed' | 'rejected';
  date: string;
  parts?: { name: string; cost: number }[];
}

const MOCK_PAYMENTS: PaymentRecord[] = [
  {
    id: 1, serviceType: 'Cambio de llanta', userName: 'Carlos Rodríguez', mechanicName: 'Roberto Silva',
    serviceAmount: 50000, partsAmount: 30000, totalAmount: 80000,
    paymentMethod: 'cash', status: 'confirmed', date: '2026-06-07 10:30',
    parts: [{ name: 'Llanta 195/65 R15', cost: 30000 }],
  },
  {
    id: 2, serviceType: 'Diagnóstico mecánico', userName: 'María González', mechanicName: 'Luis Herrera',
    serviceAmount: 80000, partsAmount: 45000, totalAmount: 125000,
    paymentMethod: 'card', status: 'confirmed', date: '2026-06-07 11:00',
    parts: [{ name: 'Filtro de aceite', cost: 20000 }, { name: 'Aceite 5W-30 (4L)', cost: 25000 }],
  },
  {
    id: 3, serviceType: 'Carga de batería', userName: 'Ana López', mechanicName: 'Jorge Vargas',
    serviceAmount: 60000, partsAmount: 0, totalAmount: 60000,
    paymentMethod: 'transfer', status: 'pending', date: '2026-06-07 13:15',
  },
  {
    id: 4, serviceType: 'Suministro de combustible', userName: 'Pedro Martínez', mechanicName: 'Roberto Silva',
    serviceAmount: 25000, partsAmount: 50000, totalAmount: 75000,
    paymentMethod: 'cash', status: 'pending', date: '2026-06-06 16:00',
    parts: [{ name: 'Gasolina corriente (5L)', cost: 50000 }],
  },
];

const methodLabel = { cash: '💵 Efectivo', card: '💳 Tarjeta', transfer: '📱 Transferencia' };
const statusConfig = {
  pending: { label: 'Pendiente', color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
  confirmed: { label: 'Confirmado', color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
  rejected: { label: 'Rechazado', color: 'bg-red-500/20 text-red-400', icon: XCircle },
};

export default function AdminPaymentsPage() {
  const { user } = useAuth();
  const [payments] = useState<PaymentRecord[]>(MOCK_PAYMENTS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | PaymentRecord['status']>('all');
  const [viewDetail, setViewDetail] = useState<PaymentRecord | null>(null);

  const filtered = payments.filter(p => {
    const matchSearch = p.serviceType.toLowerCase().includes(search.toLowerCase()) ||
      p.userName.toLowerCase().includes(search.toLowerCase()) ||
      p.mechanicName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalRevenue = payments.filter(p => p.status === 'confirmed').reduce((a, p) => a + p.totalAmount, 0);
  const pendingAmount = payments.filter(p => p.status === 'pending').reduce((a, p) => a + p.totalAmount, 0);

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar isAuthenticated userName={user?.name || 'Admin'} hideNavLinks />
      <Sidebar />
      <main className="ml-64 pt-16 p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Pagos y Facturación</h1>
            <p className="text-gray-400 text-sm mt-1">Historial completo de pagos — incluye cobros de repuestos</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="card p-4">
              <p className="text-xs text-gray-400 mb-1">Total ingresos confirmados</p>
              <p className="text-2xl font-bold text-green-400">${totalRevenue.toLocaleString()}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-gray-400 mb-1">Por confirmar</p>
              <p className="text-2xl font-bold text-yellow-400">${pendingAmount.toLocaleString()}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-gray-400 mb-1">Pagos confirmados</p>
              <p className="text-2xl font-bold text-white">{payments.filter(p => p.status === 'confirmed').length}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-gray-400 mb-1">Pendientes</p>
              <p className="text-2xl font-bold text-white">{payments.filter(p => p.status === 'pending').length}</p>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por servicio, usuario o mecánico..."
                className="input-field pl-9 text-sm" />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}
              className="input-field text-sm">
              <option value="all">Todos</option>
              <option value="pending">Pendientes</option>
              <option value="confirmed">Confirmados</option>
              <option value="rejected">Rechazados</option>
            </select>
          </div>

          {/* Tabla */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-anthracite-700">
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Servicio</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Partes</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Total</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Método</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Estado</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-anthracite-800">
                  {filtered.map(p => {
                    const cfg = statusConfig[p.status];
                    const StatusIcon = cfg.icon;
                    return (
                      <tr key={p.id} className="hover:bg-dark-800/40 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-white font-medium">{p.serviceType}</p>
                          <p className="text-gray-500 text-xs">{p.userName} → {p.mechanicName}</p>
                          <p className="text-gray-600 text-xs">{p.date}</p>
                        </td>
                        <td className="px-4 py-3">
                          {p.partsAmount > 0 ? (
                            <div className="flex items-center gap-1 text-orange-400 text-xs">
                              <Package className="w-3.5 h-3.5" />
                              <span>+${p.partsAmount.toLocaleString()}</span>
                            </div>
                          ) : <span className="text-gray-600 text-xs">Sin repuestos</span>}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-white font-bold">${p.totalAmount.toLocaleString()}</p>
                          <p className="text-gray-500 text-xs">Servicio: ${p.serviceAmount.toLocaleString()}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-300 text-xs">{methodLabel[p.paymentMethod]}</td>
                        <td className="px-4 py-3">
                          <span className={`flex items-center gap-1 w-fit px-2 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
                            <StatusIcon className="w-3 h-3" /> {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => setViewDetail(p)}
                            className="p-1.5 hover:bg-dark-700 rounded-lg transition-colors text-gray-400 hover:text-white">
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No se encontraron pagos</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </main>

      {/* Modal detalle pago */}
      {viewDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setViewDetail(null)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            onClick={e => e.stopPropagation()} className="card p-6 max-w-md w-full mx-4 space-y-4">
            <h3 className="text-xl font-bold text-white">Detalle del Pago</h3>
            <div className="space-y-2 text-sm">
              {[
                ['Servicio', viewDetail.serviceType],
                ['Usuario', viewDetail.userName],
                ['Mecánico', viewDetail.mechanicName],
                ['Fecha', viewDetail.date],
                ['Método', methodLabel[viewDetail.paymentMethod]],
                ['Costo servicio', `$${viewDetail.serviceAmount.toLocaleString()}`],
                ['Costo repuestos', `$${viewDetail.partsAmount.toLocaleString()}`],
                ['TOTAL', `$${viewDetail.totalAmount.toLocaleString()}`],
                ['Estado', statusConfig[viewDetail.status].label],
              ].map(([label, value]) => (
                <div key={label} className={`flex justify-between py-2 border-b border-anthracite-800 ${label === 'TOTAL' ? 'text-gold-400 font-bold' : ''}`}>
                  <span className="text-gray-400">{label}</span>
                  <span className={label === 'TOTAL' ? 'text-gold-400 font-bold' : 'text-white font-medium'}>{value}</span>
                </div>
              ))}
              {/* Desglose de repuestos */}
              {viewDetail.parts && viewDetail.parts.length > 0 && (
                <div className="pt-2">
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Repuestos utilizados</p>
                  {viewDetail.parts.map((part, i) => (
                    <div key={i} className="flex justify-between py-1 text-sm">
                      <span className="text-gray-300 flex items-center gap-1.5"><Package className="w-3 h-3 text-orange-400" />{part.name}</span>
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
