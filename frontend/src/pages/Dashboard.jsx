import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

import axios from "../api/axios.js";
import FormularioCard from "../components/FormularioCard";
import FiltrosAvanzados from "../components/FiltrosAvanzados";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NotificationsPanel from "../components/NotificationsPanel";

function Dashboard() {
  const { usuario, cargando, logout } = useAuth();
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtroOrden, setFiltroOrden] = useState("");
  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");
  const [filtroTecnico, setFiltroTecnico] = useState("");
  const [formularios, setFormularios] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("notifications");
    return saved ? JSON.parse(saved) : [];
  });
  const formulariosPorPagina = 10;

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

  useEffect(() => {
    setPaginaActual(1); // Reiniciar al cambiar filtros
  }, [filtroEstado, filtroOrden, filtroCliente, filtroFecha, filtroTecnico]);

  useEffect(() => {
    if (usuario?.rol !== "admin") return;

    const base = import.meta.env.VITE_BACKEND || "http://localhost:3000";
    const evtSource = new EventSource(`${base}/api/formularios/events`);

    evtSource.addEventListener("formulario-actualizado", (e) => {
      const { id, nro_orden, nuevoEstado } = JSON.parse(e.data);

      // 1. Actualizar el estado local
      setFormularios((prev) =>
        prev.map((f) =>
          f.id_formulario === id ? { ...f, estado: nuevoEstado } : f
        )
      );

      // 2. Guardar la notificación
      const nuevaNotif = {
        id: Date.now(),
        mensaje: `Formulario N° ${nro_orden} → Estado: ${nuevoEstado}`,
        fecha: new Date().toISOString(),
        leido: false,
        id_formulario: id,
      };

      setNotifications((prev) => [nuevaNotif, ...prev]);

      // 3. Mostrar toast con botón
      toast.info(
        ({ closeToast }) => (
          <div>
            📋 <strong>Formulario N° {nro_orden}</strong>
            <br />
            Estado: <strong>{nuevoEstado}</strong>
            <br />
            <button
              style={{
                marginTop: 6,
                background: "#1976d2",
                color: "white",
                border: "none",
                padding: "6px 12px",
                borderRadius: 4,
                cursor: "pointer",
              }}
              onClick={() => {
                closeToast();
                navigate(`/formulario/${id}`);
              }}
            >
              Ver detalles
            </button>
          </div>
        ),
        { autoClose: 7000 }
      );
    });

    return () => evtSource.close();
  }, [usuario]);

  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  if (cargando) return <p>Cargando sesión...</p>;
  if (!usuario) return <p>No estás logueado</p>;

  const filtrados = formularios.filter(
    (f) =>
      (filtroEstado === "todos" || f.estado === filtroEstado) &&
      (filtroOrden === "" || f.nro_orden.includes(filtroOrden)) &&
      (filtroCliente === "" || f.nro_cliente.includes(filtroCliente)) &&
      (filtroFecha === "" || f.fecha_creacion.startsWith(filtroFecha)) &&
      (filtroTecnico === "" || String(f.tecnico_id).includes(filtroTecnico))
  );

  const filtradosOrdenados = filtrados.sort(
    (a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion)
  );

  const totalPaginas = Math.ceil(
    filtradosOrdenados.length / formulariosPorPagina
  );
  const inicio = (paginaActual - 1) * formulariosPorPagina;
  const formulariosPagina = filtradosOrdenados.slice(
    inicio,
    inicio + formulariosPorPagina
  );

  return (
    <div className="dashboard">
      <h1 style={{ marginBottom: 8 }}>Bienvenido, {usuario.nombre}</h1>
      <p style={{ marginBottom: 20 }}>Rol: {usuario.rol}</p>

      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}
      >
        {usuario?.rol === "admin" && (
          <>
            <button onClick={() => navigate("/crear-formulario")}>
              ➕ Crear formulario
            </button>
            <button onClick={() => navigate("/tecnicos")}>
              👥 Ver técnicos
            </button>
          </>
        )}
        <button>
          <Link
            className="link"
            style={{ color: "white" }}
            to={`/tecnico/${usuario.id_tecnico}`}
          >
            Ver perfil
          </Link>
        </button>
        <button onClick={logout}>Cerrar sesión</button>
{/*         {usuario.rol === "admin" && (
          <NotificationsPanel
            notifications={notifications}
            setNotifications={setNotifications}
          />
        )} */}
      </div>

      <hr style={{ marginBottom: 20 }} />

      <div style={{ marginBottom: 20 }}>
        <label>
          <strong>Filtrar por estado:</strong>
        </label>{" "}
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          style={{ padding: 6, marginLeft: 8 }}
        >
          <option value="todos">Todos</option>
          <option value="Iniciado">Iniciado</option>
          <option value="En revision">En revisión</option>
          <option value="Aprobado">Aprobado</option>
          <option value="Visto sin validar">Visto sin validar</option>
          <option value="Rechazado">Rechazado</option>
        </select>
      </div>

      <div style={{ marginBottom: 10 }}>
        <button onClick={() => setMostrarFiltros(!mostrarFiltros)}>
          {mostrarFiltros
            ? "Ocultar filtros avanzados"
            : "Mostrar filtros avanzados"}
        </button>
      </div>

      {mostrarFiltros && (
        <FiltrosAvanzados
          filtroOrden={filtroOrden}
          setFiltroOrden={setFiltroOrden}
          filtroCliente={filtroCliente}
          setFiltroCliente={setFiltroCliente}
          filtroFecha={filtroFecha}
          setFiltroFecha={setFiltroFecha}
          {...(usuario.rol === "admin" && {
            filtroTecnico,
            setFiltroTecnico,
          })}
        />
      )}

      <div>
        {filtradosOrdenados.length === 0 ? (
          <p style={{ textAlign: "center", marginTop: 20 }}>
            No hay formularios con los filtros seleccionados.
          </p>
        ) : (
          <>
            {formulariosPagina.map((form) => (
              <FormularioCard key={form.id_formulario} form={form} />
            ))}

            {/* Navegación de páginas */}
            <div style={{ textAlign: "center", marginTop: 20 }}>
              <button
                onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
                disabled={paginaActual === 1}
                style={{ marginRight: 10 }}
              >
                ← Anterior
              </button>
              <span>
                Página {paginaActual} de {totalPaginas}
              </span>
              <button
                onClick={() =>
                  setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))
                }
                disabled={paginaActual === totalPaginas}
                style={{ marginLeft: 10 }}
              >
                Siguiente →
              </button>
            </div>
          </>
        )}
      </div>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnHover
      />
    </div>
  );
}

export default Dashboard;
