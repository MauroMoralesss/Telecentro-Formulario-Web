// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axios.js";
import Layout from "../components/layout/Layout.jsx";
import {
  FaFileAlt,
  FaUser,
  FaPhone,
  FaHome,
  FaCalendarAlt,
  FaCheckSquare,
  FaExclamationTriangle,
  FaBox,
  FaTv,
  FaWifi,
  FaClock,
  FaHistory,
  FaCheck,
  FaTimes,
  FaEye,
  FaEdit,
  FaChartBar,
  FaCalendar,
  FaSpinner,
} from "react-icons/fa";
import L from "leaflet"; // Import Leaflet

import toast from "react-hot-toast";

import "../styles/table.css";
import "../styles/formularios.css";
import EditarFormularioModal from "../components/layout/editar-formulario-modal";
import { LoadingState } from "../components/ui/LoadingState";
import { useFetch } from "../hooks/useFetch";
import { useHistorial } from "../hooks/useHistorial";
import { HistorialFormulario } from "../components/layout/historial-formulario";
import { EstadisticasFormulario } from '../components/EstadisticasFormulario';
import { LoadingSpinner } from '../components/LoadingSpinner';

export default function AdminFormularioDetalle() {
  const navigate = useNavigate();
  const { logout, usuario } = useAuth();
  const { slug } = useParams();
  // Estado local
  const { id } = useParams();
  const { 
    data: formulario, 
    isLoading, 
    error,
    refetch: fetchForm 
  } = useFetch(`/formularios/${id}`);
  const [notifications, setNotifications] = useState(() => {
    const stored = localStorage.getItem("notifications");
    return stored ? JSON.parse(stored) : [];
  });
  const [showEditModal, setShowEditModal] = useState(false);

  const { 
    historial, 
    estadisticas, 
    isLoading: historialLoading, 
    error: historialError 
  } = useHistorial(id);

  const [activeTab, setActiveTab] = useState("dispositivos");
  const [showRechazarInput, setShowRechazarInput] = useState(false);
  const [rechazoData, setRechazoData] = useState({
    motivo: "",
    categoria: "",
    detalles: "",
    confirmado: false,
  });
  const [errores, setErrores] = useState({
    motivo: "",
    categoria: "",
    detalles: "",
    general: "",
  });
  const [estadisticasTab, setEstadisticasTab] = useState("general");

  // Usuario actual simulado
  const usuarioActual = "Admin (Tú)";

  // Función para registrar cambios en el historial
  const registrarCambio = (
    accion,
    detalles,
    estadoAnterior,
    estadoNuevo,
    campos
  ) => {
    const nuevoItem = {
      id: historial.length + 1,
      fecha: new Date(),
      usuario: usuarioActual,
      accion,
      detalles,
      estadoAnterior,
      estadoNuevo,
      campos,
    };

    setHistorial((prevHistorial) => [...prevHistorial, nuevoItem]);

    // Actualizar fecha de modificación en el formulario
    setFormulario((prev) => ({
      ...prev,
      fecha_modificacion: new Date().toISOString(),
    }));
  };

  // Funciones para calcular estadísticas
  const calcularEstadisticas = () => {
    // Estadísticas por tipo de acción
    const accionesPorTipo = historial.reduce((acc, item) => {
      acc[item.accion] = (acc[item.accion] || 0) + 1;
      return acc;
    }, {});

    // Estadísticas por usuario
    const accionesPorUsuario = historial.reduce((acc, item) => {
      acc[item.usuario] = (acc[item.usuario] || 0) + 1;
      return acc;
    }, {});

    // Estadísticas por día
    const accionesPorDia = historial.reduce((acc, item) => {
      const fecha = new Date(item.fecha).toLocaleDateString();
      acc[fecha] = (acc[fecha] || 0) + 1;
      return acc;
    }, {});

    // Estadísticas por estado
    const cambiosDeEstado = historial.filter((item) => item.estadoNuevo);
    const accionesPorEstado = cambiosDeEstado.reduce((acc, item) => {
      if (item.estadoNuevo) {
        acc[item.estadoNuevo] = (acc[item.estadoNuevo] || 0) + 1;
      }
      return acc;
    }, {});

    // Campos más modificados
    const camposMasModificados = historial.reduce((acc, item) => {
      if (item.campos && item.campos.length > 0) {
        item.campos.forEach((campo) => {
          acc[campo.campo] = (acc[campo.campo] || 0) + 1;
        });
      }
      return acc;
    }, {});

    // Tiempo promedio entre cambios
    let tiempoTotal = 0;
    let contadorIntervalos = 0;
    for (let i = 1; i < historial.length; i++) {
      const tiempoAnterior = new Date(historial[i - 1].fecha).getTime();
      const tiempoActual = new Date(historial[i].fecha).getTime();
      const diferencia = tiempoActual - tiempoAnterior;
      tiempoTotal += diferencia;
      contadorIntervalos++;
    }
    const tiempoPromedio =
      contadorIntervalos > 0 ? tiempoTotal / contadorIntervalos : 0;
    const horasPromedio = Math.floor(tiempoPromedio / (1000 * 60 * 60));
    const minutosPromedio = Math.floor(
      (tiempoPromedio % (1000 * 60 * 60)) / (1000 * 60)
    );

    return {
      accionesPorTipo,
      accionesPorUsuario,
      accionesPorDia,
      accionesPorEstado,
      camposMasModificados,
      tiempoPromedio: { horas: horasPromedio, minutos: minutosPromedio },
      totalCambios: historial.length,
      ultimoCambio: historial[historial.length - 1],
      primerCambio: historial[0],
    };
  };

  // Función para obtener el valor máximo de un objeto
  const getMaxValue = (obj) => {
    return Math.max(...Object.values(obj));
  };

  // Función para calcular el porcentaje
  const calcularPorcentaje = (valor, total) => {
    return total > 0 ? (valor / total) * 100 : 0;
  };

  useEffect(() => {
    if (activeTab !== "archivos" || !formulario) return;
    const { latitud, longitud } = formulario;
    if (!latitud || !longitud) return;

    // Load Leaflet script/style then init map
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = initMap;
    document.head.appendChild(script);
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    return () => {
      if (window.myMap) {
        window.myMap.remove();
        window.myMap = null;
      }
    };
  }, [activeTab, formulario]);

  const initMap = () => {
    if (!formulario) return;
    const { latitud, longitud, domicilio, nombre } = formulario;
    const container = document.getElementById("map-container");
    if (!container) return;
    if (!window.myMap) {
      window.myMap = L.map(container).setView([latitud, longitud], 15);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(window.myMap);
      L.marker([latitud, longitud])
        .addTo(window.myMap)
        .bindPopup(`${nombre}<br>${domicilio}`)
        .openPopup();
    } else {
      window.myMap.setView([latitud, longitud], 15);
    }
  };

  // SSE para recibir actualizaciones en tiempo real
  useEffect(() => {
    const base = import.meta.env.VITE_BACKEND || "http://localhost:3000";
    const evtSource = new EventSource(`${base}/formularios/events`, {
      withCredentials: true,
    });

    evtSource.addEventListener("formulario-actualizado", (e) => {
      console.log("Evento SSE recibido (detalle):", e.data);
      const { id, nro_orden, nuevoEstado } = JSON.parse(e.data);

      // 1. Actualizar el estado local si corresponde
      if (formulario && formulario.id_formulario === id) {
        fetchForm();
      }

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
      toast(
        (t) => (
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
                toast.remove(t.id);
                navigate(`/${slug}/admin/formulario/${id}`);
              }}
            >
              Ver detalles
            </button>
          </div>
        ),
        {
          duration: 7000,
          position: "top-center",
        }
      );
    });

    return () => evtSource.close();
  }, [formulario, fetchForm]);

  if (!formulario) {
    return <LoadingSpinner message="Cargando formulario..." size="large" color="#ff0000" />;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getDeviceIcon = (tipo) => {
    switch (tipo.toLowerCase()) {
      case "modem":
        return <FaWifi className="icon-small" />;
      case "deco":
        return <FaTv className="icon-small" />;
      default:
        return <FaBox className="icon-small" />;
    }
  };

  const handleRechazar = async () => {
    // 1) Si todavía no abrimos el form, lo mostramos
    if (!showRechazarInput) {
      setShowRechazarInput(true);
      return;
    }

    // 2) Validación
    const errs = { motivo: "", categoria: "", general: "" };
    let hasError = false;
    if (!rechazoData.motivo.trim()) {
      errs.motivo = "El motivo es obligatorio";
      hasError = true;
    } else if (rechazoData.motivo.trim().length < 5) {
      errs.motivo = "Mínimo 5 caracteres";
      hasError = true;
    }
    if (!rechazoData.categoria) {
      errs.categoria = "Debe elegir categoría";
      hasError = true;
    }
    if (!rechazoData.confirmado) {
      errs.general = "Debe confirmar el rechazo";
      hasError = true;
    }
    if (hasError) {
      setErrores(errs);
      return;
    }

    // 3) Confirmación
    if (!window.confirm("¿Seguro que deseas rechazar?")) {
      return;
    }

    // 4) Llamada al backend
    try {
      const motivoCompleto = `${rechazoData.categoria}: ${rechazoData.motivo}`;
      await axios.patch(
        `/formularios/${formulario.id_formulario}/estado`,
        { estado: "Rechazado", motivo_rechazo: motivoCompleto },
        { withCredentials: true }
      );
      toast.error("❌ Formulario rechazado");
      // 5) Limpiar UI
      setShowRechazarInput(false);
      setRechazoData({
        motivo: "",
        categoria: "",
        detalles: "",
        confirmado: false,
      });
      setErrores({ motivo: "", categoria: "", detalles: "", general: "" });
      // 6) Refrescamos datos
      await fetchForm();
    } catch (err) {
      console.error(err);
      toast.error("❌ No se pudo procesar el rechazo");
    }
  };

  // handlers de aprobar y visto iguales: patch + fetchForm + toast
  const handleAprobar = async () => {
    try {
      await axios.patch(
        `/formularios/${formulario.id_formulario}/estado`,
        { estado: "Aprobado" },
        { withCredentials: true }
      );
      toast.success("✅ Formulario aprobado");
      await fetchForm();
    } catch (err) {
      console.error(err);
      toast.error("❌ No se pudo aprobar");
    }
  };

  const handleVisto = async () => {
    try {
      await axios.patch(
        `/formularios/${formulario.id_formulario}/estado`,
        { estado: "Visto sin validar" },
        { withCredentials: true }
      );
      toast("🔄 Marcado como visto");
      await fetchForm();
    } catch (err) {
      console.error(err);
      toast.error("❌ No se pudo marcar como visto");
    }
  };

  // Función para obtener el icono según el tipo de acción
  const getAccionIcon = (accion) => {
    switch (accion.toLowerCase()) {
      case "creación":
        return <FaEdit className="icon-small" />;
      case "aprobación":
        return <FaCheck className="icon-small" />;
      case "rechazo":
        return <FaTimes className="icon-small" />;
      case "revisión":
      case "visto":
        return <FaEye className="icon-small" />;
      case "edición":
        return <FaEdit className="icon-small" />;
      default:
        return <FaHistory className="icon-small" />;
    }
  };

  // Función para obtener la clase CSS según el tipo de acción
  const getAccionClass = (accion) => {
    switch (accion.toLowerCase()) {
      case "creación":
        return "accion-creacion";
      case "aprobación":
        return "accion-aprobacion";
      case "rechazo":
        return "accion-rechazo";
      case "revisión":
      case "visto":
        return "accion-revision";
      case "edición":
        return "accion-edicion";
      default:
        return "";
    }
  };

  // Función para obtener el color según el tipo de acción
  const getAccionColor = (accion) => {
    switch (accion.toLowerCase()) {
      case "creación":
        return "#3b82f6"; // Azul
      case "aprobación":
        return "#10b981"; // Verde
      case "rechazo":
        return "#ef4444"; // Rojo
      case "revisión":
      case "visto":
        return "#f59e0b"; // Amarillo
      case "edición":
        return "#8b5cf6"; // Púrpura
      default:
        return "#6b7280"; // Gris
    }
  };

  // Calcular estadísticas
  const estadisticasCalculadas = calcularEstadisticas();

  const handleUpdate = (formularioActualizado) => {
    fetchForm();
    toast.success("Formulario actualizado localmente.");
  };

  const handleOpenEditModal = () => {
    setShowEditModal(true);
  };

  const renderValor = (valor) => {
    if (Array.isArray(valor)) {
      return (
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {valor.map((v, i) => (
            <li key={i}>{renderValor(v)}</li>
          ))}
        </ul>
      );
    }
    if (typeof valor === 'object' && valor !== null) {
      // Si es un objeto de videos
      if (
        Object.keys(valor).length &&
        ['interior', 'exterior', 'extra'].some((k) => Object.keys(valor).includes(k))
      ) {
        return (
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {valor.interior && (
              <li>
                <a href={valor.interior} target="_blank" rel="noopener noreferrer">
                  Ver interior
                </a>
              </li>
            )}
            {valor.exterior && (
              <li>
                <a href={valor.exterior} target="_blank" rel="noopener noreferrer">
                  Ver exterior
                </a>
              </li>
            )}
            {valor.extra && (
              <li>
                <a href={valor.extra} target="_blank" rel="noopener noreferrer">
                  Ver extra
                </a>
              </li>
            )}
          </ul>
        );
      }
      // Si es otro objeto, mostrarlo como string legible en <pre>
      return <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: '#f8f8f8', borderRadius: 4, padding: 4 }}>{JSON.stringify(valor, null, 2)}</pre>;
    }
    return <>{valor}</>;
  };

  return (
    <Layout
      userName={usuario?.nombre}
      userEmail={usuario?.email}
      notifications={notifications}
      setNotifications={setNotifications}
      onNew={() => navigate(`/${slug}/admin/formulario/nuevo`)}
      onViewTechs={() => navigate(`/${slug}/admin/tecnicos`)}
      onLogout={() => {
        logout();
        navigate(`/${slug}/login`); 
      }}
    >
      <LoadingState 
        isLoading={isLoading} 
        error={error}
        loadingMessage="Cargando formulario..."
      >
        {formulario && (
      <div className="container">
        <div className="header">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <div>
            <h1 className="title">📋 Orden N° {formulario.nro_orden}</h1>
            <p className="subtitle">
                    Nombre Técnico: {formulario.tecnico_nombre} | Técnico ID: {formulario.tecnico_id}
            </p>
          </div>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  {formulario && ["Iniciado", "Rechazado"].includes(formulario.estado) && (
                    <button 
                      onClick={handleOpenEditModal}
                      className="btn btn-secondary"
                      style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                    >
                      <FaEdit /> Editar
                    </button>
                  )}
          <div className={`badge badge-${formulario.estado.toLowerCase()}`}>
            {formulario.estado}
                  </div>
                </div>
          </div>
        </div>

        <div className="card-grid">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                <FaUser className="icon" />
                Información del Cliente
              </h2>
            </div>
            <div className="card-content">
              <div className="info-group">
                <div className="info-item">
                  <span className="info-label">Nombre:</span>
                  <p>{formulario.nombre}</p>
                </div>
                <div className="info-item">
                  <span className="info-label">Nro. Cliente:</span>
                  <p>{formulario.nro_cliente}</p>
                </div>
                <div className="info-item">
                  <span className="info-label">Teléfono:</span>
                  <p className="with-icon">
                    <FaPhone className="icon-small" />
                    {formulario.telefono}
                  </p>
                </div>
                <div className="info-item">
                  <span className="info-label">Domicilio:</span>
                  <p className="with-icon">
                    <FaHome className="icon-small" />
                    {formulario.domicilio}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                <FaFileAlt className="icon" />
                Detalles de la Orden
              </h2>
            </div>
            <div className="card-content">
              <div className="info-group">
                <div className="info-item">
                  <span className="info-label">Servicios a instalar:</span>
                  {formulario.servicios_instalar ? (
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {formulario.servicios_instalar.split(/\r?\n/).filter((s) => s.trim() !== "").map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  ) : (
                    <span>—</span>
                  )}
                </div>
                <div className="info-item">
                  <span className="info-label">Fecha de creación:</span>
                  <p className="with-icon">
                    <FaCalendarAlt className="icon-small" />
                    {formatDate(formulario.fecha_creacion)}
                  </p>
                </div>
                <div className="info-item">
                  <span className="info-label">Última modificación:</span>
                  <p className="with-icon">
                    <FaCalendarAlt className="icon-small" />
                    {formatDate(formulario.fecha_modificacion)}
                  </p>
                </div>
                {formulario.motivo_rechazo && (
                  <div className="info-item">
                    <span className="info-label">Motivo de rechazo:</span>
                    <p className="with-icon text-error">
                      <FaExclamationTriangle className="icon-small" />
                      {formulario.motivo_rechazo}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card full-width">
          <div className="card-header">
            <h2 className="card-title">
              <FaCheckSquare className="icon" />
              Detalles de la Instalación
            </h2>
          </div>
          <div className="card-content">
            <div className="info-group">
              <div className="info-item">
                <span className="info-label">Motivo de cierre:</span>
                <p>{formulario.motivo_cierre}</p>
              </div>
              <div className="info-item">
                <span className="info-label">Observaciones:</span>
                <p>{formulario.observaciones}</p>
              </div>
              <div className="info-item">
                <span className="info-label">Checklist:</span>
                {formulario.checklist ? (
                  <ul className="checklist">
                    {formulario.checklist.split(",").map((item, index) => (
                      <li key={index}>{item.trim()}</li>
                    ))}
                  </ul>
                ) : (
                  <span>—</span>
                )}
              </div>
            </div>
          </div>
        </div>

          <div className="tabs-list">
            <button
                className={`tab-button ${activeTab === "dispositivos" ? "active" : ""}`}
              onClick={() => setActiveTab("dispositivos")}
            >
              Dispositivos
            </button>
            <button
                className={`tab-button ${activeTab === "videos" ? "active" : ""}`}
              onClick={() => setActiveTab("videos")}
            >
              Videos
            </button>
            <button
                className={`tab-button ${activeTab === "archivos" ? "active" : ""}`}
              onClick={() => setActiveTab("archivos")}
            >
                Mapa
            </button>
            <button
                className={`tab-button ${activeTab === "historial" ? "active" : ""}`}
              onClick={() => setActiveTab("historial")}
            >
              Historial
            </button>
            {/* <button
                className={`tab-button ${activeTab === "estadisticas" ? "active" : ""}`}
              onClick={() => setActiveTab("estadisticas")}
            >
              Estadísticas
            </button> */}
          </div>

              <div className="card">
              <div className="card-content">
                {activeTab === "dispositivos" && (
                  <>
                <div className="card-header">
                  <h2 className="card-title">Dispositivos Instalados</h2>
                  <p className="card-description">
                    Lista de equipos instalados en el domicilio del cliente
                  </p>
                </div>
                <div className="card-content">
                  <table className="table">
                    <thead>
                      <tr>
                        {/* <th>ID</th> */}
                        <th>Tipo</th>
                        <th>MAC</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formulario.dispositivos?.length > 0 ? (
                        formulario.dispositivos.map((d) => (
                          <tr key={d.id_dispositivo}>
                            {/* <td>{d.id_dispositivo}</td> */}
                            <td className="with-icon">
                              {getDeviceIcon(d.tipo)}
                              {d.tipo}
                            </td>
                            <td className="monospace">{d.mac}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3}>No hay dispositivos aún</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                  </>
            )}

            {activeTab === "videos" && (
                  <>
                <div className="card-header">
                  <h2 className="card-title">Videos de la Instalación</h2>
                  <p className="card-description">
                    Videos capturados durante la visita técnica
                  </p>
                </div>
                <div className="card-content">
                  <div className="videos-grid">
                    {formulario.url_video_interior && (
                      <div className="video-container">
                        <h3 className="video-title">Video Interior</h3>
                        <video
                          controls
                          className="video"
                          src={formulario.url_video_interior}
                        >
                          Tu navegador no soporta el elemento de video.
                        </video>
                      </div>
                    )}

                    {formulario.url_video_exterior && (
                      <div className="video-container">
                        <h3 className="video-title">Video Exterior</h3>
                        <video
                          controls
                          className="video"
                          src={formulario.url_video_exterior}
                        >
                          Tu navegador no soporta el elemento de video.
                        </video>
                      </div>
                    )}

                    {formulario.url_video_extra && (
                      <div className="video-container">
                        <h3 className="video-title">Video Adicional</h3>
                        <video
                          controls
                          className="video"
                          src={formulario.url_video_extra}
                        >
                          Tu navegador no soporta el elemento de video.
                        </video>
                      </div>
                    )}

                    {!formulario.url_video_interior &&
                      !formulario.url_video_exterior &&
                      !formulario.url_video_extra && (
                        <p className="no-content">No hay videos disponibles</p>
                      )}
                  </div>
                </div>
                  </>
            )}

            {activeTab === "archivos" && (
                  <>
                <div className="card-header">
                  <h2 className="card-title">Mapa de Ubicación</h2>
                  <p className="card-description">
                    Ubicación geográfica del domicilio del cliente
                  </p>
                </div>
                <div className="card-content">
                  <div id="map-container" className="map-container"></div>
                  {formulario.url_archivo && (
                    <div className="file-container">
                      <h3 className="file-title">Archivos Adjuntos</h3>
                      <a
                        href={formulario.url_archivo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="file-link"
                      >
                        <FaFileAlt className="icon-small" />
                        Ver archivo adjunto
                      </a>
                    </div>
                  )}
                </div>
                  </>
            )}

            {activeTab === "historial" && (
                  <>
                <div className="card-header">
                  <h2 className="card-title">
                    <FaHistory className="icon" />
                    Historial de Modificaciones
                  </h2>
                  <p className="card-description">
                    Registro cronológico de cambios realizados al formulario
                  </p>
                </div>
                <div className="card-content">
                      <HistorialFormulario formularioId={id} />
                          </div>
                  </>
            )}

            {activeTab === "estadisticas" && (
                  <>
                <div className="card-header">
                  <h2 className="card-title">
                    <FaChartBar className="icon" />
                    Estadísticas de Cambios
                  </h2>
                  <p className="card-description">
                    Análisis de las modificaciones realizadas al formulario
                  </p>
                </div>
                <div className="card-content">
                      <LoadingState
                        isLoading={historialLoading}
                        error={historialError}
                        loadingMessage="Cargando estadísticas..."
                      >
                        <EstadisticasFormulario estadisticas={estadisticas} />
                      </LoadingState>
                  </div>
                  </>
            )}
          </div>
        </div>
        {usuario?.rol === "admin" &&
          ["En revision", "Visto sin validar"].includes(formulario.estado) && (
            <div className="action-buttons">
              <button onClick={handleAprobar} className="btn btn-success">
                Aprobar formulario
              </button>
              <button onClick={handleVisto} className="btn btn-warning">
                Visto sin validar
              </button>
              <button onClick={handleRechazar} className="btn btn-danger">
                Rechazar
              </button>
            </div>
          )}

        {showRechazarInput && (
          <div className="rechazo-container">
            <h3 className="rechazo-titulo">Formulario de Rechazo</h3>

            <div className="rechazo-campo">
              <label htmlFor="categoria-rechazo" className="rechazo-label">
                Categoría de rechazo:
              </label>
              <select
                id="categoria-rechazo"
                className={`rechazo-select ${
                  errores.categoria ? "input-error" : ""
                }`}
                value={rechazoData.categoria}
                onChange={(e) =>
                  setRechazoData({ ...rechazoData, categoria: e.target.value })
                }
              >
                <option value="">Seleccione una categoría</option>
                <option value="Problema técnico">Problema técnico</option>
                <option value="Documentación incompleta">
                  Documentación incompleta
                </option>
                <option value="Cliente ausente">Cliente ausente</option>
                <option value="Instalación imposible">
                  Instalación imposible
                </option>
                <option value="Otro">Otro</option>
              </select>
              {errores.categoria && (
                <p className="mensaje-error">{errores.categoria}</p>
              )}
            </div>

            <div className="rechazo-campo">
              <label htmlFor="motivo-rechazo" className="rechazo-label">
                Motivo de rechazo:
              </label>
              <textarea
                id="motivo-rechazo"
                className={`rechazo-input ${
                  errores.motivo ? "input-error" : ""
                }`}
                value={rechazoData.motivo}
                onChange={(e) =>
                  setRechazoData({ ...rechazoData, motivo: e.target.value })
                }
                placeholder="Describa brevemente el motivo del rechazo (mínimo 5 caracteres)"
                rows={2}
              ></textarea>
              {errores.motivo && (
                <p className="mensaje-error">{errores.motivo}</p>
              )}
              <div className="contador-caracteres">
                {rechazoData.motivo.length} / 5 caracteres mínimos
              </div>
            </div>

            <div className="rechazo-campo checkbox-container">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rechazoData.confirmado}
                  onChange={(e) =>
                    setRechazoData({
                      ...rechazoData,
                      confirmado: e.target.checked,
                    })
                  }
                />
                <span>
                  Confirmo que he revisado toda la información y estoy seguro de
                  rechazar este formulario
                </span>
              </label>
              {errores.general && (
                <p className="mensaje-error">{errores.general}</p>
              )}
            </div>

            <div className="rechazo-botones">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowRechazarInput(false);
                  setRechazoData({
                    motivo: "",
                    categoria: "",
                    detalles: "",
                    confirmado: false,
                  });
                }}
              >
                Cancelar
              </button>
              <button className="btn btn-danger" onClick={handleRechazar}>
                Confirmar rechazo
              </button>
            </div>
          </div>
        )}

            {showEditModal && (
              <EditarFormularioModal
                formulario={formulario}
                onClose={() => setShowEditModal(false)}
                onUpdate={handleUpdate}
              />
            )}
      </div>
        )}
      </LoadingState>
    </Layout>
  );
}

// Función auxiliar para obtener el color según el estado
function getEstadoColor(estado) {
  switch (estado.toLowerCase()) {
    case "pendiente":
      return "#6b7280"; // Gris
    case "en revisión":
      return "#3b82f6"; // Azul
    case "aprobado":
      return "#10b981"; // Verde
    case "rechazado":
      return "#ef4444"; // Rojo
    case "visto":
      return "#f59e0b"; // Amarillo
    default:
      return "#6b7280"; // Gris por defecto
  }
}
