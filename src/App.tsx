import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RoleSelectionPage from './pages/RoleSelectionPage';
import DashboardPage from './pages/DashboardPage';
import MechanicDashboardPage from './pages/MechanicDashboardPage';
import ServicesPage from './pages/ServicesPage';
import ServiceInProgressPage from './pages/ServiceInProgressPage';
import ProfilePage from './pages/ProfilePage';
import MechanicProfilePage from './pages/MechanicProfilePage';
import ContactPage from './pages/ContactPage';
import PaymentPage from './pages/PaymentPage';
import SatisfactionSurveyPage from './pages/SatisfactionSurveyPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route 
            path="/role-selection" 
            element={
              <ProtectedRoute>
                <RoleSelectionPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/mechanic-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['mechanic']}>
                <MechanicDashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/services" 
            element={
              <ProtectedRoute allowedRoles={['user', 'admin']}>
                <ServicesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/service-in-progress" 
            element={
              <ProtectedRoute>
                <ServiceInProgressPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
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
            path="/contact" 
            element={
              <ProtectedRoute>
                <ContactPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/payment" 
            element={
              <ProtectedRoute>
                <PaymentPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/survey" 
            element={
              <ProtectedRoute>
                <SatisfactionSurveyPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
