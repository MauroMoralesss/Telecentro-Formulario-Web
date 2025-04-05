import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../api/axios";

function TecnicoPerfil() {
  const { id } = useParams();
  const [tecnico, setTecnico] = useState(null);

  useEffect(() => {
    const fetchTecnico = async () => {
      const res = await axios.get(`/tecnico/${id}`, { withCredentials: true });
      setTecnico(res.data);
    };
    fetchTecnico();
  }, [id]);

  if (!tecnico) return <p>Cargando técnico...</p>;

  return (
    <div style={{ padding: 20 }} class = "card-container">
      <h2>Perfil del Técnico</h2>
      <p>
        <strong>ID:</strong> {tecnico.id_tecnico}
      </p>
      <p>
        <strong>Nombre:</strong> {tecnico.nombre}
      </p>
      <p>
        <strong>Email:</strong> {tecnico.email}
      </p>
      <p>
        <strong>Rol:</strong> {tecnico.rol}
      </p>
      <p>
        <strong>Activo:</strong> {tecnico.activo ? "✅ Sí" : "❌ No"}
      </p>
      <p>
        <strong>Registrado el:</strong>{" "}
        {new Date(tecnico.fecha_creacion).toLocaleString()}
      </p>

      <Link to="/dashboard">← Volver al dashboard</Link>
    </div>
  );
}

export default TecnicoPerfil;
