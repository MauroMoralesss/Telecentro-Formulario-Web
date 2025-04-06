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

  if (!tecnico) return <p style={{ textAlign: "center" }}>Cargando técnico...</p>;

  return (
    <div className="card" style={{ maxWidth: 500, margin: "40px auto", padding: 20 }}>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>👷 Perfil del Técnico</h2>
      <div style={{ lineHeight: "1.8em" }}>
        <p><strong>ID:</strong> {tecnico.id_tecnico}</p>
        <p><strong>Nombre:</strong> {tecnico.nombre}</p>
        <p><strong>Email:</strong> {tecnico.email}</p>
        <p><strong>Rol:</strong> {tecnico.rol}</p>
        <p>
          <strong>Activo:</strong>{" "}
          {tecnico.activo ? <span className="activo">✅ Sí</span> : <span className="inactivo">❌ No</span>}
        </p>
        <p>
          <strong>Registrado el:</strong>{" "}
          {new Date(tecnico.fecha_creacion).toLocaleString()}
        </p>
      </div>

      <div style={{ marginTop: 30 }}>
        <Link to="/dashboard" className="btn btn-back">← Volver al Dashboard</Link>
      </div>
    </div>
  );
}

export default TecnicoPerfil;
