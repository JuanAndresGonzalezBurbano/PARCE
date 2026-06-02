import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// VISTAS - Páginas
import LandingPage from './views/pages/LandingPage';
import LoginPage from './views/pages/LoginPage';
import RegisterPage from './views/pages/RegisterPage';
import RoleSelectionPage from './views/pages/RoleSelectionPage';
import UserHomePage from './views/pages/UserHomePage';
import DashboardPage from './views/pages/DashboardPage';
import CRUDPage from './views/pages/CRUDPage';
import ServicesPage from './views/pages/ServicesPage';
import ServiceInProgressPage from './views/pages/ServiceInProgressPage';
import ProfilePage from './views/pages/ProfilePage';
import MechanicProfilePage from './views/pages/MechanicProfilePage';
import MechanicDashboardPage from './views/pages/MechanicDashboardPage';
import ContactPage from './views/pages/ContactPage';
import PaymentPage from './views/pages/PaymentPage';
import SatisfactionSurveyPage from './views/pages/SatisfactionSurveyPage';
import MechanicVehicleInfoPage from './views/pages/MechanicVehicleInfoPage';
import MechanicOrdersPage from './views/pages/MechanicOrdersPage';
import MechanicPaymentDashboard from './views/pages/MechanicPaymentDashboard';
import MechanicPaymentPage from './views/pages/MechanicPaymentPage';
// VISTAS - Componentes
import ProtectedRoute from './views/components/ProtectedRoute';

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
          path="/home"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserHomePage />
            </ProtectedRoute>
          }
        />
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
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <PaymentPage />
            </ProtectedRoute>
          }
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
        <Route
          path="/mechanic-payments"
          element={
            <ProtectedRoute allowedRoles={['mechanic']}>
              <MechanicPaymentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mechanic-payment-page"
          element={
            <ProtectedRoute allowedRoles={['mechanic']}>
              <MechanicPaymentPage />
            </ProtectedRoute>
          }
        />
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
