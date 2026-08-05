// RF 4.3 – Consultar inventario disponible
// RF 4.2 – Actualizar disponibilidad
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Search, Edit2, Eye, CheckCircle,
  XCircle, AlertTriangle, ChevronDown, X, Plus, Save
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../../controllers/AuthContext';

type AvailabilityStatus = 'available' | 'low_stock' | 'unavailable';

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  unit: string;
  unitPrice: number;
  status: AvailabilityStatus;
  lastUpdated: string;
}

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 1,  name: 'Llanta 195/65 R15',       category: 'Neumáticos',    stock: 12, minStock: 4,  unit: 'unidad',  unitPrice: 180000, status: 'available',   lastUpdated: '2026-06-07' },
  { id: 2,  name: 'Filtro de aceite',          category: 'Filtros',       stock: 3,  minStock: 5,  unit: 'unidad',  unitPrice: 25000,  status: 'low_stock',   lastUpdated: '2026-06-06' },
  { id: 3,  name: 'Aceite 5W-30 (1L)',         category: 'Lubricantes',   stock: 24, minStock: 10, unit: 'litro',   unitPrice: 18000,  status: 'available',   lastUpdated: '2026-06-07' },
  { id: 4,  name: 'Batería 12V 60Ah',          category: 'Eléctrico',     stock: 0,  minStock: 2,  unit: 'unidad',  unitPrice: 320000, status: 'unavailable', lastUpdated: '2026-06-05' },
  { id: 5,  name: 'Pastillas de freno delant.', category: 'Frenos',       stock: 8,  minStock: 4,  unit: 'juego',   unitPrice: 85000,  status: 'available',   lastUpdated: '2026-06-07' },
  { id: 6,  name: 'Gasolina corriente (galón)', category: 'Combustible',  stock: 2,  minStock: 5,  unit: 'galón',   unitPrice: 16000,  status: 'low_stock',   lastUpdated: '2026-06-07' },
  { id: 7,  name: 'Correa de distribución',     category: 'Motor',        stock: 5,  minStock: 2,  unit: 'unidad',  unitPrice: 95000,  status: 'available',   lastUpdated: '2026-06-04' },
  { id: 8,  name: 'Líquido de frenos DOT4',     category: 'Frenos',       stock: 0,  minStock: 3,  unit: 'litro',   unitPrice: 22000,  status: 'unavailable', lastUpdated: '2026-06-03' },
];

const STATUS_CFG: Record<AvailabilityStatus, { label: string; color: string; icon: React.ElementType }> = {
  available:   { label: 'Disponible',      color: 'bg-green-500/20 text-green-400 border-green-500/30',  icon: CheckCircle   },
  low_stock:   { label: 'Stock bajo',      color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: AlertTriangle },
  unavailable: { label: 'No disponible',   color: 'bg-red-500/20 text-red-400 border-red-500/30',         icon: XCircle       },
};

const CATEGORIES = ['Todos', 'Neumáticos', 'Filtros', 'Lubricantes', 'Eléctrico', 'Frenos', 'Combustible', 'Motor'];

function deriveStatus(stock: number, minStock: number): AvailabilityStatus {
  if (stock === 0) return 'unavailable';
  if (stock < minStock) return 'low_stock';
  return 'available';
}

const f = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

export default function AdminInventoryPage() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState<AvailabilityStatus | 'all'>('all');
  const [viewItem, setViewItem] = useState<InventoryItem | null>(null);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [editForm, setEditForm] = useState({ stock: 0, minStock: 0, unitPrice: 0 });
  const [saved, setSaved] = useState<number | null>(null);

  const filtered = inventory.filter(i => {
    const ms = search.toLowerCase();
    const matchSearch = i.name.toLowerCase().includes(ms) || i.category.toLowerCase().includes(ms);
    const matchCat = filterCat === 'Todos' || i.category === filterCat;
    const matchStatus = filterStatus === 'all' || i.status === filterStatus;
    return matchSearch && matchCat && matchStatus;
  });

  const openEdit = (item: InventoryItem) => {
    setEditItem(item);
    setEditForm({ stock: item.stock, minStock: item.minStock, unitPrice: item.unitPrice });
  };

  // RF 4.2 – Actualizar disponibilidad
  const handleSave = () => {
    if (!editItem) return;
    const newStatus = deriveStatus(editForm.stock, editForm.minStock);
    setInventory(prev => prev.map(i =>
      i.id === editItem.id
        ? { ...i, stock: editForm.stock, minStock: editForm.minStock, unitPrice: editForm.unitPrice, status: newStatus, lastUpdated: new Date().toISOString().slice(0, 10) }
        : i
    ));
    setSaved(editItem.id);
    setTimeout(() => setSaved(null), 2000);
    setEditItem(null);
  };

  const stats = {
    total:       inventory.length,
    available:   inventory.filter(i => i.status === 'available').length,
    low:         inventory.filter(i => i.status === 'low_stock').length,
    unavailable: inventory.filter(i => i.status === 'unavailable').length,
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar isAuthenticated userName={user?.name || 'Admin'} hideNavLinks />
      <Sidebar />
      <main className="ml-64 pt-16 p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Inventario de Repuestos</h1>
              <p className="text-gray-400 text-sm mt-1">RF 4.3 Consultar inventario · RF 4.2 Actualizar disponibilidad</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Total productos', value: stats.total,       color: 'text-white'        },
              { label: 'Disponibles',     value: stats.available,   color: 'text-green-400'    },
              { label: 'Stock bajo',      value: stats.low,         color: 'text-yellow-400'   },
              { label: 'Sin stock',       value: stats.unavailable, color: 'text-red-400'      },
            ].map(s => (
              <div key={s.label} className="card p-4">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-gray-500 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filtros */}
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar producto o categoría..."
                className="input-field pl-9 w-full text-sm" />
            </div>
            <div className="relative">
              <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
                className="input-field pr-8 text-sm appearance-none bg-dark-800">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
            <div className="relative">
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}
                className="input-field pr-8 text-sm appearance-none bg-dark-800">
                <option value="all">Todos los estados</option>
                <option value="available">Disponible</option>
                <option value="low_stock">Stock bajo</option>
                <option value="unavailable">Sin stock</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Tabla — RF 4.3 Consultar */}
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-anthracite-800 text-gray-400 text-xs uppercase">
                  <th className="px-4 py-3 text-left">Producto</th>
                  <th className="px-4 py-3 text-left">Categoría</th>
                  <th className="px-4 py-3 text-right">Stock</th>
                  <th className="px-4 py-3 text-right">Mín.</th>
                  <th className="px-4 py-3 text-right">Precio unit.</th>
                  <th className="px-4 py-3 text-center">Disponibilidad</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Sin resultados</td></tr>
                )}
                {filtered.map(item => {
                  const cfg = STATUS_CFG[item.status];
                  const Icon = cfg.icon;
                  return (
                    <tr key={item.id} className="border-b border-anthracite-800/50 hover:bg-dark-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <div>
                            <p className="text-white font-medium">{item.name}</p>
                            <p className="text-gray-500 text-xs">Actualizado: {item.lastUpdated}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{item.category}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-bold ${item.stock === 0 ? 'text-red-400' : item.stock < item.minStock ? 'text-yellow-400' : 'text-white'}`}>
                          {item.stock} {item.unit}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-500 text-xs">{item.minStock}</td>
                      <td className="px-4 py-3 text-right text-gold-400 font-semibold">{f(item.unitPrice)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
                          <Icon className="w-3 h-3" /> {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => setViewItem(item)}
                            className="p-1.5 hover:bg-dark-700 rounded-lg text-gray-400 hover:text-white transition-colors" title="Ver detalle">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => openEdit(item)}
                            className="p-1.5 hover:bg-dark-700 rounded-lg text-gray-400 hover:text-gold-400 transition-colors" title="Actualizar disponibilidad">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </motion.div>
      </main>

      {/* ── MODAL VER DETALLE ── */}
      <AnimatePresence>
        {viewItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setViewItem(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()} className="card p-6 max-w-md w-full mx-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Detalle del Producto</h3>
                <button onClick={() => setViewItem(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex items-center gap-3 p-4 bg-dark-800/60 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 text-gold-400" />
                </div>
                <div>
                  <p className="text-white font-bold">{viewItem.name}</p>
                  <p className="text-gray-400 text-sm">{viewItem.category}</p>
                </div>
              </div>
              <div className="divide-y divide-anthracite-800 text-sm">
                {([
                  ['Stock actual',     `${viewItem.stock} ${viewItem.unit}`],
                  ['Stock mínimo',     `${viewItem.minStock} ${viewItem.unit}`],
                  ['Precio unitario',  f(viewItem.unitPrice)],
                  ['Disponibilidad',   STATUS_CFG[viewItem.status].label],
                  ['Última actualiz.', viewItem.lastUpdated],
                ] as [string, string][]).map(([label, value]) => (
                  <div key={label} className="flex justify-between py-2.5">
                    <span className="text-gray-400">{label}</span>
                    <span className="text-white font-medium">{value}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setViewItem(null)} className="w-full btn-primary">Cerrar</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL EDITAR DISPONIBILIDAD (RF 4.2) ── */}
      <AnimatePresence>
        {editItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setEditItem(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()} className="card p-6 max-w-md w-full mx-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Actualizar Disponibilidad</h3>
                <button onClick={() => setEditItem(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-gray-400 text-sm">{editItem.name}</p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Stock actual ({editItem.unit})</label>
                  <input type="number" min={0} value={editForm.stock}
                    onChange={e => setEditForm(f => ({ ...f, stock: Math.max(0, +e.target.value) }))}
                    className="input-field w-full" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Stock mínimo ({editItem.unit})</label>
                  <input type="number" min={0} value={editForm.minStock}
                    onChange={e => setEditForm(f => ({ ...f, minStock: Math.max(0, +e.target.value) }))}
                    className="input-field w-full" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Precio unitario (COP)</label>
                  <input type="number" min={0} value={editForm.unitPrice}
                    onChange={e => setEditForm(f => ({ ...f, unitPrice: Math.max(0, +e.target.value) }))}
                    className="input-field w-full" />
                </div>
                {/* Preview del nuevo estado */}
                <div className="p-3 bg-dark-800/60 rounded-xl flex items-center justify-between text-sm">
                  <span className="text-gray-400">Nueva disponibilidad</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${STATUS_CFG[deriveStatus(editForm.stock, editForm.minStock)].color}`}>
                    {STATUS_CFG[deriveStatus(editForm.stock, editForm.minStock)].label}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setEditItem(null)}
                  className="flex-1 py-2.5 bg-dark-700 hover:bg-dark-600 text-white rounded-xl transition-colors text-sm">
                  Cancelar
                </button>
                <button onClick={handleSave}
                  className="flex-1 py-2.5 btn-primary text-sm flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> Guardar cambios
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast de guardado */}
      <AnimatePresence>
        {saved !== null && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl shadow-xl">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-semibold">Disponibilidad actualizada</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
