// src/pages/AdminTecnicos.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axios.js";
import Layout from "../components/layout/Layout.jsx";
import {
  FaCheck,
  FaTimes,
  FaSearch,
  FaUser,
  FaToggleOn,
  FaToggleOff,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";

// react-toastify
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-datepicker/dist/react-datepicker.css";

import "../styles/global.css";
import "../styles/dashboard.css";
import "../styles/tecnicos.css";
import "../styles/modal.css";

export default function AdminTecnicos() {
  const navigate = useNavigate();
  const { logout, usuario } = useAuth();

  // Estado local
  const [tecnicos, setTecnicos] = useState([]);
  const [filtroId, setFiltroId] = useState("");
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [paginaActual, setPaginaActual] = useState(1);
  const tecnicosPorPagina = 8;
  const [notifications, setNotifications] = useState(() => {
    const stored = localStorage.getItem("notifications");
    return stored ? JSON.parse(stored) : [];
  });

  // Carga inicial de datos
  useEffect(() => {
    const cargarTecnicos = async () => {
      try {
        const res = await axios.get("/tecnicos", { withCredentials: true });
        setTecnicos(res.data.filter((t) => t.rol === "tecnico"));
      } catch (error) {
        console.error("Error al cargar técnicos:", error);
      }
    };
    cargarTecnicos();
  }, []);

  // SSE para recibir actualizaciones en tiempo real
  useEffect(() => {
    const base = import.meta.env.VITE_BACKEND || "http://localhost:3000";
    const evtSource = new EventSource(`${base}/formularios/events`, {
      withCredentials: true,
    });

    evtSource.addEventListener("formulario-actualizado", (e) => {
      const { id, nro_orden, nuevoEstado } = JSON.parse(e.data);

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
  }, []);

  // Persiste notifs en localStorage
  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  const toggleEstado = async (id, estadoActual) => {
    try {
      const res = await axios.patch(
        `/tecnicos/${id}/estado`,
        { activo: !estadoActual },
        { withCredentials: true }
      );
      setTecnicos((prev) =>
        prev.map((t) => (t.id_tecnico === id ? res.data : t))
      );
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    }
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
    <Layout
      userName={usuario?.nombre}
      userEmail={usuario?.email}
      notifications={notifications}
      setNotifications={setNotifications}
      onLogout={() => {
        logout();
        navigate("/login");
      }}
    >
      {/* ToastContainer para los mensajes push */}
      <ToastContainer
        position="top-center"
        autoClose={5000}
        newestOnTop
        closeOnClick
      />

      <div className="tecnicos-view-container">
        <div className="tecnicos-header">
          <h1>Lista de Técnicos</h1>
        </div>

        <div className="filtros-container">
          <div className="filtro-grupo">
            <div className="filtro-input">
              <FaSearch className="filtro-icon" />
              <input
                type="text"
                placeholder="Buscar por ID"
                value={filtroId}
                onChange={(e) => setFiltroId(e.target.value)}
              />
            </div>

            <div className="filtro-input">
              <FaUser className="filtro-icon" />
              <input
                type="text"
                placeholder="Buscar por nombre"
                value={filtroNombre}
                onChange={(e) => setFiltroNombre(e.target.value)}
              />
            </div>

            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="filtro-select"
            >
              <option value="todos">Todos</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </div>
        </div>

        <div className="tecnicos-grid">
          {tecnicosPaginados.length > 0 ? (
            tecnicosPaginados.map((tecnico) => (
              <div key={tecnico.id_tecnico} className="tecnico-card">
                <div className="tecnico-header">
                  <span className="tecnico-id">ID: {tecnico.id_tecnico}</span>
                  <span
                    className={`tecnico-estado ${
                      tecnico.activo ? "activo" : "inactivo"
                    }`}
                  >
                    {tecnico.activo ? (
                      <>
                        <FaCheck /> Activo
                      </>
                    ) : (
                      <>
                        <FaTimes /> Inactivo
                      </>
                    )}
                  </span>
                </div>
                <div className="tecnico-info">
                  <h3>{tecnico.nombre}</h3>
                  <p>{tecnico.email}</p>
                  {tecnico.telefono && <p>Tel: {tecnico.telefono}</p>}
                </div>
                <div className="tecnico-acciones">
                  <button
                    onClick={() => navigate(`/tecnico/${tecnico.id_tecnico}`)}
                    className="btn-ver"
                  >
                    Ver perfil
                  </button>
                  <button
                    className={`btn-toggle ${
                      tecnico.activo ? "desactivar" : "activar"
                    }`}
                    onClick={() =>
                      toggleEstado(tecnico.id_tecnico, tecnico.activo)
                    }
                  >
                    {tecnico.activo ? (
                      <>
                        <FaToggleOff /> Desactivar
                      </>
                    ) : (
                      <>
                        <FaToggleOn /> Activar
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-resultados">
              <p>No se encontraron técnicos con los filtros aplicados</p>
            </div>
          )}
        </div>

        {totalPaginas > 1 && (
          <div className="paginacion">
            <button
              onClick={() => setPaginaActual(paginaActual - 1)}
              disabled={paginaActual === 1}
              className="btn-pagina"
            >
              <FaArrowLeft /> Anterior
            </button>
            <span className="pagina-info">
              Página {paginaActual} de {totalPaginas}
            </span>
            <button
              onClick={() => setPaginaActual(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
              className="btn-pagina"
            >
              Siguiente <FaArrowRight />
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
