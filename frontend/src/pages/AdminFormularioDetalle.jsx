// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
} from "react-icons/fa";
import L from "leaflet"; // Import Leaflet

// react-toastify
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-datepicker/dist/react-datepicker.css";

import "../styles/table.css";
import "../styles/formularios.css";

export default function AdminFormularioDetalle() {
  const navigate = useNavigate();
  const { logout, usuario } = useAuth();

  // Estado local
  const { id } = useParams();
  const [formulario, setFormulario] = useState(null);
  const [tecnico, setTecnico] = useState(null);
  const [notifications, setNotifications] = useState(() => {
    const stored = localStorage.getItem("notifications");
    return stored ? JSON.parse(stored) : [];
  });

  // Carga inicial del formulario
  const fetchForm = async () => {
    try {
      const res = await axios.get(`/formularios/${id}`, {
        withCredentials: true,
      });
      setFormulario(res.data);
      if (res.data.tecnico_id) {
        const tecnicoRes = await axios.get(`/tecnico/${res.data.tecnico_id}`, {
          withCredentials: true,
        });
        setTecnico(tecnicoRes.data);
      }
    } catch (e) {
      console.error("No pude cargar el formulario", e);
    }
  };

  useEffect(() => {
    fetchForm();
  }, [id]);

  // 3) SSE: además de avisar, recargamos formulario
  useEffect(() => {
    if (usuario?.rol !== "admin") return;

    const base = import.meta.env.VITE_BACKEND || "http://localhost:3000";
    // Asegúrate de apuntar bien al endpoint de SSE en producción:
    const evtSource = new EventSource(`${base}/formularios/events`, {
      withCredentials: true,
    });

    evtSource.addEventListener("formulario-actualizado", (e) => {
      const { id, nro_orden, nuevoEstado } = JSON.parse(e.data);

      // 1) Actualizar tu listado local de formulario
      setFormulario(prev =>
        prev && prev.id_formulario === id
          ? { ...prev, estado: nuevoEstado }
          : prev
      )

      // 2) Agregar la notificación al panel
      const nuevaNotif = {
        id: Date.now(),
        id_formulario: id,
        mensaje: `Formulario N° ${nro_orden} → ${nuevoEstado}`,
        fecha: new Date().toISOString(),
        leido: false,
      };
      setNotifications((prev) => [nuevaNotif, ...prev]);

      // 3) Mostrar toast con botón “Ver detalles”
      toast.info(
        ({ closeToast }) => (
          <div style={{ lineHeight: 1.4 }}>
            📋 <strong>Formulario N° {nro_orden}</strong>
            <br />
            Estado: <strong>{nuevoEstado}</strong>
            <br />
            <button
              onClick={() => {
                closeToast();
                navigate(`/admin/formulario/${id}`);
              }}
              style={{
                marginTop: 8,
                background: "#1976d2",
                color: "white",
                border: "none",
                padding: "6px 12px",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              Ver detalles
            </button>
          </div>
        ),
        {
          position: "top-right",
          autoClose: 8000,
          closeOnClick: false,
          pauseOnHover: true,
        }
      );
    });

    return () => {
      evtSource.close();
    };
  }, [usuario, navigate]);

  // Persiste notifs en localStorage
  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  // Resto del v0

  // Estado para el historial de cambios
  const [historial, setHistorial] = useState([
    {
      id: 1,
      fecha: new Date("2025-05-05T13:28:55.239Z"),
      usuario: "Sistema",
      accion: "Creación",
      detalles: "Formulario creado por el técnico",
      estadoNuevo: "Pendiente",
    },
    {
      id: 2,
      fecha: new Date("2025-05-05T14:15:22.000Z"),
      usuario: "Juan Pérez",
      accion: "Revisión",
      detalles: "Primera revisión del formulario",
      estadoAnterior: "Pendiente",
      estadoNuevo: "En revisión",
    },
    {
      id: 3,
      fecha: new Date("2025-05-05T18:45:10.000Z"),
      usuario: "Ana Gómez",
      accion: "Edición",
      detalles: "Actualización de datos del cliente",
      campos: [
        {
          campo: "telefono",
          valorAnterior: "1145678901",
          valorNuevo: "1157672755",
        },
      ],
    },
    {
      id: 4,
      fecha: new Date("2025-05-06T01:38:13.984Z"),
      usuario: "María López",
      accion: "Rechazo",
      detalles: "Rechazo por motivo: Test",
      estadoAnterior: "En revisión",
      estadoNuevo: "Rechazado",
    },
    {
      id: 5,
      fecha: new Date("2025-05-06T09:12:33.000Z"),
      usuario: "Carlos Rodríguez",
      accion: "Visto",
      detalles: "Formulario revisado sin validar",
      estadoAnterior: "Rechazado",
      estadoNuevo: "Visto",
    },
    {
      id: 6,
      fecha: new Date("2025-05-07T11:05:22.000Z"),
      usuario: "Eduardo Martínez",
      accion: "Edición",
      detalles: "Actualización de observaciones",
      campos: [
        {
          campo: "observaciones",
          valorAnterior: "Pendiente de revisión",
          valorNuevo: "Correccion",
        },
      ],
    },
    {
      id: 7,
      fecha: new Date("2025-05-08T14:30:45.000Z"),
      usuario: "María López",
      accion: "Rechazo",
      detalles: "Rechazo por documentación incompleta",
      estadoAnterior: "Visto",
      estadoNuevo: "Rechazado",
    },
  ]);

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

  if (!formulario) {
    return <div>Cargando…</div>;
  }

  if (!tecnico) {
    return <div>Cargando…</div>;
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
      toast.info("🔄 Marcado como visto");
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
  const estadisticas = calcularEstadisticas();

  return (
    <Layout
      userName={usuario?.nombre}
      userEmail={usuario?.email}
      notifications={notifications}
      setNotifications={setNotifications}
      onNew={() => navigate("/admin/formulario/nuevo")}
      onViewTechs={() => navigate("/admin/tecnicos")}
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
      {/* CONTENIDO */}
      <div className="container">
        <div className="header">
          <div>
            <h1 className="title">📋 Orden N° {formulario.nro_orden}</h1>
            <p className="subtitle">
              Nombre Técnico: {tecnico.nombre} | Técnico ID:{" "}
              {formulario.tecnico_id}
            </p>
          </div>
          <div className={`badge badge-${formulario.estado.toLowerCase()}`}>
            {formulario.estado}
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
                  <p>{formulario.servicios_instalar}</p>
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
                  <p>—</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="tabs">
          <div className="tabs-list">
            <button
              className={`tab ${activeTab === "dispositivos" ? "active" : ""}`}
              onClick={() => setActiveTab("dispositivos")}
            >
              Dispositivos
            </button>
            <button
              className={`tab ${activeTab === "videos" ? "active" : ""}`}
              onClick={() => setActiveTab("videos")}
            >
              Videos
            </button>
            <button
              className={`tab ${activeTab === "archivos" ? "active" : ""}`}
              onClick={() => setActiveTab("archivos")}
            >
              Archivos y Mapa
            </button>
        {/*     <button
              className={`tab ${activeTab === "historial" ? "active" : ""}`}
              onClick={() => setActiveTab("historial")}
            >
              Historial
            </button>
            <button
              className={`tab ${activeTab === "estadisticas" ? "active" : ""}`}
              onClick={() => setActiveTab("estadisticas")}
            >
              Estadísticas
            </button> */}
          </div>

          <div className="tab-content">
            {activeTab === "dispositivos" && (
              <div className="card">
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
              </div>
            )}

            {activeTab === "videos" && (
              <div className="card">
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
              </div>
            )}

            {activeTab === "archivos" && (
              <div className="card">
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
              </div>
            )}

            {activeTab === "historial" && (
              <div className="card">
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
                  <div className="historial-container">
                    <div className="historial-timeline">
                      {historial.map((item) => (
                        <div key={item.id} className="historial-item">
                          <div
                            className={`historial-icono ${getAccionClass(
                              item.accion
                            )}`}
                          >
                            {getAccionIcon(item.accion)}
                          </div>
                          <div className="historial-contenido">
                            <div className="historial-encabezado">
                              <h3 className="historial-accion">
                                {item.accion}
                              </h3>
                              <span className="historial-fecha">
                                <FaClock className="icon-tiny" />
                                {formatDate(item.fecha)}
                              </span>
                            </div>
                            <p className="historial-usuario">
                              Por: {item.usuario}
                            </p>
                            <p className="historial-detalles">
                              {item.detalles}
                            </p>

                            {item.estadoAnterior && item.estadoNuevo && (
                              <div className="historial-cambio-estado">
                                <span
                                  className={`historial-estado estado-${item.estadoAnterior.toLowerCase()}`}
                                >
                                  {item.estadoAnterior}
                                </span>
                                <span className="historial-flecha">→</span>
                                <span
                                  className={`historial-estado estado-${item.estadoNuevo.toLowerCase()}`}
                                >
                                  {item.estadoNuevo}
                                </span>
                              </div>
                            )}

                            {item.campos && item.campos.length > 0 && (
                              <div className="historial-campos">
                                <h4 className="historial-campos-titulo">
                                  Campos modificados:
                                </h4>
                                <ul className="historial-campos-lista">
                                  {item.campos.map((campo, index) => (
                                    <li
                                      key={index}
                                      className="historial-campo-item"
                                    >
                                      <span className="historial-campo-nombre">
                                        {campo.campo}:
                                      </span>
                                      <div className="historial-campo-valores">
                                        <span className="historial-campo-anterior">
                                          {campo.valorAnterior}
                                        </span>
                                        <span className="historial-campo-flecha">
                                          →
                                        </span>
                                        <span className="historial-campo-nuevo">
                                          {campo.valorNuevo}
                                        </span>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "estadisticas" && (
              <div className="card">
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
                  <div className="estadisticas-tabs">
                    <button
                      className={`estadisticas-tab ${
                        estadisticasTab === "general" ? "active" : ""
                      }`}
                      onClick={() => setEstadisticasTab("general")}
                    >
                      General
                    </button>
                    <button
                      className={`estadisticas-tab ${
                        estadisticasTab === "acciones" ? "active" : ""
                      }`}
                      onClick={() => setEstadisticasTab("acciones")}
                    >
                      Acciones
                    </button>
                    <button
                      className={`estadisticas-tab ${
                        estadisticasTab === "usuarios" ? "active" : ""
                      }`}
                      onClick={() => setEstadisticasTab("usuarios")}
                    >
                      Usuarios
                    </button>
                    <button
                      className={`estadisticas-tab ${
                        estadisticasTab === "tiempo" ? "active" : ""
                      }`}
                      onClick={() => setEstadisticasTab("tiempo")}
                    >
                      Tiempo
                    </button>
                  </div>

                  {estadisticasTab === "general" && (
                    <div className="estadisticas-contenido">
                      <div className="estadisticas-resumen">
                        <div className="estadisticas-card">
                          <div className="estadisticas-card-header">
                            <FaHistory className="icon" />
                            <h3>Total de cambios</h3>
                          </div>
                          <div className="estadisticas-card-valor">
                            {estadisticas.totalCambios}
                          </div>
                        </div>

                        <div className="estadisticas-card">
                          <div className="estadisticas-card-header">
                            <FaClock className="icon" />
                            <h3>Tiempo promedio entre cambios</h3>
                          </div>
                          <div className="estadisticas-card-valor">
                            {estadisticas.tiempoPromedio.horas}h{" "}
                            {estadisticas.tiempoPromedio.minutos}m
                          </div>
                        </div>

                        <div className="estadisticas-card">
                          <div className="estadisticas-card-header">
                            <FaCalendar className="icon" />
                            <h3>Primer cambio</h3>
                          </div>
                          <div className="estadisticas-card-valor">
                            {formatDate(estadisticas.primerCambio.fecha)}
                          </div>
                        </div>

                        <div className="estadisticas-card">
                          <div className="estadisticas-card-header">
                            <FaCalendar className="icon" />
                            <h3>Último cambio</h3>
                          </div>
                          <div className="estadisticas-card-valor">
                            {formatDate(estadisticas.ultimoCambio.fecha)}
                          </div>
                        </div>
                      </div>

                      <div className="estadisticas-distribucion">
                        <h3 className="estadisticas-titulo">
                          Distribución de cambios por tipo
                        </h3>
                        <div className="grafico-barras">
                          {Object.entries(estadisticas.accionesPorTipo).map(
                            ([accion, cantidad], index) => (
                              <div
                                key={index}
                                className="grafico-barra-container"
                              >
                                <div className="grafico-barra-etiqueta">
                                  {accion}
                                </div>
                                <div className="grafico-barra-wrapper">
                                  <div
                                    className="grafico-barra"
                                    style={{
                                      width: `${calcularPorcentaje(
                                        cantidad,
                                        getMaxValue(
                                          estadisticas.accionesPorTipo
                                        )
                                      )}%`,
                                      backgroundColor: getAccionColor(accion),
                                    }}
                                  ></div>
                                  <span className="grafico-barra-valor">
                                    {cantidad}
                                  </span>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      <div className="estadisticas-distribucion">
                        <h3 className="estadisticas-titulo">
                          Distribución de cambios por estado
                        </h3>
                        <div className="grafico-donut-container">
                          <div className="grafico-donut">
                            {Object.entries(estadisticas.accionesPorEstado).map(
                              ([estado, cantidad], index, array) => {
                                // Calcular el porcentaje y el ángulo para cada segmento
                                const total = array.reduce(
                                  (sum, [_, val]) => sum + val,
                                  0
                                );
                                const porcentaje = calcularPorcentaje(
                                  cantidad,
                                  total
                                );
                                const startAngle = array
                                  .slice(0, index)
                                  .reduce(
                                    (sum, [_, val]) =>
                                      sum +
                                      calcularPorcentaje(val, total) * 3.6,
                                    0
                                  );
                                const endAngle = startAngle + porcentaje * 3.6;

                                // Crear el estilo para el segmento del donut
                                const segmentStyle = {
                                  "--start-angle": `${startAngle}deg`,
                                  "--end-angle": `${endAngle}deg`,
                                  "--color": getEstadoColor(estado),
                                };

                                return (
                                  <div
                                    key={index}
                                    className="grafico-donut-segmento"
                                    style={segmentStyle}
                                  >
                                    <span className="grafico-donut-tooltip">
                                      {estado}: {cantidad} (
                                      {Math.round(porcentaje)}%)
                                    </span>
                                  </div>
                                );
                              }
                            )}
                            <div className="grafico-donut-centro">
                              <span>
                                {Object.values(
                                  estadisticas.accionesPorEstado
                                ).reduce((a, b) => a + b, 0)}
                              </span>
                              <span className="grafico-donut-subtitulo">
                                cambios de estado
                              </span>
                            </div>
                          </div>
                          <div className="grafico-leyenda">
                            {Object.entries(estadisticas.accionesPorEstado).map(
                              ([estado, cantidad], index) => (
                                <div
                                  key={index}
                                  className="grafico-leyenda-item"
                                >
                                  <span
                                    className="grafico-leyenda-color"
                                    style={{
                                      backgroundColor: getEstadoColor(estado),
                                    }}
                                  ></span>
                                  <span className="grafico-leyenda-texto">
                                    {estado}: {cantidad}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {estadisticasTab === "acciones" && (
                    <div className="estadisticas-contenido">
                      <div className="estadisticas-distribucion">
                        <h3 className="estadisticas-titulo">
                          Distribución de acciones por tipo
                        </h3>
                        <div className="grafico-barras">
                          {Object.entries(estadisticas.accionesPorTipo).map(
                            ([accion, cantidad], index) => (
                              <div
                                key={index}
                                className="grafico-barra-container"
                              >
                                <div className="grafico-barra-etiqueta">
                                  {accion}
                                </div>
                                <div className="grafico-barra-wrapper">
                                  <div
                                    className="grafico-barra"
                                    style={{
                                      width: `${calcularPorcentaje(
                                        cantidad,
                                        getMaxValue(
                                          estadisticas.accionesPorTipo
                                        )
                                      )}%`,
                                      backgroundColor: getAccionColor(accion),
                                    }}
                                  ></div>
                                  <span className="grafico-barra-valor">
                                    {cantidad}
                                  </span>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      <div className="estadisticas-distribucion">
                        <h3 className="estadisticas-titulo">
                          Campos más modificados
                        </h3>
                        {Object.keys(estadisticas.camposMasModificados).length >
                        0 ? (
                          <div className="grafico-barras">
                            {Object.entries(
                              estadisticas.camposMasModificados
                            ).map(([campo, cantidad], index) => (
                              <div
                                key={index}
                                className="grafico-barra-container"
                              >
                                <div className="grafico-barra-etiqueta">
                                  {campo}
                                </div>
                                <div className="grafico-barra-wrapper">
                                  <div
                                    className="grafico-barra"
                                    style={{
                                      width: `${calcularPorcentaje(
                                        cantidad,
                                        getMaxValue(
                                          estadisticas.camposMasModificados
                                        )
                                      )}%`,
                                      backgroundColor: "#8b5cf6",
                                    }}
                                  ></div>
                                  <span className="grafico-barra-valor">
                                    {cantidad}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="estadisticas-no-data">
                            No hay datos de campos modificados
                          </p>
                        )}
                      </div>

                      <div className="estadisticas-tabla">
                        <h3 className="estadisticas-titulo">
                          Últimas acciones realizadas
                        </h3>
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Fecha</th>
                              <th>Acción</th>
                              <th>Usuario</th>
                              <th>Detalles</th>
                            </tr>
                          </thead>
                          <tbody>
                            {historial
                              .slice()
                              .reverse()
                              .slice(0, 5)
                              .map((item) => (
                                <tr key={item.id}>
                                  <td>{formatDate(item.fecha)}</td>
                                  <td>
                                    <span
                                      className="accion-badge"
                                      style={{
                                        backgroundColor: getAccionColor(
                                          item.accion
                                        ),
                                      }}
                                    >
                                      {item.accion}
                                    </span>
                                  </td>
                                  <td>{item.usuario}</td>
                                  <td>{item.detalles}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {estadisticasTab === "usuarios" && (
                    <div className="estadisticas-contenido">
                      <div className="estadisticas-distribucion">
                        <h3 className="estadisticas-titulo">
                          Distribución de cambios por usuario
                        </h3>
                        <div className="grafico-barras">
                          {Object.entries(estadisticas.accionesPorUsuario).map(
                            ([usuario, cantidad], index) => (
                              <div
                                key={index}
                                className="grafico-barra-container"
                              >
                                <div className="grafico-barra-etiqueta">
                                  {usuario}
                                </div>
                                <div className="grafico-barra-wrapper">
                                  <div
                                    className="grafico-barra"
                                    style={{
                                      width: `${calcularPorcentaje(
                                        cantidad,
                                        getMaxValue(
                                          estadisticas.accionesPorUsuario
                                        )
                                      )}%`,
                                      backgroundColor: "#3b82f6",
                                    }}
                                  ></div>
                                  <span className="grafico-barra-valor">
                                    {cantidad}
                                  </span>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      <div className="estadisticas-tabla">
                        <h3 className="estadisticas-titulo">
                          Actividad por usuario
                        </h3>
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Usuario</th>
                              <th>Total de acciones</th>
                              <th>Última acción</th>
                              <th>Tipo de acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(
                              estadisticas.accionesPorUsuario
                            ).map(([usuario, cantidad], index) => {
                              // Encontrar la última acción del usuario
                              const ultimaAccion = [...historial]
                                .reverse()
                                .find((item) => item.usuario === usuario);

                              // Contar tipos de acciones por usuario
                              const accionesPorTipo = historial
                                .filter((item) => item.usuario === usuario)
                                .reduce((acc, item) => {
                                  acc[item.accion] =
                                    (acc[item.accion] || 0) + 1;
                                  return acc;
                                }, {});

                              return (
                                <tr key={index}>
                                  <td>{usuario}</td>
                                  <td>{cantidad}</td>
                                  <td>
                                    {ultimaAccion
                                      ? formatDate(ultimaAccion.fecha)
                                      : "N/A"}
                                  </td>
                                  <td>
                                    <div className="acciones-tipo-lista">
                                      {Object.entries(accionesPorTipo).map(
                                        ([accion, cant], i) => (
                                          <span
                                            key={i}
                                            className="accion-badge"
                                            style={{
                                              backgroundColor:
                                                getAccionColor(accion),
                                            }}
                                          >
                                            {accion}: {cant}
                                          </span>
                                        )
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {estadisticasTab === "tiempo" && (
                    <div className="estadisticas-contenido">
                      <div className="estadisticas-distribucion">
                        <h3 className="estadisticas-titulo">
                          Distribución de cambios por día
                        </h3>
                        <div className="grafico-barras">
                          {Object.entries(estadisticas.accionesPorDia).map(
                            ([dia, cantidad], index) => (
                              <div
                                key={index}
                                className="grafico-barra-container"
                              >
                                <div className="grafico-barra-etiqueta">
                                  {dia}
                                </div>
                                <div className="grafico-barra-wrapper">
                                  <div
                                    className="grafico-barra"
                                    style={{
                                      width: `${calcularPorcentaje(
                                        cantidad,
                                        getMaxValue(estadisticas.accionesPorDia)
                                      )}%`,
                                      backgroundColor: "#10b981",
                                    }}
                                  ></div>
                                  <span className="grafico-barra-valor">
                                    {cantidad}
                                  </span>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      <div className="estadisticas-timeline">
                        <h3 className="estadisticas-titulo">
                          Línea de tiempo de cambios
                        </h3>
                        <div className="timeline-container">
                          <div className="timeline-line"></div>
                          {historial.map((item, index) => {
                            // Calcular la posición relativa en la línea de tiempo
                            const primerFecha = new Date(
                              historial[0].fecha
                            ).getTime();
                            const ultimaFecha = new Date(
                              historial[historial.length - 1].fecha
                            ).getTime();
                            const itemFecha = new Date(item.fecha).getTime();
                            const posicion =
                              ((itemFecha - primerFecha) /
                                (ultimaFecha - primerFecha)) *
                              100;

                            return (
                              <div
                                key={index}
                                className="timeline-punto"
                                style={{
                                  left: `${posicion}%`,
                                  backgroundColor: getAccionColor(item.accion),
                                }}
                                title={`${item.accion} - ${formatDate(
                                  item.fecha
                                )}`}
                              >
                                <div className="timeline-tooltip">
                                  <strong>{item.accion}</strong>
                                  <br />
                                  {formatDate(item.fecha)}
                                  <br />
                                  Por: {item.usuario}
                                </div>
                              </div>
                            );
                          })}
                          <div className="timeline-fechas">
                            <span>{formatDate(historial[0].fecha)}</span>
                            <span>
                              {formatDate(
                                historial[historial.length - 1].fecha
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="estadisticas-cards-container">
                        <div className="estadisticas-card">
                          <div className="estadisticas-card-header">
                            <FaClock className="icon" />
                            <h3>Tiempo promedio entre cambios</h3>
                          </div>
                          <div className="estadisticas-card-valor">
                            {estadisticas.tiempoPromedio.horas}h{" "}
                            {estadisticas.tiempoPromedio.minutos}m
                          </div>
                        </div>

                        <div className="estadisticas-card">
                          <div className="estadisticas-card-header">
                            <FaCalendar className="icon" />
                            <h3>Duración total del proceso</h3>
                          </div>
                          <div className="estadisticas-card-valor">
                            {Math.floor(
                              (new Date(
                                historial[historial.length - 1].fecha
                              ).getTime() -
                                new Date(historial[0].fecha).getTime()) /
                                (1000 * 60 * 60 * 24)
                            )}{" "}
                            días
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        {usuario?.rol === "admin" &&
          !["Aprobado", "Rechazado"].includes(formulario.estado) && (
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

            {/* <div className="rechazo-campo">
              <label htmlFor="detalles-rechazo" className="rechazo-label">
                Detalles adicionales:
              </label>
              <textarea
                id="detalles-rechazo"
                className={`rechazo-input ${
                  errores.detalles ? "input-error" : ""
                }`}
                value={rechazoData.detalles}
                onChange={(e) =>
                  setRechazoData({ ...rechazoData, detalles: e.target.value })
                }
                placeholder="Proporcione detalles específicos sobre el problema (mínimo 20 caracteres)"
                rows={3}
              ></textarea>
              {errores.detalles && (
                <p className="mensaje-error">{errores.detalles}</p>
              )}
              <div className="contador-caracteres">
                {rechazoData.detalles.length} / 20 caracteres mínimos
              </div>
            </div> */}

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
      </div>
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
