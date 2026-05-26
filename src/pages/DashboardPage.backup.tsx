import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, Wrench, Star, Menu } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function DashboardPage() {
  // Mock data for charts
  const monthlyData = [
    { month: 'ENE', services: 80 },
    { month: 'FEB', services: 95 },
    { month: 'MAR', services: 110 },
    { month: 'ABR', services: 90 },
    { month: 'MAY', services: 105 },
    { month: 'JUN', services: 120 },
    { month: 'JUL', services: 135 },
    { month: 'AGO', services: 115 },
    { month: 'SEP', services: 125 },
    { month: 'OCT', services: 140 },
    { month: 'NOV', services: 130 },
    { month: 'DIC', services: 125 },
  ];

  const comparisonData = [
    { year: '2023', value: 200 },
    { year: '2024', value: 250 },
    { year: '2025', value: 300 },
  ];

  const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar isAuthenticated userName="Juan Gustavo" />
      <Sidebar />

      <main className="ml-64 pt-16 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
              <p className="text-gray-400">Bienvenido de vuelta, Juan Gustavo</p>
            </div>
            <button className="p-3 bg-dark-800 rounded-lg hover:bg-dark-700 transition-colors">
              <Menu className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Monthly Services */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-400 text-sm font-medium">Servicios Último Mes</h3>
                <Calendar className="w-5 h-5 text-primary-500" />
              </div>
              <div className="space-y-2">
                <p className="text-4xl font-bold text-white">125</p>
                <p className="text-sm text-gray-500">SERVICIOS ULTIMO MES</p>
              </div>
            </div>

            {/* User Recommendation */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-400 text-sm font-medium">Recomendación</h3>
                <Star className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="flex items-center justify-center h-24">
                <div className="relative">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-dark-800"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - 0.98)}`}
                      className="text-green-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">98%</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500 text-center mt-2">Recomendado por los usuarios</p>
            </div>

            {/* Active Mechanics */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-400 text-sm font-medium">Mecánicos Activos</h3>
                <Wrench className="w-5 h-5 text-purple-500" />
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Wrench className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-4xl font-bold text-white">423</p>
                  <p className="text-sm text-gray-500">ACTIVOS</p>
                </div>
              </div>
            </div>

            {/* Rating */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-400 text-sm font-medium">Calificación</h3>
                <Star className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="text-center">
                <p className="text-5xl font-bold text-white mb-2">4.8</p>
                <div className="flex justify-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < 4 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-500">CALIFICACIÓN PROMEDIO DE SERVICIO</p>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly History Chart */}
            <div className="card p-6">
              <h3 className="text-xl font-bold text-white mb-4">HISTORIAL MESES</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="services" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0ea5e9" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Calendar */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">ENERO</h3>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-dark-800 rounded-lg transition-colors">
                    <span className="text-gray-400">&lt;</span>
                  </button>
                  <button className="p-2 hover:bg-dark-800 rounded-lg transition-colors">
                    <span className="text-gray-400">&gt;</span>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day) => (
                  <div key={day} className="text-center text-gray-500 text-sm font-medium">
                    {day}
                  </div>
                ))}
                {calendarDays.map((day) => (
                  <div
                    key={day}
                    className="aspect-square flex items-center justify-center text-sm text-gray-400 hover:bg-dark-800 rounded-lg cursor-pointer transition-colors"
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Comparison Chart */}
          <div className="card p-6">
            <h3 className="text-xl font-bold text-white mb-4">COMPARACIONES</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="year" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#0ea5e9"
                  strokeWidth={3}
                  dot={{ fill: '#0ea5e9', r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center">
              <p className="text-3xl font-bold text-white">2025</p>
              <p className="text-gray-400">Más servicios</p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
