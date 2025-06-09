import { useEffect, useState } from "react";
import axios from "../api/axios";
import { useNavigate, useParams } from "react-router-dom";
import { Link } from "react-router-dom";

function TecnicosAdmin() {
  const [tecnicos, setTecnicos] = useState([]);
  const [nuevo, setNuevo] = useState({
    id_tecnico: "",
    nombre: "",
    email: "",
    password: "",
    telefono: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [filtroId, setFiltroId] = useState("");
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [paginaActual, setPaginaActual] = useState(1);
  const tecnicosPorPagina = 8;

  const navigate = useNavigate();
  const { slug } = useParams();
  useEffect(() => {
    const cargarTecnicos = async () => {
      const res = await axios.get("/tecnicos", { withCredentials: true });
      setTecnicos(res.data.filter((t) => t.rol === "tecnico"));
    };
    cargarTecnicos();
  }, []);

  const handleCrear = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await axios.post(
        "/signup",
        {
          ...nuevo,
          id_tecnico: parseInt(nuevo.id_tecnico),
          rol: "tecnico",
        },
        { withCredentials: true }
      );

      setSuccessMsg("Técnico creado correctamente");
      setTimeout(() => setSuccessMsg(""), 4000);

      setTecnicos((prev) => [
        {
          ...nuevo,
          id_tecnico: parseInt(nuevo.id_tecnico),
          rol: "tecnico",
          activo: true,
        },
        ...prev,
      ]);

      setNuevo({ id_tecnico: "", nombre: "", email: "", password: "", telefono: "" });
    } catch (error) {
      const mensaje = error.response?.data?.message || "Error del servidor";
      setErrorMsg(mensaje);
      setTimeout(() => setErrorMsg(""), 4000);
    }
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

  const tecnicosFiltrados = tecnicos
    .filter((t) =>
      filtroId ? t.id_tecnico.toString().includes(filtroId) : true
    )
    .filter((t) =>
      filtroNombre
        ? t.nombre.toLowerCase().includes(filtroNombre.toLowerCase())
        : true
    )
    .filter((t) => {
      if (filtroEstado === "activo") return t.activo;
      if (filtroEstado === "inactivo") return !t.activo;
      return true;
    });

  const indiceInicio = (paginaActual - 1) * tecnicosPorPagina;
  const tecnicosPaginados = tecnicosFiltrados.slice(
    indiceInicio,
    indiceInicio + tecnicosPorPagina
  );

  const totalPaginas = Math.ceil(tecnicosFiltrados.length / tecnicosPorPagina);

  return (
    <div className="admin-container" style={{ display: "flex", gap: 40 }}>
      <div style={{ flex: 1 }}>
        <h2 className="admin-title">Crear nuevo técnico</h2>

        {errorMsg && <div className="alert-error">⚠️ {errorMsg}</div>}
        {successMsg && <div className="alert-success">✅ {successMsg}</div>}

        <form className="form-card" onSubmit={handleCrear}>
          <input
            type="number"
            placeholder="ID Técnico"
            value={nuevo.id_tecnico}
            onChange={(e) => setNuevo({ ...nuevo, id_tecnico: e.target.value })}
            required
          />
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
          <input
            type="tel"
            placeholder="Teléfono"
            value={nuevo.telefono}
            onChange={(e) => setNuevo({ ...nuevo, telefono: e.target.value })}
            required
          />
          <button type="submit" className="btn btn-primary">
            Crear técnico
          </button>
        </form>
      </div>

      <div style={{ flex: 2 }}>
        <h3 className="section-title">Lista de técnicos</h3>

        <input
          type="text"
          placeholder="Buscar por ID"
          value={filtroId}
          onChange={(e) => setFiltroId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Buscar por nombre"
          value={filtroNombre}
          onChange={(e) => setFiltroNombre(e.target.value)}
        />
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="todos">Todos</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>

        <div className="tecnicos-grid">
          {tecnicosPaginados.map((tecnico) => (
            <div key={tecnico.id_tecnico} className="tecnico-card">
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
                <strong>Estado:</strong>{" "}
                {tecnico.activo ? (
                  <span className="activo">✅ Activo</span>
                ) : (
                  <span className="inactivo">❌ Inactivo</span>
                )}
              </p>
              <div className="acciones">
                <Link
                  className="link"
                  style={{ color: "white" }}
                  to={`/${slug}/tecnico/${tecnico.id_tecnico}`}
                >
                  Ver perfil
                </Link>
                <button
                  className={tecnico.activo ? "btn-rojo" : "btn-verde"}
                  onClick={() =>
                    toggleEstado(tecnico.id_tecnico, tecnico.activo)
                  }
                >
                  {tecnico.activo ? "Desactivar" : "Activar"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {totalPaginas > 1 && (
          <div className="paginacion">
            <button
              onClick={() => setPaginaActual(paginaActual - 1)}
              disabled={paginaActual === 1}
            >
              ← Anterior
            </button>
            <span>
              Página {paginaActual} de {totalPaginas}
            </span>
            <button
              onClick={() => setPaginaActual(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
            >
              Siguiente →
            </button>
          </div>
        )}
        <button onClick={() => navigate(`/${slug}/dashboard`)} className="btn btn-back">
          ← Volver al Dashboard
        </button>
      </div>
    </div>
  );
}

export default TecnicosAdmin;
