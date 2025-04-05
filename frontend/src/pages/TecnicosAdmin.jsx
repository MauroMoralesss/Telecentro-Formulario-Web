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
    <div style={{ padding: 20 }}>
      <h2>Administrar Técnicos</h2>

      <h3>Crear nuevo técnico</h3>
      <form onSubmit={handleCrear}>
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
        <button type="submit">Crear técnico</button>
      </form>

      <hr />

      <h3>Lista de técnicos</h3>
      <ul>
        {tecnicos.map((t) => (
          <li key={t.id_tecnico}>
            {t.id_tecnico} - {t.nombre} ({t.email}) -{" "}
            {t.activo ? "✅ Activo" : "❌ Inactivo"}{" "}
            <Link to={`/tecnico/${t.id_tecnico}`}>Ver perfil</Link>{" "}
            <button onClick={() => toggleEstado(t.id_tecnico, t.activo)}>
              {t.activo ? "Desactivar" : "Activar"}
            </button>
          </li>
        ))}
      </ul>

      <button onClick={() => navigate("/dashboard")}>
        ← Volver al Dashboard
      </button>
    </div>
  );
}

export default TecnicosAdmin;
