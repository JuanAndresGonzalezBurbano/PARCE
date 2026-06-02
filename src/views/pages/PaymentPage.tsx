import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Smartphone, QrCode, DollarSign, Check } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function PaymentPage() {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer' | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handlePayment = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar isAuthenticated userName="Juan Gustavo" />
      <Sidebar />

      <main className="ml-64 pt-16 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto space-y-6"
        >
          {/* Success Modal */}
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-dark-950/80 backdrop-blur-sm"
            >
              <div className="card p-8 max-w-md text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Pago Realizado con Éxito</h3>
                <p className="text-gray-400">Tu pago ha sido procesado correctamente</p>
              </div>
            </motion.div>
          )}

          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Formas de Pago</h1>
            <p className="text-gray-400">Selecciona tu método de pago preferido</p>
          </div>

          {/* Payment Methods */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Cash */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPaymentMethod('cash')}
              className={`card p-6 text-center space-y-4 ${
                paymentMethod === 'cash' ? 'ring-2 ring-primary-500' : ''
              }`}
            >
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Efectivo</h3>
              <p className="text-sm text-gray-400">Paga en efectivo al mecánico</p>
            </motion.button>

            {/* Card */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPaymentMethod('card')}
              className={`card p-6 text-center space-y-4 ${
                paymentMethod === 'card' ? 'ring-2 ring-primary-500' : ''
              }`}
            >
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Tarjeta de Crédito</h3>
              <p className="text-sm text-gray-400">Paga con tarjeta de crédito o débito</p>
            </motion.button>

            {/* Transfer */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPaymentMethod('transfer')}
              className={`card p-6 text-center space-y-4 ${
                paymentMethod === 'transfer' ? 'ring-2 ring-primary-500' : ''
              }`}
            >
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Transferencia</h3>
              <p className="text-sm text-gray-400">Transferencia bancaria o QR</p>
            </motion.button>
          </div>

          {/* Payment Details */}
          {paymentMethod === 'cash' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-8 space-y-6"
            >
              <h3 className="text-2xl font-bold text-white text-center">Pago en Efectivo</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Entregado por</h4>
                  <div className="space-y-2">
                    <input type="text" placeholder="Nombre" className="input-field" />
                    <input type="text" placeholder="Apellido" className="input-field" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Email</label>
                    <input type="email" placeholder="example@gmail.com" className="input-field" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Cedula</label>
                    <input type="text" className="input-field" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">SubTotal</label>
                      <input type="text" placeholder="$$$" className="input-field" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">Total</label>
                      <input type="text" placeholder="$$$" className="input-field" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Recibo</h4>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Entregado por</label>
                    <input type="text" placeholder="Nombre" className="input-field" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Recibido por</label>
                    <input type="text" placeholder="Nombre" className="input-field" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Monto recibido</label>
                    <input type="text" placeholder="$$$" className="input-field" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Monto en palabras</label>
                    <input type="text" className="input-field" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Proposito del Pago</label>
                    <input type="text" className="input-field" />
                  </div>
                </div>
              </div>

              <button onClick={handlePayment} className="w-full btn-primary">
                Confirmar Pago
              </button>
            </motion.div>
          )}

          {paymentMethod === 'card' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-8 space-y-6"
            >
              <h3 className="text-2xl font-bold text-white text-center">Detalles de Pago</h3>
              
              {/* Card Display */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {['visa', 'mastercard', 'amex', 'discover'].map((card) => (
                  <div key={card} className="h-32 bg-gradient-to-br from-dark-800 to-dark-900 rounded-lg p-4 flex items-center justify-center border border-anthracite-800">
                    <CreditCard className="w-12 h-12 text-gray-600" />
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Numero de Tarjeta</label>
                  <input type="text" placeholder="#### #### #### ####" className="input-field" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Nombre del Titular</label>
                  <input type="text" className="input-field" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Vencimiento</label>
                    <input type="text" placeholder="MM/AA" className="input-field" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">CVV</label>
                    <input type="text" placeholder="***" className="input-field" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Codigo Postal</label>
                    <input type="text" placeholder="12345" className="input-field" />
                  </div>
                </div>
              </div>

              <button onClick={handlePayment} className="w-full btn-primary">
                Pagar
              </button>
            </motion.div>
          )}

          {paymentMethod === 'transfer' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-8 space-y-6 text-center"
            >
              <h3 className="text-2xl font-bold text-white">Escanea el QR para pagar</h3>
              
              <div className="w-64 h-64 mx-auto bg-white rounded-lg p-4 flex items-center justify-center">
                <QrCode className="w-full h-full text-dark-950" />
              </div>

              <p className="text-gray-400">
                Escanea este código QR con tu aplicación de banca móvil
              </p>

              <button onClick={handlePayment} className="btn-primary">
                Confirmar Pago
              </button>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
