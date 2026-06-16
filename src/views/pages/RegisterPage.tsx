import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, User, Phone, Car, FileText, Upload, ChevronRight, ChevronLeft, Shield } from 'lucide-react';
import Logo from '../components/Logo';

// Pasos del registro
type Step = 'credentials' | 'role' | 'personal' | 'vehicle' | 'mechanic-cert';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('credentials');
  const [role, setRole] = useState<'user' | 'mechanic' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [certFileName, setCertFileName] = useState<string | null>(null);

  const [form, setForm] = useState({
    // Credenciales
    email: '',
    password: '',
    confirmPassword: '',
    // Info personal
    firstName: '',
    lastName: '',
    phone: '',
    idNumber: '',
    // Conductor — licencia, SOAT, tecnomecánica
    licenseCode: '',
    soatCode: '',
    technoCode: '',
    // Vehículo
    vehicleBrand: '',
    vehicleModel: '',
    vehiclePlate: '',
    vehicleYear: '',
    vehicleColor: '',
    // Mecánico — certificado
    certTitle: '',
  });

  const set = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    // Validación de contraseña
    if (form.password.length < 8) {
      alert('La contraseña debe tener mínimo 8 caracteres');
      return;
    }
    if (!/[A-Z]/.test(form.password) && !/[0-9]/.test(form.password)) {
      alert('La contraseña debe contener al menos una mayúscula o un número');
      return;
    }
    if (form.password !== form.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    setStep('role');
  };

  const handleRoleSelect = (r: 'user' | 'mechanic') => {
    setRole(r);
    setStep('personal');
  };

  const handlePersonal = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('vehicle');
  };

  const handleVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'mechanic') {
      setStep('mechanic-cert');
    } else {
      // Usuario termina aquí
      navigate('/login');
    }
  };

  const handleCert = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/login');
  };

  const stepLabels: Record<Step, string> = {
    credentials: 'Cuenta',
    role: 'Rol',
    personal: 'Datos Personales',
    vehicle: role === 'mechanic' ? 'Vehículo Propio' : 'Vehículo Averiado',
    'mechanic-cert': 'Certificación',
  };

  const stepOrder: Step[] = role === 'mechanic'
    ? ['credentials', 'role', 'personal', 'vehicle', 'mechanic-cert']
    : ['credentials', 'role', 'personal', 'vehicle'];

  const currentStepIndex = stepOrder.indexOf(step);

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center px-4 relative overflow-hidden py-10">
      {/* Fondo animado */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-anthracite-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-lg"
      >
        {/* Botón volver */}
        {step === 'credentials' ? (
          <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-5 h-5" /> Volver
          </Link>
        ) : (
          <button
            onClick={() => setStep(stepOrder[currentStepIndex - 1])}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" /> Atrás
          </button>
        )}

        <div className="card p-8 space-y-6">
          {/* Logo */}
          <div className="flex justify-center">
            <Logo size="md" />
          </div>

          {/* Indicador de pasos */}
          {step !== 'role' && (
            <div className="flex items-center justify-center gap-2">
              {stepOrder.filter(s => s !== 'role').map((s, i) => {
                const idx = stepOrder.filter(x => x !== 'role').indexOf(s);
                const activeIdx = stepOrder.filter(x => x !== 'role').indexOf(step);
                return (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      idx < activeIdx ? 'bg-gold-500 text-anthracite-950' :
                      idx === activeIdx ? 'bg-gold-500/30 border-2 border-gold-500 text-gold-400' :
                      'bg-dark-700 text-gray-500'
                    }`}>
                      {idx + 1}
                    </div>
                    {i < stepOrder.filter(x => x !== 'role').length - 1 && (
                      <div className={`w-8 h-0.5 ${idx < activeIdx ? 'bg-gold-500' : 'bg-dark-700'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-1">REGISTRO</h2>
            <p className="text-gray-400 text-sm">{stepLabels[step]}</p>
          </div>

          <AnimatePresence mode="wait">
            {/* PASO 1: Credenciales */}
            {step === 'credentials' && (
              <motion.form key="credentials" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                onSubmit={handleCredentials} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Correo electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                      placeholder="example@gmail.com" className="input-field pl-10" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)}
                      placeholder="••••••••••••" className="input-field pl-10 pr-10" required minLength={8} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className={`text-xs transition-colors ${
                    form.password.length === 0 ? 'text-gray-500' :
                    form.password.length >= 8 && /[A-Z]/.test(form.password) && /[0-9]/.test(form.password)
                      ? 'text-green-400' : 'text-red-400'
                  }`}>
                    Mínimo 8 caracteres, con al menos una mayúscula o un número
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Confirmar contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}
                      placeholder="••••••••••••" className="input-field pl-10 pr-10" required />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                      {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <button type="submit" className="w-full btn-primary flex items-center justify-center gap-2">
                  Siguiente <ChevronRight className="w-4 h-4" />
                </button>
                <div className="text-center text-sm text-gray-500">
                  ¿Ya tienes cuenta?{' '}
                  <Link to="/login" className="text-gold-400 hover:text-gold-300 transition-colors">Inicia sesión</Link>
                </div>
              </motion.form>
            )}

            {/* PASO 2: Selección de rol */}
            {step === 'role' && (
              <motion.div key="role" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-4">
                <p className="text-gray-400 text-center text-sm">¿Cómo vas a usar P.A.R.C.E?</p>
                <button onClick={() => handleRoleSelect('user')}
                  className="w-full card p-5 hover:ring-2 hover:ring-gold-500 transition-all text-left flex items-center gap-4 group">
                  <div className="w-12 h-12 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover:shadow-glow-gold">
                    <User className="w-6 h-6 text-anthracite-950" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Conductor / Usuario</h3>
                    <p className="text-gray-400 text-sm">Solicita servicios de asistencia vehicular en emergencias</p>
                  </div>
                </button>
                <button onClick={() => handleRoleSelect('mechanic')}
                  className="w-full card p-5 hover:ring-2 hover:ring-gold-500 transition-all text-left flex items-center gap-4 group">
                  <div className="w-12 h-12 bg-gradient-to-br from-anthracite-500 to-anthracite-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Mecánico</h3>
                    <p className="text-gray-400 text-sm">Ofrece servicios de reparación y asistencia a conductores</p>
                  </div>
                </button>
              </motion.div>
            )}

            {/* PASO 3: Información personal */}
            {step === 'personal' && (
              <motion.form key="personal" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                onSubmit={handlePersonal} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-300">Nombre</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input type="text" value={form.firstName} onChange={e => set('firstName', e.target.value)}
                        placeholder="Juan" className="input-field pl-9 text-sm" required />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-300">Apellido</label>
                    <input type="text" value={form.lastName} onChange={e => set('lastName', e.target.value)}
                      placeholder="García" className="input-field text-sm" required />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-300">Teléfono</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                      placeholder="+57 300 000 0000" className="input-field pl-9 text-sm" required />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-300">Número de cédula</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type="text" value={form.idNumber} onChange={e => set('idNumber', e.target.value)}
                      placeholder="1234567890" className="input-field pl-9 text-sm" required />
                  </div>
                </div>
                {/* Código de licencia solo para usuario */}
                {role === 'user' && (
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-300">Código de licencia de conducción</label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input type="text" value={form.licenseCode} onChange={e => set('licenseCode', e.target.value)}
                        placeholder="LIC-2024-XXXX" className="input-field pl-9 text-sm" required />
                    </div>
                  </div>
                )}
                <button type="submit" className="w-full btn-primary flex items-center justify-center gap-2">
                  Siguiente <ChevronRight className="w-4 h-4" />
                </button>
              </motion.form>
            )}

            {/* PASO 4: Información del vehículo */}
            {step === 'vehicle' && (
              <motion.form key="vehicle" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                onSubmit={handleVehicle} className="space-y-4">
                <p className="text-xs text-gray-500 bg-dark-800 rounded-lg p-3 border border-anthracite-700">
                  {role === 'mechanic'
                    ? '🔧 Información de tu vehículo de trabajo'
                    : '🚗 Información del vehículo que necesita asistencia'}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-300">Marca</label>
                    <input type="text" value={form.vehicleBrand} onChange={e => set('vehicleBrand', e.target.value)}
                      placeholder="Toyota" className="input-field text-sm" required />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-300">Modelo</label>
                    <input type="text" value={form.vehicleModel} onChange={e => set('vehicleModel', e.target.value)}
                      placeholder="Corolla" className="input-field text-sm" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-300">Placa</label>
                    <div className="relative">
                      <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input type="text" value={form.vehiclePlate} onChange={e => set('vehiclePlate', e.target.value.toUpperCase())}
                        placeholder="ABC-123" className="input-field pl-9 text-sm font-mono tracking-wider" required maxLength={7} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-300">Año</label>
                    <input type="number" value={form.vehicleYear} onChange={e => set('vehicleYear', e.target.value)}
                      placeholder="2020" className="input-field text-sm" required min="1990" max="2026" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-300">Color</label>
                  <input type="text" value={form.vehicleColor} onChange={e => set('vehicleColor', e.target.value)}
                    placeholder="Blanco" className="input-field text-sm" required />
                </div>
                {/* SOAT y Tecnomecánica solo para usuario */}
                {role === 'user' && (
                  <>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-300">
                        Código SOAT <span className="text-gray-500 text-xs">(para verificar vigencia)</span>
                      </label>
                      <input type="text" value={form.soatCode} onChange={e => set('soatCode', e.target.value)}
                        placeholder="SOAT-2024-XXXXXXXX" className="input-field text-sm" required />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-300">
                        Código Tecnomecánica <span className="text-gray-500 text-xs">(para verificar vigencia)</span>
                      </label>
                      <input type="text" value={form.technoCode} onChange={e => set('technoCode', e.target.value)}
                        placeholder="TM-2024-XXXXXXXX" className="input-field text-sm" required />
                    </div>
                  </>
                )}
                <button type="submit" className="w-full btn-primary flex items-center justify-center gap-2">
                  {role === 'mechanic' ? <><span>Siguiente</span><ChevronRight className="w-4 h-4" /></> : 'Crear cuenta'}
                </button>
              </motion.form>
            )}

            {/* PASO 5 (solo mecánico): Certificación / Diploma */}
            {step === 'mechanic-cert' && (
              <motion.form key="mechanic-cert" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                onSubmit={handleCert} className="space-y-4">
                <p className="text-xs text-gray-500 bg-dark-800 rounded-lg p-3 border border-anthracite-700">
                  📄 Sube tu diploma o certificado técnico / tecnológico de mecánica para validar tu perfil profesional.
                </p>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-300">Título del certificado</label>
                  <input type="text" value={form.certTitle} onChange={e => set('certTitle', e.target.value)}
                    placeholder="Ej: Técnico en Mecánica Automotriz" className="input-field text-sm" required />
                </div>
                {/* Upload de imagen del diploma */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-300">Foto del diploma / certificado</label>
                  <label className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                    certFileName ? 'border-gold-500 bg-gold-500/10' : 'border-anthracite-600 bg-dark-800 hover:border-gold-500/50 hover:bg-dark-700'
                  }`}>
                    <div className="text-center p-4">
                      {certFileName ? (
                        <>
                          <Upload className="w-8 h-8 text-gold-500 mx-auto mb-2" />
                          <p className="text-gold-400 text-sm font-medium">{certFileName}</p>
                          <p className="text-gray-500 text-xs mt-1">Click para cambiar</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                          <p className="text-gray-400 text-sm">Haz click o arrastra la imagen aquí</p>
                          <p className="text-gray-600 text-xs mt-1">JPG, PNG, PDF — máx. 5MB</p>
                        </>
                      )}
                    </div>
                    <input type="file" accept="image/*,.pdf" className="hidden"
                      onChange={e => setCertFileName(e.target.files?.[0]?.name || null)} required />
                  </label>
                </div>
                <button type="submit" className="w-full btn-primary">
                  Crear cuenta
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
