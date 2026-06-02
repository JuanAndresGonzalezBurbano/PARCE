import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RoleSelectionPage from './pages/RoleSelectionPage';
import DashboardPage from './pages/DashboardPage';
import CRUDPage from './pages/CRUDPage';
import ServicesPage from './pages/ServicesPage';
import ServiceInProgressPage from './pages/ServiceInProgressPage';
import ProfilePage from './pages/ProfilePage';
import MechanicProfilePage from './pages/MechanicProfilePage';
import MechanicDashboardPage from './pages/MechanicDashboardPage';
import MechanicPaymentDashboard from './pages/MechanicPaymentDashboard';
import ContactPage from './pages/ContactPage';
import PaymentPage from './pages/PaymentPage';
import SatisfactionSurveyPage from './pages/SatisfactionSurveyPage';
import MechanicVehicleInfoPage from './pages/MechanicVehicleInfoPage';
import MechanicOrdersPage from './pages/MechanicOrdersPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/role-selection" element={<RoleSelectionPage />} />

        {/* Admin Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crud"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <CRUDPage />
            </ProtectedRoute>
          }
        />

        {/* User Routes */}
        <Route
          path="/services"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <ServicesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/service-in-progress"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <ServiceInProgressPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment"
          element={<PaymentPage />}
        />
        <Route
          path="/survey"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <SatisfactionSurveyPage />
            </ProtectedRoute>
          }
        />

        {/* Mechanic Routes */}
        <Route
          path="/mechanic-dashboard"
          element={
            <ProtectedRoute allowedRoles={['mechanic']}>
              <MechanicDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/mechanic-payments" element={<MechanicPaymentDashboard />} />
        <Route
          path="/mechanic-profile"
          element={
            <ProtectedRoute allowedRoles={['mechanic']}>
              <MechanicProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mechanic-orders"
          element={
            <ProtectedRoute allowedRoles={['mechanic']}>
              <MechanicOrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mechanic-vehicle-info"
          element={
            <ProtectedRoute allowedRoles={['mechanic']}>
              <MechanicVehicleInfoPage />
            </ProtectedRoute>
          }
        />

        {/* Shared Routes (User & Mechanic) */}
        <Route
          path="/contact"
          element={
            <ProtectedRoute allowedRoles={['user', 'mechanic']}>
              <ContactPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
