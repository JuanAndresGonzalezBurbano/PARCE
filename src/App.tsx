import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './views/pages/LandingPage';
import LoginPage from './views/pages/LoginPage';
import RegisterPage from './views/pages/RegisterPage';
import RoleSelectionPage from './views/pages/RoleSelectionPage';
import DashboardPage from './views/pages/DashboardPage';
import ServicesPage from './views/pages/ServicesPage';
import ServiceInProgressPage from './views/pages/ServiceInProgressPage';
import ProfilePage from './views/pages/ProfilePage';
import MechanicProfilePage from './views/pages/MechanicProfilePage';
import ContactPage from './views/pages/ContactPage';
import PaymentPage from './views/pages/PaymentPage';
import SatisfactionSurveyPage from './views/pages/SatisfactionSurveyPage';
import MechanicVehicleInfoPage from './views/pages/MechanicVehicleInfoPage';
import MechanicOrdersPage from './views/pages/MechanicOrdersPage';

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
