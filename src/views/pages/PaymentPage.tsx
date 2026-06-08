import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Building2, DollarSign, Check, ArrowLeft, X, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../../controllers/AuthContext';
import { useNavigate } from 'react-router-dom';

type PaymentMethod = 'card' | 'pse' | 'cash' | null;
type PaymentStep = 'select' | 'form' | 'pse-timing' | 'pse-arrival' | 'success';
type PSETiming = 'now' | 'on-arrival' | null;

// Bancos colombianos disponibles en PSE incluyendo Nequi, Daviplata, etc.
const COLOMBIAN_BANKS = [
  'Banco de Bogotá',
  'Bancolombia',
  'Banco Davivienda',
  'BBVA Colombia',
  'Banco de Occidente',
  'Banco Popular',
  'Banco Caja Social',
  'Banco AV Villas',
  'Banco Agrario',
  'Banco Colpatria',
  'Banco Falabella',
  'Banco GNB Sudameris',
  'Banco Pichincha',
  'Banco Santander',
  'Nequi',
  'Daviplata',
  'Bancamía',
  'Banco Cooperativo Coopcentral',
  'Banco Finandina',
  'Banco Mundo Mujer',
];

const DOC_TYPES = ['CC', 'CE', 'NIT', 'TI', 'PP'];

export default function PaymentPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<PaymentStep>('select');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [pseTiming, setPSETiming] = useState<PSETiming>(null);

  // Datos del formulario
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const [pseBank, setPseBank] = useState('');
  const [pseDocType, setPseDocType] = useState('CC');
  const [pseDocNumber, setPseDocNumber] = useState('');
  const [pseName, setPseName] = useState('');
  const [pseEmail, setPseEmail] = useState('');

  const handleSelectMethod = (method: PaymentMethod) => {
    setPaymentMethod(method);
    if (method === 'cash') {
      // Efectivo muestra directamente la opción de confirmar pago al llegar
      setStep('success');
    } else {
      setStep('form');
    }
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cardNumber.length < 15 || !cardHolder || !expiry || !cvv) {
      return;
    }
    setStep('success');
  };

  const handlePSESubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pseBank || !pseDocNumber || !pseName || !pseEmail) {
      return;
    }
    // Pregunta cuándo quiere pagar
    setStep('pse-timing');
  };

  const handlePSETiming = (timing: PSETiming) => {
    setPSETiming(timing);
    if (timing === 'now') {
      // Pago ahora → confirmación
      setStep('success');
    } else {
      // Pago al llegar → guardar datos y confirmación
      setStep('pse-arrival');
    }
  };

  const handlePSEArrivalSave = () => {
    setStep('success');
  };

  const handleBackToService = () => {
    navigate('/service-in-progress');
  };

  const getSuccessMessage = () => {
    if (paymentMethod === 'card') {
      return {
        icon: <Check className="w-16 h-16 text-green-400" />,
        title: '¡Tarjeta guardada!',
        subtitle: 'El mecánico cobrará automáticamente al finalizar.',
        showBackButton: true,
      };
    } else if (paymentMethod === 'pse') {
      if (pseTiming === 'now') {
        return {
          icon: <Check className="w-16 h-16 text-green-400" />,
          title: '¡Pago PSE realizado!',
          subtitle: 'El mecánico fue notificado del pago.',
          showBackButton: true,
        };
      } else {
        return {
          icon: <Check className="w-16 h-16 text-green-400" />,
          title: 'Datos PSE guardados',
          subtitle: 'El mecánico sabe que pagarás por PSE al llegar.',
          showBackButton: true,
        };
      }
    } else {
      // Efectivo
      return {
        icon: <DollarSign className="w-16 h-16 text-green-400" />,
        title: '¡Confirmado!',
        subtitle: 'El mecánico sabe que pagarás en efectivo al llegar.',
        showBackButton: true,
      };
    }
  };

  const successData = getSuccessMessage();

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar isAuthenticated userName={user?.name || 'Usuario'} hideNavLinks />
      <Sidebar hidden />

      <main className="ml-0 pt-16 p-8">
        <AnimatePresence mode="wait">
          {/* PASO 1: Selección de método de pago */}
          {step === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto space-y-6"
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Forma de pago</h1>
                <p className="text-gray-400">Elige cómo quieres pagar este servicio</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Tarjeta */}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSelectMethod('card')}
                  className="card p-6 text-center space-y-4 hover:ring-2 hover:ring-gold-500 transition-all group"
                >
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-gold-500 to-gold-600 rounded-full flex items-center justify-center group-hover:shadow-glow-gold transition-shadow">
                    <CreditCard className="w-8 h-8 text-anthracite-950" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Tarjeta de crédito / débito</h3>
                  <p className="text-sm text-gray-400">Se guarda y el mecánico cobra al finalizar</p>
                </motion.button>

                {/* PSE */}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSelectMethod('pse')}
                  className="card p-6 text-center space-y-4 hover:ring-2 hover:ring-purple-500 transition-all group"
                >
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">PSE — Transferencia bancaria</h3>
                  <p className="text-sm text-gray-400">Paga ahora o cuando llegue el mecánico</p>
                </motion.button>

                {/* Efectivo */}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSelectMethod('cash')}
                  className="card p-6 text-center space-y-4 hover:ring-2 hover:ring-green-500 transition-all group"
                >
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                    <DollarSign className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Efectivo</h3>
                  <p className="text-sm text-gray-400">Paga directamente al mecánico al llegar</p>
                </motion.button>
              </div>

              <button
                onClick={() => navigate('/service-in-progress')}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mx-auto"
              >
                <ArrowLeft className="w-4 h-4" /> Volver
              </button>
            </motion.div>
          )}

          {/* PASO 2: Formulario de tarjeta */}
          {step === 'form' && paymentMethod === 'card' && (
            <motion.div
              key="card-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <button
                onClick={() => setStep('select')}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4" /> Volver
              </button>

              <div className="card p-8 space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Detalles de tu tarjeta</h2>
                  <div className="flex items-start gap-2 p-3 bg-primary-500/10 border border-primary-500/30 rounded-xl mt-4">
                    <AlertCircle className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-primary-300 text-left">
                      Tu tarjeta se guarda de forma segura. El cobro se realiza solo cuando el mecánico finalice el servicio.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleCardSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Número de tarjeta</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                        setCardNumber(val.replace(/(\d{4})(?=\d)/g, '$1 '));
                      }}
                      placeholder="#### #### #### ####"
                      className="input-field font-mono tracking-wider"
                      required
                      maxLength={19}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Nombre del titular</label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                      placeholder="Como aparece en la tarjeta"
                      className="input-field"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">Vencimiento</label>
                      <input
                        type="text"
                        value={expiry}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                          if (val.length >= 2) {
                            setExpiry(`${val.slice(0, 2)}/${val.slice(2)}`);
                          } else {
                            setExpiry(val);
                          }
                        }}
                        placeholder="MM/AA"
                        className="input-field font-mono"
                        required
                        maxLength={5}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">CVV</label>
                      <input
                        type="text"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                        placeholder="•••"
                        className="input-field font-mono"
                        required
                        maxLength={3}
                      />
                    </div>
                  </div>

                  <button type="submit" className="w-full btn-primary flex items-center justify-center gap-2">
                    <Check className="w-5 h-5" /> Guardar tarjeta
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* PASO 2: Formulario PSE - Seleccionar cuándo pagar */}
          {step === 'form' && paymentMethod === 'pse' && (
            <motion.div
              key="pse-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <button
                onClick={() => setStep('select')}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4" /> Volver
              </button>

              <div className="card p-8 space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">¿Cuándo deseas realizar la transferencia PSE?</h2>
                  <p className="text-gray-400 text-sm">Elige el momento para pagar</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setPSETiming('now');
                      setStep('pse-timing');
                    }}
                    className="card p-6 text-center space-y-3 hover:ring-2 hover:ring-purple-500 transition-all"
                  >
                    <div className="w-12 h-12 mx-auto bg-purple-500 rounded-full flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Pagar ahora</h3>
                    <p className="text-sm text-gray-400">Transfiere inmediatamente por PSE</p>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setPSETiming('on-arrival');
                      setStep('pse-timing');
                    }}
                    className="card p-6 text-center space-y-3 hover:ring-2 hover:ring-gold-500 transition-all"
                  >
                    <div className="w-12 h-12 mx-auto bg-gold-500 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-anthracite-950" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Pagar cuando llegue el mecánico</h3>
                    <p className="text-sm text-gray-400">El mecánico esperará la transferencia al llegar</p>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* PASO 3: Formulario PSE - Datos bancarios (pagar ahora) */}
          {step === 'pse-timing' && pseTiming === 'now' && (
            <motion.div
              key="pse-now"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <button
                onClick={() => setStep('form')}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4" /> Volver
              </button>

              <div className="card p-8 space-y-6">
                <div className="flex items-center gap-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-purple-300 font-bold text-sm">💳 Pagarás ahora por PSE</p>
                    <p className="text-purple-200 text-xs">Transfiere inmediatamente por PSE</p>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-white text-center">Completa los datos PSE</h2>

                <form onSubmit={handlePSESubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Banco</label>
                    <select
                      value={pseBank}
                      onChange={(e) => setPseBank(e.target.value)}
                      className="input-field"
                      required
                    >
                      <option value="">Selecciona tu banco</option>
                      {COLOMBIAN_BANKS.map((bank) => (
                        <option key={bank} value={bank}>
                          {bank}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">Tipo doc.</label>
                      <select
                        value={pseDocType}
                        onChange={(e) => setPseDocType(e.target.value)}
                        className="input-field"
                      >
                        {DOC_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-2 space-y-2">
                      <label className="block text-sm font-medium text-gray-300">Número de documento</label>
                      <input
                        type="text"
                        value={pseDocNumber}
                        onChange={(e) => setPseDocNumber(e.target.value)}
                        placeholder="1234567890"
                        className="input-field"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Nombre completo</label>
                    <input
                      type="text"
                      value={pseName}
                      onChange={(e) => setPseName(e.target.value)}
                      placeholder="Nombre como aparece en la cuenta"
                      className="input-field"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Correo electrónico</label>
                    <input
                      type="email"
                      value={pseEmail}
                      onChange={(e) => setPseEmail(e.target.value)}
                      placeholder="tu@correo.com"
                      className="input-field"
                      required
                    />
                  </div>

                  <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                    <Building2 className="w-5 h-5" /> Confirmar transferencia PSE
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* PASO 3: Formulario PSE - Guardar datos (pagar al llegar) */}
          {step === 'pse-timing' && pseTiming === 'on-arrival' && (
            <motion.div
              key="pse-arrival-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <button
                onClick={() => setStep('form')}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4" /> Volver
              </button>

              <div className="card p-8 space-y-6">
                <div className="flex items-center gap-3 p-3 bg-gold-500/10 border border-gold-500/30 rounded-xl">
                  <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-anthracite-950" />
                  </div>
                  <div className="text-left">
                    <p className="text-gold-300 font-bold text-sm">⏱ Pagarás cuando llegue el mecánico por PSE</p>
                    <p className="text-gold-200 text-xs">El mecánico esperará tu transferencia al llegar</p>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-white text-center">Guarda tus datos PSE</h2>

                <form onSubmit={(e) => { e.preventDefault(); handlePSEArrivalSave(); }} className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Selecciona tu banco</label>
                    <select
                      value={pseBank}
                      onChange={(e) => setPseBank(e.target.value)}
                      className="input-field"
                      required
                    >
                      <option value="">Selecciona tu banco</option>
                      {COLOMBIAN_BANKS.map((bank) => (
                        <option key={bank} value={bank}>
                          {bank}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">Tipo doc.</label>
                      <select
                        value={pseDocType}
                        onChange={(e) => setPseDocType(e.target.value)}
                        className="input-field"
                      >
                        {DOC_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-2 space-y-2">
                      <label className="block text-sm font-medium text-gray-300">Número de documento</label>
                      <input
                        type="text"
                        value={pseDocNumber}
                        onChange={(e) => setPseDocNumber(e.target.value)}
                        placeholder="1234567890"
                        className="input-field"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Nombre completo</label>
                    <input
                      type="text"
                      value={pseName}
                      onChange={(e) => setPseName(e.target.value)}
                      placeholder="Nombre como aparece en la cuenta"
                      className="input-field"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Correo electrónico</label>
                    <input
                      type="email"
                      value={pseEmail}
                      onChange={(e) => setPseEmail(e.target.value)}
                      placeholder="tu@correo.com"
                      className="input-field"
                      required
                    />
                  </div>

                  <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                    <Building2 className="w-5 h-5" /> Guardar datos PSE
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* PASO FINAL: Confirmación */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-lg mx-auto"
            >
              <div className="card p-10 space-y-6 text-center">
                <div className="mx-auto w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center">
                  {successData.icon}
                </div>

                <div>
                  <h2 className="text-3xl font-bold text-white mb-3">{successData.title}</h2>
                  <p className="text-gray-400">{successData.subtitle}</p>
                </div>

                {successData.showBackButton && (
                  <button
                    onClick={handleBackToService}
                    className="w-full btn-primary"
                  >
                    Volver al servicio
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
