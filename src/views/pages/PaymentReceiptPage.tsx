// RF 5.4 – Emitir comprobante de pago
// Genera un comprobante digital tras cualquier pago realizado
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle, Download, Printer, ArrowLeft,
  CreditCard, DollarSign, Building2, Package, Hash
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../../controllers/AuthContext';

// Datos del comprobante — en producción vendrían de un contexto o parámetros de ruta
const MOCK_RECEIPT = {
  receiptNumber: 'REC-2026-00847',
  date: new Date().toLocaleString('es-CO', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }),
  client: {
    name: 'Juan Gustavo',
    email: 'juangustavo@email.com',
    document: '1.098.765.432',
  },
  mechanic: {
    name: 'María González',
    plate: 'PDF-345',
    specialty: 'Mecánica General',
  },
  service: {
    title: 'Suministro de Combustible a Domicilio',
    description: 'Gasolina corriente — 5 litros a domicilio',
    amount: 60000,
  },
  parts: [
    { name: 'Gasolina corriente (5L)', cost: 25000 },
  ],
  partsTotal: 25000,
  total: 85000,
  paymentMethod: 'pse' as 'cash' | 'card' | 'pse',
  pseBank: 'Bancolombia',
  status: 'confirmed' as const,
};

const METHOD_INFO = {
  cash:  { label: 'Efectivo',              icon: DollarSign,  color: 'text-green-400'  },
  card:  { label: 'Tarjeta débito/crédito', icon: CreditCard, color: 'text-blue-400'   },
  pse:   { label: 'PSE — Transferencia',   icon: Building2,   color: 'text-purple-400' },
};

const f = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

export default function PaymentReceiptPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const r = MOCK_RECEIPT;
  const method = METHOD_INFO[r.paymentMethod];
  const MethodIcon = method.icon;
  const [printed, setPrinted] = useState(false);

  const handlePrint = () => {
    setPrinted(true);
    window.print();
    setTimeout(() => setPrinted(false), 2000);
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar isAuthenticated userName={user?.name || 'Usuario'} hideNavLinks />
      <main className="pt-20 pb-12 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto space-y-6">

          {/* Botón volver */}
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>

          {/* Header del comprobante */}
          <div className="card p-6 text-center space-y-3">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Comprobante de Pago</h1>
              <p className="text-gray-400 text-sm mt-1">RF 5.4 — Constancia digital del servicio realizado</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm">
              <Hash className="w-4 h-4 text-gold-400" />
              <span className="text-gold-400 font-mono font-bold">{r.receiptNumber}</span>
            </div>
            <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-semibold border border-green-500/30">
              ✓ Pago confirmado
            </span>
          </div>

          {/* Cuerpo del comprobante */}
          <div className="card divide-y divide-anthracite-800">

            {/* Fecha */}
            <div className="px-6 py-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Fecha y hora</p>
              <p className="text-white font-medium text-sm">{r.date}</p>
            </div>

            {/* Cliente */}
            <div className="px-6 py-4">
              <p className="text-xs text-gold-400 uppercase tracking-wider font-semibold mb-2">Cliente</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Nombre</span><span className="text-white">{r.client.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Email</span><span className="text-gray-300">{r.client.email}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Documento</span><span className="text-gray-300">{r.client.document}</span></div>
              </div>
            </div>

            {/* Mecánico */}
            <div className="px-6 py-4">
              <p className="text-xs text-blue-400 uppercase tracking-wider font-semibold mb-2">Proveedor del servicio</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Mecánico</span><span className="text-white">{r.mechanic.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Placa</span><span className="text-gray-300">{r.mechanic.plate}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Especialidad</span><span className="text-gray-300">{r.mechanic.specialty}</span></div>
              </div>
            </div>

            {/* Servicio */}
            <div className="px-6 py-4">
              <p className="text-xs text-purple-400 uppercase tracking-wider font-semibold mb-2">Servicio realizado</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Servicio</span><span className="text-white">{r.service.title}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Descripción</span><span className="text-gray-300 text-right max-w-48">{r.service.description}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Costo servicio</span><span className="text-white">{f(r.service.amount)}</span></div>
              </div>
            </div>

            {/* Repuestos (si aplica) */}
            {r.parts.length > 0 && (
              <div className="px-6 py-4">
                <p className="text-xs text-orange-400 uppercase tracking-wider font-semibold mb-2">Repuestos utilizados</p>
                {r.parts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-1">
                    <span className="text-gray-300 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-orange-400" /> {p.name}
                    </span>
                    <span className="text-orange-400">{f(p.cost)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm pt-2 border-t border-anthracite-800 mt-2">
                  <span className="text-gray-400">Subtotal repuestos</span>
                  <span className="text-orange-400 font-semibold">{f(r.partsTotal)}</span>
                </div>
              </div>
            )}

            {/* Método de pago */}
            <div className="px-6 py-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Método de pago</p>
              <div className="flex items-center gap-2">
                <MethodIcon className={`w-5 h-5 ${method.color}`} />
                <span className={`font-semibold text-sm ${method.color}`}>{method.label}</span>
                {r.pseBank && <span className="text-gray-400 text-sm">— {r.pseBank}</span>}
              </div>
            </div>

            {/* Total */}
            <div className="px-6 py-5 bg-gradient-to-r from-gold-600/10 to-transparent">
              <div className="flex items-center justify-between">
                <span className="text-white font-bold text-lg">TOTAL PAGADO</span>
                <span className="text-gold-400 font-bold text-2xl">{f(r.total)}</span>
              </div>
              <p className="text-gray-500 text-xs mt-1">Servicio: {f(r.service.amount)} + Repuestos: {f(r.partsTotal)}</p>
            </div>
          </div>

          {/* Acciones */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={handlePrint}
              className="flex items-center justify-center gap-2 py-3 bg-dark-800 hover:bg-dark-700 border border-anthracite-700 text-white rounded-xl transition-colors text-sm font-semibold">
              <Printer className="w-4 h-4" />
              {printed ? 'Imprimiendo...' : 'Imprimir'}
            </button>
            <button onClick={handlePrint}
              className="flex items-center justify-center gap-2 py-3 btn-primary text-sm font-semibold">
              <Download className="w-4 h-4" /> Descargar PDF
            </button>
          </div>

          {/* Nota legal */}
          <p className="text-center text-gray-600 text-xs leading-relaxed">
            Este comprobante es la constancia digital del servicio prestado por P.A.R.C.E.
            Número de referencia: <span className="font-mono text-gray-500">{r.receiptNumber}</span>
          </p>

        </motion.div>
      </main>
    </div>
  );
}
