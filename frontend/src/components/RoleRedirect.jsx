import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleRedirect = () => {
  const { usuario } = useAuth();

  // Si no hay usuario autenticado, redirigir al login
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  // Redirigir según el rol
  switch (usuario.rol) {
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'tecnico':
      return <Navigate to="/dashboard" replace />;
    default:
      // Si el rol no es reconocido, redirigir al login
      return <Navigate to="/login" replace />;
  }
};

export default RoleRedirect; 