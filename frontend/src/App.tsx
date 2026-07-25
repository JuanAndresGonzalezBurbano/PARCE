import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { VehicleProvider } from './contexts/VehicleContext';
import { RequestProvider } from './contexts/RequestContext';
import { AdminProvider } from './contexts/AdminContext';
import { PQRProvider } from './contexts/PQRContext';
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import CustomerDashboard from './pages/CustomerDashboard';
import MechanicDashboard from './pages/MechanicDashboard';
import VehiclesPage from './pages/customer/VehiclesPage';
import RequestsPage from './pages/customer/RequestsPage';
import PQRPage from './pages/customer/PQRPage';
import AvailableRequestsPage from './pages/mechanic/AvailableRequestsPage';
import MyRequestsPage from './pages/mechanic/MyRequestsPage';
import RequestDetailsPage from './pages/mechanic/RequestDetailsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPQRPage from './pages/admin/AdminPQRPage';
import AdminSurveysPage from './pages/admin/AdminSurveysPage';
import AdminRatingsPage from './pages/admin/AdminRatingsPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './routes/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <VehicleProvider>
          <RequestProvider>
            <AdminProvider>
              <PQRProvider>
              <Routes>
                {/* Auth routes */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
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
                    path="/pqr"
                    element={
                      <ProtectedRoute requireRole="customer">
                        <PQRPage />
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
                  <Route
                    path="/mechanic/available"
                    element={
                      <ProtectedRoute requireRole="mechanic">
                        <AvailableRequestsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/mechanic/requests"
                    element={
                      <ProtectedRoute requireRole="mechanic">
                        <MyRequestsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/mechanic/requests/:id"
                    element={
                      <ProtectedRoute requireRole="mechanic">
                        <RequestDetailsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/dashboard"
                    element={
                      <ProtectedRoute requireRole={['administrator', 'super_admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/pqr"
                    element={
                      <ProtectedRoute requireRole={['administrator', 'super_admin']}>
                        <AdminPQRPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/surveys"
                    element={
                      <ProtectedRoute requireRole={['administrator', 'super_admin']}>
                        <AdminSurveysPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/ratings"
                    element={
                      <ProtectedRoute requireRole={['administrator', 'super_admin']}>
                        <AdminRatingsPage />
                      </ProtectedRoute>
                    }
                  />
                  {/* Profile route - accessible to all authenticated users */}
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
              </PQRProvider>
            </AdminProvider>
          </RequestProvider>
        </VehicleProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
