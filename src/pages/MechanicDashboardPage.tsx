// Este archivo redirige al panel de solicitudes del mecánico
// El mecánico no tiene dashboard propio, solo solicitudes
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MechanicDashboardPage() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/mechanic-orders', { replace: true });
  }, [navigate]);
  return null;
}
