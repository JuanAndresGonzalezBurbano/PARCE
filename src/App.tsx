import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// ── PÁGINAS PÚBLICAS ──
import LandingPage from './views/pages/LandingPage';
import LoginPage from './views/pages/LoginPage';
import RegisterPage from './views/pages/RegisterPage';
import ForgotPasswordPage from './views/pages/ForgotPasswordPage';
import RoleSelectionPage from './views/pages/RoleSelectionPage';

// ── PÁGINAS USUARIO ──
import UserHomePage from './views/pages/UserHomePage';
import ServicesPage from './views/pages/ServicesPage';
import ServiceLocationPage from './views/pages/ServiceLocationPage';
import ServiceInProgressPage from './views/pages/ServiceInProgressPage';
import ProfilePage from './views/pages/ProfilePage';
import SatisfactionSurveyPage from './views/pages/SatisfactionSurveyPage';
import PaymentPage from './views/pages/PaymentPage';
import PaymentReceiptPage from './views/pages/PaymentReceiptPage';
import PQRPage from './views/pages/PQRPage';

// ── PÁGINAS MECÁNICO ──
import MechanicHomePage from './views/pages/MechanicHomePage';
import MechanicDashboardPage from './views/pages/MechanicDashboardPage';
import MechanicProfilePage from './views/pages/MechanicProfilePage';
import MechanicOrdersPage from './views/pages/MechanicOrdersPage';
import MechanicPaymentDashboard from './views/pages/MechanicPaymentDashboard';
import MechanicVehicleInfoPage from './views/pages/MechanicVehicleInfoPage';
import MechanicPaymentPage from './views/pages/MechanicPaymentPage';

// ── PÁGINAS ADMIN ──
import DashboardPage from './views/pages/DashboardPage';
import CRUDPage from './views/pages/CRUDPage';
import AdminUsersPage from './views/pages/admin/AdminUsersPage';
import AdminMechanicsPage from './views/pages/admin/AdminMechanicsPage';
import AdminServicesPage from './views/pages/admin/AdminServicesPage';
import AdminPaymentsPage from './views/pages/admin/AdminPaymentsPage';
import AdminRatingsPage from './views/pages/admin/AdminRatingsPage';
import AdminPQRPage from './views/pages/admin/AdminPQRPage';
import AdminVehiclesPage from './views/pages/admin/AdminVehiclesPage';
import AdminInventoryPage from './views/pages/admin/AdminInventoryPage';
import AdminProviderRatingsPage from './views/pages/admin/AdminProviderRatingsPage';
import AdminMerchandisePage from './views/pages/admin/AdminMerchandisePage';
import PaymentCRUDPage from './crud/payments/PaymentCRUDPage';

// ── PÁGINAS COMPARTIDAS ──
import ContactPage from './views/pages/ContactPage';

// ── COMPONENTES ──
import ProtectedRoute from './views/components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* ── Rutas públicas ── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/role-selection" element={<RoleSelectionPage />} />

        {/* ── Rutas Admin ── */}
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><DashboardPage /></ProtectedRoute>} />
        <Route path="/crud" element={<ProtectedRoute allowedRoles={['admin']}><CRUDPage /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsersPage /></ProtectedRoute>} />
        <Route path="/admin/mechanics" element={<ProtectedRoute allowedRoles={['admin']}><AdminMechanicsPage /></ProtectedRoute>} />
        <Route path="/admin/services/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminServicesPage view="users" /></ProtectedRoute>} />
        <Route path="/admin/services/mechanics" element={<ProtectedRoute allowedRoles={['admin']}><AdminServicesPage view="mechanics" /></ProtectedRoute>} />
        <Route path="/admin/vehicles" element={<ProtectedRoute allowedRoles={['admin']}><AdminVehiclesPage /></ProtectedRoute>} />
        <Route path="/admin/payments" element={<ProtectedRoute allowedRoles={['admin']}><AdminPaymentsPage /></ProtectedRoute>} />
        <Route path="/admin/payments/crud" element={<ProtectedRoute allowedRoles={['admin']}><PaymentCRUDPage /></ProtectedRoute>} />
        <Route path="/admin/ratings" element={<ProtectedRoute allowedRoles={['admin']}><AdminRatingsPage /></ProtectedRoute>} />
        <Route path="/admin/ratings/providers" element={<ProtectedRoute allowedRoles={['admin']}><AdminProviderRatingsPage /></ProtectedRoute>} />
        <Route path="/admin/inventory" element={<ProtectedRoute allowedRoles={['admin']}><AdminInventoryPage /></ProtectedRoute>} />
        <Route path="/admin/merchandise" element={<ProtectedRoute allowedRoles={['admin']}><AdminMerchandisePage /></ProtectedRoute>} />
        <Route path="/admin/pqr/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminPQRPage view="users" /></ProtectedRoute>} />
        <Route path="/admin/pqr/mechanics" element={<ProtectedRoute allowedRoles={['admin']}><AdminPQRPage view="mechanics" /></ProtectedRoute>} />

        {/* ── Rutas Usuario ── */}
        <Route path="/home" element={<ProtectedRoute allowedRoles={['user']}><UserHomePage /></ProtectedRoute>} />
        <Route path="/services" element={<ProtectedRoute allowedRoles={['user']}><ServicesPage /></ProtectedRoute>} />
        <Route path="/service-location" element={<ProtectedRoute allowedRoles={['user']}><ServiceLocationPage /></ProtectedRoute>} />
        <Route path="/service-in-progress" element={<ProtectedRoute allowedRoles={['user']}><ServiceInProgressPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute allowedRoles={['user']}><ProfilePage /></ProtectedRoute>} />
        <Route path="/survey" element={<ProtectedRoute allowedRoles={['user']}><SatisfactionSurveyPage /></ProtectedRoute>} />
        <Route path="/payment" element={<ProtectedRoute allowedRoles={['user']}><PaymentPage /></ProtectedRoute>} />
        <Route path="/payment/receipt" element={<ProtectedRoute allowedRoles={['user', 'admin']}><PaymentReceiptPage /></ProtectedRoute>} />
        <Route path="/pqr" element={<ProtectedRoute allowedRoles={['user']}><PQRPage /></ProtectedRoute>} />

        {/* ── Rutas Mecánico ── */}
        <Route path="/mechanic-home" element={<ProtectedRoute allowedRoles={['mechanic']}><MechanicHomePage /></ProtectedRoute>} />
        <Route path="/mechanic-dashboard" element={<ProtectedRoute allowedRoles={['mechanic']}><MechanicDashboardPage /></ProtectedRoute>} />
        <Route path="/mechanic-payments" element={<ProtectedRoute allowedRoles={['mechanic']}><MechanicPaymentDashboard /></ProtectedRoute>} />
        <Route path="/mechanic-payment" element={<ProtectedRoute allowedRoles={['mechanic']}><MechanicPaymentPage /></ProtectedRoute>} />
        <Route path="/mechanic-profile" element={<ProtectedRoute allowedRoles={['mechanic']}><MechanicProfilePage /></ProtectedRoute>} />
        <Route path="/mechanic-orders" element={<ProtectedRoute allowedRoles={['mechanic']}><MechanicOrdersPage /></ProtectedRoute>} />
        <Route path="/mechanic-vehicle-info" element={<ProtectedRoute allowedRoles={['mechanic']}><MechanicVehicleInfoPage /></ProtectedRoute>} />
        <Route path="/mechanic-pqr" element={<ProtectedRoute allowedRoles={['mechanic']}><PQRPage /></ProtectedRoute>} />

        {/* ── Rutas compartidas ── */}
        <Route path="/contact" element={<ProtectedRoute allowedRoles={['user', 'mechanic', 'admin']}><ContactPage /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
