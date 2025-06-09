import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleRedirect = () => {
  const { usuario } = useAuth();
  const { slug } = useParams();

  // Si no hay usuario autenticado, redirigir al login
  if (!usuario) {
    return <Navigate to={`/${slug}/login`} replace />;
  }

  // Redirigir según el rol
  switch (usuario.rol) {
    case 'admin':
      return <Navigate to={`/${slug}/admin/dashboard`} replace />;
    case 'tecnico':
      return <Navigate to={`/${slug}/dashboard`} replace />;
    default:
      // Si el rol no es reconocido, redirigir al login
      return <Navigate to={`/${slug}/login`} replace />;
  }
};

export default RoleRedirect; 