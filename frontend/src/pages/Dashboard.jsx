import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

import axios from "../api/axios.js";
import FormularioCard from "../components/FormularioCard";

function Dashboard() {
  const { usuario, cargando, logout } = useAuth();
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [formularios, setFormularios] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarFormularios = async () => {
      try {
        const ruta =
          usuario.rol === "admin" ? "/formularios" : "/formularios/mios";
        const res = await axios.get(`${ruta}`, {
          withCredentials: true,
        });
        setFormularios(res.data);
      } catch (error) {
        console.error("Error cargando formularios:", error);
      }
    };

    if (usuario) cargarFormularios();
  }, [usuario]);

  if (cargando) return <p>Cargando sesión...</p>;
  if (!usuario) return <p>No estás logueado</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Bienvenido, {usuario.nombre}</h1>
      <p>Rol: {usuario.rol}</p>

      {usuario?.rol === "admin" && (
        <button onClick={() => navigate("/crear-formulario")}>
          ➕ Crear nuevo formulario
        </button>
      )}

      <Link to={`/tecnico/${usuario.id_tecnico}`}>Ver perfil</Link>
      {usuario?.rol === "admin" && (
        <button onClick={() => navigate("/tecnicos")} style={{ marginLeft: 8 }}>
          👥 Ver técnicos
        </button>
      )}
      <button onClick={logout}>Cerrar sesión</button>
      <hr />
      <h2>Formularios</h2>

      <div>
        <label>Filtrar por estado: </label>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="todos">Todos</option>
          <option value="Iniciado">Iniciado</option>
          <option value="En revision">En revisión</option>
          <option value="Aprobado">Aprobado</option>
          <option value="Rechazado">Rechazado</option>
        </select>
      </div>

      {formularios.length === 0 ? (
        <p>No hay formularios aún.</p>
      ) : (
        formularios
          .filter((f) => filtroEstado === "todos" || f.estado === filtroEstado)
          .map((form) => (
            <FormularioCard key={form.id_formulario} form={form} />
          ))
      )}
    </div>
  );
}

export default Dashboard;
