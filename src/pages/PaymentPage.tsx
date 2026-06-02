import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard, DollarSign, Building2, Check, ChevronRight,
  ChevronLeft, Loader2, Shield, AlertCircle, CheckCircle2
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

type PaymentMethod = 'card' | 'pse' | 'cash' | null;
type PSEOption = 'now' | 'on_arrival' | null;
type Step = 1 | 2 | 3;

const SERVICE_DATA = {
  mechanic: 'Carlos Rodríguez',
  description: 'Cambio de aceite y filtros',
  labor: 80000,
  materials: 45000,
  delivery: 15000,
  reference: 'PARCE-2024-00142',
};

const BANKS = [
  'Bancolombia', 'Banco de Bogotá', 'Davivienda', 'BBVA', 'Banco Popular',
  'Banco Caja Social', 'Colpatria', 'Occidente', 'AV Villas', 'Nequi',
];

const formatCOP = (val: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);

export default function PaymentPage() {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [pseOption, setPseOption] = useState<PSEOption>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Card form
  const [cardData, setCardData] = useState({ number: '', name: '', expiry: '', cvv: '', type: 'credit' as 'credit' | 'debit' });
  const [useSavedCard, setUseSavedCard] = useState(true);
  const savedCard = { number: '**** **** **** 4521', name: 'Juan Gustavo', type: 'Visa' };

  // PSE form
  const [pseData, setPseData] = useState({ bank: '', personType: 'natural', document: '' });

  const total = SERVICE_DATA.labor + SERVICE_DATA.materials + SERVICE_DATA.delivery;

  const formatCardNumber = (val: string) =>
    val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const formatExpiry = (val: string) =>
    val.replace(/\D/g, '').slice(0, 4).replace(/(.{2})/, '$1/');

  const handleProcess = () => {
    setIsProcessing(true);
    setTimeout(() => { setIsProcessing(false); setIsConfirmed(true); setStep(3); }, 2500);
  };

  const getStatusBadge = () => {
    if (paymentMethod === 'card') return { text: 'Pendiente de cobro', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' };
    if (paymentMethod === 'pse' && pseOption === 'now') return { text: 'PSE Pagado', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' };
    if (paymentMethod === 'pse' && pseOption === 'on_arrival') return { text: 'PSE Pendiente', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' };
    return { text: 'Pendiente de pago', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' };
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar isAuthenticated userName={user?.name || 'Usuario'} />
      <Sidebar />

      <main className="ml-64 pt-16 p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">

          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-white">Formas de Pago</h1>
            <p className="text-gray-400 mt-1">Gestiona el pago de tu servicio mecánico</p>
          </div>

          {/* Steps */}
          <div className="flex items-center gap-2">
            {(['Resumen', 'Pago', 'Confirmación'] as const).map((label, i) => {
              const s = i + 1;
              return (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s ? 'bg-gold-500 text-anthracite-950' : 'bg-anthracite-800 text-gray-500'}`}>
                    {step > s ? <Check className="w-4 h-4" /> : s}
                  </div>
                  <span className={`text-sm ${step >= s ? 'text-white' : 'text-gray-500'}`}>{label}</span>
                  {s < 3 && <ChevronRight className="w-4 h-4 text-gray-600" />}
                </div>
              );
            })}
          </div>

          <AnimatePresence mode="wait">

            {/* ── PASO 1: Resumen ── */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="card p-6 space-y-4">
                  <h2 className="text-xl font-bold text-white">Resumen del Servicio</h2>
                  <div className="flex items-center gap-3 pb-4 border-b border-anthracite-800">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center">
                      <span className="text-anthracite-950 font-bold text-sm">CR</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold">{SERVICE_DATA.mechanic}</p>
                      <p className="text-gray-400 text-sm">Mecánico asignado</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-gray-300">{SERVICE_DATA.description}</p>
                    <div className="space-y-2 text-sm">
                      {[['Mano de obra', SERVICE_DATA.labor], ['Materiales', SERVICE_DATA.materials], ['Domicilio', SERVICE_DATA.delivery]].map(([l, v]) => (
                        <div key={l as string} className="flex justify-between text-gray-400">
                          <span>{l}</span><span>{formatCOP(v as number)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-white font-bold text-base pt-2 border-t border-anthracite-800">
                        <span>Total</span><span className="text-gold-400">{formatCOP(total)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card p-6 space-y-4">
                  <h2 className="text-xl font-bold text-white">Método de Pago</h2>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'card', icon: CreditCard, label: 'Tarjeta', grad: 'from-gold-500 to-gold-700', ic: 'text-anthracite-950' },
                      { id: 'pse', icon: Building2, label: 'PSE', grad: 'from-blue-500 to-blue-700', ic: 'text-white' },
                      { id: 'cash', icon: DollarSign, label: 'Efectivo', grad: 'from-green-500 to-green-700', ic: 'text-white' },
                    ].map(({ id, icon: Icon, label, grad, ic }) => (
                      <motion.button key={id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={() => setPaymentMethod(id as PaymentMethod)}
                        className={`p-5 rounded-xl border-2 text-center space-y-3 transition-all ${paymentMethod === id ? 'border-gold-500 bg-gold-500/10' : 'border-anthracite-700 bg-anthracite-900/50 hover:border-anthracite-600'}`}>
                        <div className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-br ${grad} flex items-center justify-center`}>
                          <Icon className={`w-6 h-6 ${ic}`} />
                        </div>
                        <p className="text-white font-semibold text-sm">{label}</p>
                        {paymentMethod === id && <Check className="w-4 h-4 text-gold-400 mx-auto" />}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <button onClick={() => setStep(2)} disabled={!paymentMethod}
                  className="w-full btn-primary disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  Continuar <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* ── PASO 2: Formulario ── */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">

                {/* TARJETA */}
                {paymentMethod === 'card' && (
                  <div className="card p-6 space-y-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-gold-400" /> Pago con Tarjeta
                    </h2>
                    <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${useSavedCard ? 'border-gold-500 bg-gold-500/10' : 'border-anthracite-700'}`}
                      onClick={() => setUseSavedCard(true)}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-5 h-5 text-gold-400" />
                          <div>
                            <p className="text-white font-semibold">{savedCard.number}</p>
                            <p className="text-gray-400 text-sm">{savedCard.name} · {savedCard.type}</p>
                          </div>
                        </div>
                        {useSavedCard && <Check className="w-5 h-5 text-gold-400" />}
                      </div>
                    </div>
                    <button onClick={() => setUseSavedCard(false)}
                      className={`w-full p-3 rounded-xl border-2 text-sm transition-all ${!useSavedCard ? 'border-gold-500 bg-gold-500/10 text-gold-400' : 'border-anthracite-700 text-gray-400 hover:border-anthracite-600'}`}>
                      + Usar otra tarjeta
                    </button>
                    {!useSavedCard && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <div className="flex gap-3">
                          {['credit', 'debit'].map((t) => (
                            <button key={t} onClick={() => setCardData({ ...cardData, type: t as 'credit' | 'debit' })}
                              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${cardData.type === t ? 'bg-gold-500 text-anthracite-950' : 'bg-anthracite-800 text-gray-400'}`}>
                              {t === 'credit' ? 'Crédito' : 'Débito'}
                            </button>
                          ))}
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-gray-400">Número de tarjeta</label>
                          <input className="input-field" placeholder="1234 5678 9012 3456"
                            value={cardData.number} onChange={(e) => setCardData({ ...cardData, number: formatCardNumber(e.target.value) })} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-gray-400">Nombre del titular</label>
                          <input className="input-field" placeholder="Como aparece en la tarjeta"
                            value={cardData.name} onChange={(e) => setCardData({ ...cardData, name: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm text-gray-400">Vencimiento</label>
                            <input className="input-field" placeholder="MM/AA"
                              value={cardData.expiry} onChange={(e) => setCardData({ ...cardData, expiry: formatExpiry(e.target.value) })} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm text-gray-400">CVV</label>
                            <input className="input-field" placeholder="***" maxLength={4}
                              value={cardData.cvv} onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '') })} />
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <Shield className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <p className="text-blue-300 text-sm">Tu tarjeta se guarda de forma segura. El cobro lo realiza el mecánico al finalizar el servicio.</p>
                    </div>
                  </div>
                )}

                {/* PSE */}
                {paymentMethod === 'pse' && (
                  <div className="card p-6 space-y-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-blue-400" /> Pago PSE
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { id: 'now', label: 'Pagar ahora', desc: 'Transferencia inmediata', icon: CheckCircle2, color: 'text-green-400' },
                        { id: 'on_arrival', label: 'Pagar al llegar', desc: 'Cuando llegue el mecánico', icon: AlertCircle, color: 'text-amber-400' },
                      ].map(({ id, label, desc, icon: Icon, color }) => (
                        <motion.button key={id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={() => setPseOption(id as PSEOption)}
                          className={`p-4 rounded-xl border-2 text-left space-y-2 transition-all ${pseOption === id ? 'border-gold-500 bg-gold-500/10' : 'border-anthracite-700 hover:border-anthracite-600'}`}>
                          <Icon className={`w-5 h-5 ${color}`} />
                          <p className="text-white font-semibold text-sm">{label}</p>
                          <p className="text-gray-400 text-xs">{desc}</p>
                        </motion.button>
                      ))}
                    </div>
                    {pseOption === 'now' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm text-gray-400">Banco</label>
                          <select className="input-field" value={pseData.bank} onChange={(e) => setPseData({ ...pseData, bank: e.target.value })}>
                            <option value="">Selecciona tu banco</option>
                            {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-gray-400">Tipo de persona</label>
                          <div className="flex gap-3">
                            {['natural', 'juridica'].map((t) => (
                              <button key={t} onClick={() => setPseData({ ...pseData, personType: t })}
                                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${pseData.personType === t ? 'bg-gold-500 text-anthracite-950' : 'bg-anthracite-800 text-gray-400'}`}>
                                {t === 'natural' ? 'Natural' : 'Jurídica'}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-gray-400">Número de documento</label>
                          <input className="input-field" placeholder="Cédula o NIT"
                            value={pseData.document} onChange={(e) => setPseData({ ...pseData, document: e.target.value })} />
                        </div>
                      </motion.div>
                    )}
                    {pseOption === 'on_arrival' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-amber-400" />
                          <p className="text-amber-300 font-semibold">Instrucciones</p>
                        </div>
                        <p className="text-gray-300 text-sm">Cuando el mecánico llegue, realiza la transferencia PSE desde tu app bancaria por:</p>
                        <p className="text-2xl font-bold text-gold-400">{formatCOP(total)}</p>
                        <p className="text-gray-400 text-xs">Referencia: {SERVICE_DATA.reference}</p>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* EFECTIVO */}
                {paymentMethod === 'cash' && (
                  <div className="card p-6 space-y-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-400" /> Pago en Efectivo
                    </h2>
                    <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-xl text-center space-y-3">
                      <DollarSign className="w-12 h-12 text-green-400 mx-auto" />
                      <p className="text-gray-300">Ten listo el siguiente monto en efectivo:</p>
                      <p className="text-4xl font-bold text-green-400">{formatCOP(total)}</p>
                      <p className="text-gray-400 text-sm">Entrega el dinero directamente al mecánico al finalizar el servicio.</p>
                    </div>
                    <div className="space-y-2 text-sm">
                      {[['Mano de obra', SERVICE_DATA.labor], ['Materiales', SERVICE_DATA.materials], ['Domicilio', SERVICE_DATA.delivery]].map(([l, v]) => (
                        <div key={l as string} className="flex justify-between text-gray-400">
                          <span>{l}</span><span>{formatCOP(v as number)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-white font-bold pt-2 border-t border-anthracite-800">
                        <span>Total a preparar</span><span className="text-green-400">{formatCOP(total)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-secondary flex items-center gap-2">
                    <ChevronLeft className="w-4 h-4" /> Volver
                  </button>
                  <button onClick={handleProcess}
                    disabled={isProcessing || (paymentMethod === 'pse' && !pseOption) || (paymentMethod === 'pse' && pseOption === 'now' && (!pseData.bank || !pseData.document))}
                    className="flex-1 btn-primary disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {isProcessing
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</>
                      : <>{paymentMethod === 'card' ? 'Guardar tarjeta' : paymentMethod === 'cash' ? 'Confirmar' : 'Continuar'} <ChevronRight className="w-4 h-4" /></>}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── PASO 3: Confirmación ── */}
            {step === 3 && isConfirmed && (
              <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                <div className="card p-8 text-center space-y-4">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
                    className="w-20 h-20 mx-auto bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-10 h-10 text-white" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-white">
                    {paymentMethod === 'card' ? '¡Tarjeta guardada!' : paymentMethod === 'pse' && pseOption === 'now' ? '¡Pago procesado!' : '¡Confirmado!'}
                  </h2>
                  <p className="text-gray-400">
                    {paymentMethod === 'card' && 'Tu tarjeta ha sido guardada. El cobro lo realizará el mecánico al finalizar el servicio.'}
                    {paymentMethod === 'pse' && pseOption === 'now' && 'Tu pago PSE fue procesado exitosamente.'}
                    {paymentMethod === 'pse' && pseOption === 'on_arrival' && 'Recuerda realizar la transferencia PSE cuando llegue el mecánico.'}
                    {paymentMethod === 'cash' && 'Ten listo el efectivo para cuando el mecánico finalice el servicio.'}
                  </p>
                </div>

                <div className="card p-6 space-y-4">
                  <h3 className="text-lg font-bold text-white">Recibo</h3>
                  <div className="space-y-3 text-sm">
                    {[
                      ['Referencia', SERVICE_DATA.reference],
                      ['Mecánico', SERVICE_DATA.mechanic],
                      ['Servicio', SERVICE_DATA.description],
                    ].map(([l, v]) => (
                      <div key={l} className="flex justify-between">
                        <span className="text-gray-400">{l}</span>
                        <span className="text-white font-mono">{v}</span>
                      </div>
                    ))}
                    <div className="flex justify-between">
                      <span className="text-gray-400">Monto</span>
                      <span className="text-gold-400 font-bold">{formatCOP(total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Método</span>
                      <span className="text-white">
                        {paymentMethod === 'card' ? 'Tarjeta bancaria' : paymentMethod === 'pse' ? `PSE (${pseOption === 'now' ? 'Pagado' : 'Al llegar'})` : 'Efectivo'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-anthracite-800">
                      <span className="text-gray-400">Estado</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge().bg} ${getStatusBadge().color}`}>
                        {getStatusBadge().text}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}
