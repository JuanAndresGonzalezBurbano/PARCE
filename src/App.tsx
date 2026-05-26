import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RoleSelectionPage from './pages/RoleSelectionPage';
import DashboardPage from './pages/DashboardPage';
import ServicesPage from './pages/ServicesPage';
import ServiceInProgressPage from './pages/ServiceInProgressPage';
import ProfilePage from './pages/ProfilePage';
import MechanicProfilePage from './pages/MechanicProfilePage';
import ContactPage from './pages/ContactPage';
import PaymentPage from './pages/PaymentPage';
import SatisfactionSurveyPage from './pages/SatisfactionSurveyPage';
import MechanicVehicleInfoPage from './pages/MechanicVehicleInfoPage';
import MechanicOrdersPage from './pages/MechanicOrdersPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/role-selection" element={<RoleSelectionPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/service-in-progress" element={<ServiceInProgressPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/mechanic-profile" element={<MechanicProfilePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/survey" element={<SatisfactionSurveyPage />} />
        <Route path="/mechanic-vehicle-info" element={<MechanicVehicleInfoPage />} />
        <Route path="/mechanic-orders" element={<MechanicOrdersPage />} />
      </Routes>
    </Router>
  );
}

export default App;
