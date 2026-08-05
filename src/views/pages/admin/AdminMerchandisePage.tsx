import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Plus, Check, X, Calendar, ChevronDown, Truck, Hash, Trash2
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../../controllers/AuthContext';

// Catálogo de productos disponibles (mismo que AdminInventoryPage)
const PRODUCT_OPTIONS = [
  { id: 1,  name: 'Llanta 195/65 R15',         category: 'Neumáticos',  unit: 'unidad'  },
  { id: 2,  name: 'Filtro de aceite',           category: 'Filtros',     unit: 'unidad'  },
  { id: 3,  name: 'Aceite 5W-30 (1L)',          category: 'Lubricantes', unit: 'litro'   },
  { id: 4,  name: 'Batería 12V 60Ah',           category: 'Eléctrico',   unit: 'unidad'  },
  { id: 5,  name: 'Pastillas de freno delant.', category: 'Frenos',      unit: 'juego'   },
  { id: 6,  name: 'Gasolina corriente (galón)', category: 'Combustible', unit: 'galón'   },
  { id: 7,  name: 'Correa de distribución',     category: 'Motor',       unit: 'unidad'  },
  { id: 8,  name: 'Líquido de frenos DOT4',     category: 'Frenos',      unit: 'litro'   },
  { id: 9,  name: 'Bujías NGK (x4)',            category: 'Motor',       unit: 'juego'   },
  { id: 10, name: 'Filtro de aire',             category: 'Filtros',     unit: 'unidad'  },
  { id: 11, name: 'Líquido refrigerante (1L)',  category: 'Lubricantes', unit: 'litro'   },
  { id: 12, name: 'Amortiguador delantero',     category: 'Suspensión',  unit: 'unidad'  },
];

interface MerchandiseItem {
  productId: number;
  productName: string;
  category: string;
  unit: string;
  quantity: number;
}

interface MerchandiseEntry {
  id: string;
  date: string;           // fecha de llegada
  supplier: string;       // proveedor
  invoiceNumber: string;  // número de factura/remisión
  items: MerchandiseItem[];
  registeredBy: string;
  registeredAt: string;   // timestamp de registro
}

const INITIAL_ENTRIES: MerchandiseEntry[] = [
  {
    id: 'MRC-001',
    date: '2026-06-01',
    supplier: 'Distribuidora AutoParts Ltda',
    invoiceNumber: 'FAC-2026-0441',
    items: [
      { productId: 1, productName: 'Llanta 195/65 R15',  category: 'Neumáticos',  unit: 'unidad', quantity: 8  },
      { productId: 2, productName: 'Filtro de aceite',    category: 'Filtros',     unit: 'unidad', quantity: 10 },
      { productId: 3, productName: 'Aceite 5W-30 (1L)',   category: 'Lubricantes', unit: 'litro',  quantity: 20 },
    ],
    registeredBy: 'Admin PARCE',
    registeredAt: '2026-06-01T08:30:00',
  },
  {
    id: 'MRC-002',
    date: '2026-06-05',
    supplier: 'Eléctricos del Norte S.A.S',
    invoiceNumber: 'FAC-2026-0512',
    items: [
      { productId: 4, productName: 'Batería 12V 60Ah',   category: 'Eléctrico',  unit: 'unidad', quantity: 5 },
      { productId: 8, productName: 'Líquido de frenos DOT4', category: 'Frenos', unit: 'litro',  quantity: 6 },
    ],
    registeredBy: 'Admin PARCE',
    registeredAt: '2026-06-05T10:15:00',
  },
];

const todayISO = () => new Date().toISOString().slice(0, 10);
const nowISO   = () => new Date().toISOString();
const genId    = () => 'MRC-' + Math.random().toString(36).substring(2, 6).toUpperCase();

export default function AdminMerchandisePage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<MerchandiseEntry[]>(INITIAL_ENTRIES);
  const [showForm, setShowForm] = useState(false);
  const [viewEntry, setViewEntry] = useState<MerchandiseEntry | null>(null);
  const [saved, setSaved] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Formulario nuevo ingreso
  const [date, setDate]             = useState(todayISO());
  const [supplier, setSupplier]     = useState('');
  const [invoice, setInvoice]       = useState('');
  const [items, setItems]           = useState<MerchandiseItem[]>([
    { productId: 0, productName: '', category: '', unit: '', quantity: 1 },
  ]);

  const addItem = () =>
    setItems(prev => [...prev, { productId: 0, productName: '', category: '', unit: '', quantity: 1 }]);

  const removeItem = (i: number) =>
    setItems(prev => prev.filter((_, idx) => idx !== i));

  const selectProduct = (index: number, productId: number) => {
    const product = PRODUCT_OPTIONS.find(p => p.id === productId);
    if (!product) return;
    setItems(prev => prev.map((item, i) =>
      i === index
        ? { ...item, productId: product.id, productName: product.name, category: product.category, unit: product.unit }
        : item
    ));
  };

  const updateQty = (index: number, qty: number) =>
    setItems(prev => prev.map((item, i) => i === index ? { ...item, quantity: Math.max(1, qty) } : item));

  const isFormValid = () =>
    date && supplier.trim() && invoice.trim() &&
    items.every(i => i.productId > 0 && i.quantity > 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;

    const entry: MerchandiseEntry = {
      id: genId(),
      date,
      supplier: supplier.trim(),
      invoiceNumber: invoice.trim(),
      items,
      registeredBy: user?.name || 'Admin',
      registeredAt: nowISO(),
    };

    setEntries(prev => [entry, ...prev]);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setShowForm(false);
      // Reset form
      setDate(todayISO());
      setSupplier('');
      setInvoice('');
      setItems([{ productId: 0, productName: '', category: '', unit: '', quantity: 1 }]);
    }, 1500);
  };

  const handleDelete = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
    setDeleteId(null);
  };

  const totalItemsInEntry = (entry: MerchandiseEntry) =>
    entry.items.reduce((a, i) => a + i.quantity, 0);

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar isAuthenticated userName={user?.name || 'Admin'} hideNavLinks />
      <Sidebar />
      <main className="ml-64 pt-16 p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Ingreso de Mercancía</h1>
              <p className="text-gray-400 text-sm mt-1">Registra cada llegada de productos al inventario</p>
            </div>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gold-500 hover:bg-gold-600 text-anthracite-950 font-semibold rounded-xl transition-colors">
              <Plus className="w-4 h-4" /> Nuevo ingreso
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="card p-4 flex items-center gap-3">
              <Truck className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">{entries.length}</p>
                <p className="text-gray-500 text-xs">Ingresos registrados</p>
              </div>
            </div>
            <div className="card p-4 flex items-center gap-3">
              <Package className="w-8 h-8 text-gold-400" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {entries.reduce((a, e) => a + e.items.length, 0)}
                </p>
                <p className="text-gray-500 text-xs">Líneas de producto</p>
              </div>
            </div>
            <div className="card p-4 flex items-center gap-3">
              <Hash className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {entries.reduce((a, e) => a + totalItemsInEntry(e), 0)}
                </p>
                <p className="text-gray-500 text-xs">Unidades totales ingresadas</p>
              </div>
            </div>
          </div>

          {/* Lista de ingresos */}
          <div className="space-y-3">
            {entries.length === 0 && (
              <div className="card p-10 text-center text-gray-500">
                <Truck className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>No hay ingresos registrados aún</p>
              </div>
            )}
            {entries.map(entry => (
              <motion.div key={entry.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    {/* Cabecera */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-white font-bold">{entry.supplier}</span>
                      <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full font-mono">{entry.id}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Llegó el <span className="text-white font-semibold ml-1">{entry.date}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Hash className="w-3.5 h-3.5" />
                        Factura: <span className="text-white font-semibold ml-1">{entry.invoiceNumber}</span>
                      </span>
                    </div>
                    {/* Productos resumidos */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {entry.items.map((item, i) => (
                        <span key={i} className="flex items-center gap-1 px-2 py-1 bg-dark-800/60 border border-anthracite-700 rounded-lg text-xs text-gray-300">
                          <Package className="w-3 h-3 text-gold-400" />
                          {item.productName} — <span className="text-gold-400 font-bold">{item.quantity} {item.unit}</span>
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Registrado por {entry.registeredBy} · {new Date(entry.registeredAt).toLocaleString('es-CO')}
                    </p>
                  </div>
                  {/* Acciones */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => setViewEntry(entry)}
                      className="px-3 py-1.5 bg-dark-800 hover:bg-dark-700 text-gray-300 hover:text-white rounded-lg text-xs font-semibold transition-colors">
                      Ver detalle
                    </button>
                    <button onClick={() => setDeleteId(entry.id)}
                      className="p-1.5 hover:bg-red-500/10 rounded-lg text-gray-500 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </motion.div>
      </main>

      {/* ── MODAL NUEVO INGRESO ── */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => !saved && setShowForm(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="card p-6 max-w-2xl w-full mx-4 space-y-5 max-h-[90vh] overflow-y-auto">

              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Registrar ingreso de mercancía</h3>
                {!saved && (
                  <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {saved ? (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-3 py-8 text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Check className="w-8 h-8 text-green-400" />
                  </div>
                  <p className="text-white font-bold text-lg">¡Ingreso registrado!</p>
                  <p className="text-gray-400 text-sm">El inventario ha sido actualizado.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* Fecha */}
                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Fecha de llegada
                    </label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)}
                      className="input-field w-full" required />
                  </div>

                  {/* Proveedor + Factura */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-400 mb-1.5 block flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5" /> Proveedor
                      </label>
                      <input type="text" value={supplier} onChange={e => setSupplier(e.target.value)}
                        placeholder="Ej: AutoParts Ltda" className="input-field w-full" required />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1.5 block flex items-center gap-1">
                        <Hash className="w-3.5 h-3.5" /> N° Factura / Remisión
                      </label>
                      <input type="text" value={invoice} onChange={e => setInvoice(e.target.value)}
                        placeholder="FAC-2026-0000" className="input-field w-full" required />
                    </div>
                  </div>

                  {/* Productos */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs text-gray-400 flex items-center gap-1">
                        <Package className="w-3.5 h-3.5" /> Productos recibidos
                      </label>
                      <button type="button" onClick={addItem}
                        className="flex items-center gap-1 text-xs text-gold-400 hover:text-gold-300 transition-colors">
                        <Plus className="w-3.5 h-3.5" /> Agregar producto
                      </button>
                    </div>

                    <div className="space-y-2">
                      {items.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 p-3 bg-dark-800/50 rounded-xl border border-anthracite-700">
                          {/* Selector de producto */}
                          <div className="relative flex-1">
                            <select
                              value={item.productId || ''}
                              onChange={e => selectProduct(i, Number(e.target.value))}
                              className="input-field w-full text-sm appearance-none bg-dark-800 pr-8"
                              required
                            >
                              <option value="">— Selecciona un producto —</option>
                              {PRODUCT_OPTIONS.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                          </div>

                          {/* Cantidad */}
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <input type="number" min={1} value={item.quantity}
                              onChange={e => updateQty(i, Number(e.target.value))}
                              className="input-field w-20 text-sm text-center" required />
                            <span className="text-gray-400 text-xs w-12 text-left">{item.unit || 'ud.'}</span>
                          </div>

                          {/* Eliminar línea */}
                          {items.length > 1 && (
                            <button type="button" onClick={() => removeItem(i)}
                              className="p-1 text-gray-500 hover:text-red-400 transition-colors flex-shrink-0">
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Resumen */}
                  {items.some(i => i.productId > 0) && (
                    <div className="p-3 bg-dark-800/50 rounded-xl border border-anthracite-700 text-sm flex justify-between">
                      <span className="text-gray-400">Total unidades a ingresar</span>
                      <span className="text-gold-400 font-bold">
                        {items.reduce((a, i) => a + (i.quantity || 0), 0)} unidades en {items.filter(i => i.productId > 0).length} líneas
                      </span>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowForm(false)}
                      className="flex-1 py-2.5 bg-dark-700 hover:bg-dark-600 text-white rounded-xl transition-colors text-sm">
                      Cancelar
                    </button>
                    <button type="submit" disabled={!isFormValid()}
                      className="flex-1 py-2.5 btn-primary text-sm disabled:opacity-40 flex items-center justify-center gap-2">
                      <Truck className="w-4 h-4" /> Registrar ingreso
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL VER DETALLE ── */}
      <AnimatePresence>
        {viewEntry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setViewEntry(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="card p-6 max-w-md w-full mx-4 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Detalle del ingreso</h3>
                <button onClick={() => setViewEntry(null)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="divide-y divide-anthracite-800 text-sm">
                {[
                  ['Código',     viewEntry.id],
                  ['Proveedor',  viewEntry.supplier],
                  ['Factura',    viewEntry.invoiceNumber],
                  ['Fecha llegada', viewEntry.date],
                  ['Registrado por', viewEntry.registeredBy],
                  ['Fecha registro', new Date(viewEntry.registeredAt).toLocaleString('es-CO')],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-2.5">
                    <span className="text-gray-400">{label}</span>
                    <span className="text-white font-medium text-right">{value}</span>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-xs text-gold-400 uppercase tracking-wider font-semibold mb-3">Productos recibidos</p>
                <div className="space-y-2">
                  {viewEntry.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-dark-800/50 rounded-xl border border-anthracite-700">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gold-400 flex-shrink-0" />
                        <div>
                          <p className="text-white text-sm font-semibold">{item.productName}</p>
                          <p className="text-gray-500 text-xs">{item.category}</p>
                        </div>
                      </div>
                      <span className="text-gold-400 font-bold">{item.quantity} {item.unit}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between pt-3 text-sm border-t border-anthracite-800 mt-3">
                  <span className="text-gray-400">Total ingresado</span>
                  <span className="text-white font-bold">
                    {viewEntry.items.reduce((a, i) => a + i.quantity, 0)} unidades
                  </span>
                </div>
              </div>

              <button onClick={() => setViewEntry(null)} className="w-full btn-primary">Cerrar</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL ELIMINAR ── */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setDeleteId(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="card p-6 max-w-sm w-full mx-4 text-center space-y-4">
              <div className="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="w-7 h-7 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">¿Eliminar ingreso?</h3>
                <p className="text-gray-400 text-sm mt-1">Esta acción no se puede deshacer.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)}
                  className="flex-1 py-2.5 bg-dark-700 hover:bg-dark-600 text-white rounded-xl transition-colors text-sm">
                  Cancelar
                </button>
                <button onClick={() => handleDelete(deleteId)}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors text-sm font-semibold">
                  Eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
