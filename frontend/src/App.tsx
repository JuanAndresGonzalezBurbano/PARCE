import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { VehicleProvider } from './contexts/VehicleContext';
import { RequestProvider } from './contexts/RequestContext';
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CustomerDashboard from './pages/CustomerDashboard';
import MechanicDashboard from './pages/MechanicDashboard';
import VehiclesPage from './pages/customer/VehiclesPage';
import RequestsPage from './pages/customer/RequestsPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './routes/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <VehicleProvider>
          <RequestProvider>
            <Routes>
              {/* Auth routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>

              {/* Main app routes */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute requireRole="customer">
                      <CustomerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vehicles"
                  element={
                    <ProtectedRoute requireRole="customer">
                      <VehiclesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/requests"
                  element={
                    <ProtectedRoute requireRole="customer">
                      <RequestsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mechanic/dashboard"
                  element={
                    <ProtectedRoute requireRole="mechanic">
                      <MechanicDashboard />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </RequestProvider>
        </VehicleProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
