import { useEffect, useState } from "react";
import axios from "../api/axios";
import { Link, useNavigate } from "react-router-dom";

function TecnicosAdmin() {
  const [tecnicos, setTecnicos] = useState([]);
  const [nuevo, setNuevo] = useState({ nombre: "", email: "", password: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const cargarTecnicos = async () => {
      const res = await axios.get("/tecnicos", { withCredentials: true });
      setTecnicos(res.data.filter((t) => t.rol === "tecnico"));
    };
    cargarTecnicos();
  }, []);

  const handleCrear = async (e) => {
    e.preventDefault();
    await axios.post("/signup", nuevo, { withCredentials: true });
    alert("Técnico creado correctamente");
    navigate("/tecnicos");
  };

  const toggleEstado = async (id, estadoActual) => {
    const res = await axios.patch(
      `/tecnicos/${id}/estado`,
      { activo: !estadoActual },
      { withCredentials: true }
    );
    setTecnicos((prev) =>
      prev.map((t) => (t.id_tecnico === id ? res.data : t))
    );
  };

  return (
    <div className="admin-container card-container">
      <h2 className="admin-title">Administrar Técnicos</h2>

      <h3 className="section-title">Crear nuevo técnico</h3>
      <form className="form-card" onSubmit={handleCrear}>
        <input
          type="text"
          placeholder="Nombre"
          value={nuevo.nombre}
          onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={nuevo.email}
          onChange={(e) => setNuevo({ ...nuevo, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={nuevo.password}
          onChange={(e) => setNuevo({ ...nuevo, password: e.target.value })}
          required
        />
        <button type="submit" className="btn btn-primary">Crear técnico</button>
      </form>

      <hr className="divider" />

      <h3 className="section-title">Lista de técnicos</h3>
      <ul className="technician-list">
        {tecnicos.map((t) => (
          <li key={t.id_tecnico} className="technician-item">
            <span>
              {t.id_tecnico} - {t.nombre} ({t.email}) -{" "}
              <span className={t.activo ? "estado-activo" : "estado-inactivo"}>
                {t.activo ? "✅ Activo" : "❌ Inactivo"}
              </span>
            </span>
            <div className="btn-group">
              <Link to={`/tecnico/${t.id_tecnico}`} className="btn-link">Ver perfil</Link>
              <button
                onClick={() => toggleEstado(t.id_tecnico, t.activo)}
                className="btn btn-secundario"
              >
                {t.activo ? "Desactivar" : "Activar"}
              </button>
            </div>
          </li>
        ))}
      </ul>

      <button onClick={() => navigate("/dashboard")} className="btn btn-back">
        ← Volver al Dashboard
      </button>
    </div>
  );
}

export default TecnicosAdmin;
