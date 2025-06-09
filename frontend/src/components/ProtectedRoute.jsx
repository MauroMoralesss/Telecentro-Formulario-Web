import { useAuth } from "../context/AuthContext.jsx";
import { Navigate, Outlet, useParams } from "react-router-dom";

export default function ProtectedRoute() {
  const { usuario, cargando } = useAuth();
  const { slug } = useParams();

  // Mientras se valida la cookie / perfil…
  if (cargando) {
    return <div>Cargando usuario…</div>;
  }

  // Si no hay usuario, redirijo al login del contratista
  if (!usuario) {
    return <Navigate to={`/${slug}/login`} replace />;
  }

  // Si el usuario no pertenece a este contratista, redirijo al login
  if (usuario.contratista?.slug !== slug) {
    return <Navigate to={`/${slug}/login`} replace />;
  }

  // Si está logueado y pertenece al contratista correcto, renderiza la ruta hija
  return <Outlet />;
}
