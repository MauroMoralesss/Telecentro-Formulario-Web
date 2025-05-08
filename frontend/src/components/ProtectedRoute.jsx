import { useAuth } from "../context/AuthContext.jsx";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const { usuario, cargando } = useAuth();

  // Mientras se valida la cookie / perfil…
  if (cargando) {
    return <div>Cargando usuario…</div>;
  }

  // Si no hay usuario, redirijo al login
  if (!usuario) {
    return <Navigate to="/" replace />;
  }

  // Si está logueado, renderiza la ruta hija
  return <Outlet />;
}
