// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axios.js";
import MetricCard from "../components/MetricCard.jsx";
import DataTable from "../components/DataTable.jsx";
import { columns } from "../components/columns.jsx";
import NotificationsPanel from "../components/NotificationsPanel.jsx";

import { FiHome, FiFileText, FiUsers, FiPlus, FiLogOut } from "react-icons/fi";

// react-toastify
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "../styles/global.css";
import "../styles/dashboard.css";
import "../styles/table.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout, usuario } = useAuth();

  const [formularios, setFormularios] = useState([]);
  const [activeTab, setActiveTab] = useState("Todos");
  const [search, setSearch] = useState("");

  const estados = [
    "Todos",
    "Iniciado",
    "En revisión",
    "Aprobado",
    "Visto sin validar",
    "Rechazado",
  ];

  const [notifications, setNotifications] = useState(() => {
    // leer de localStorage si existe
    const stored = localStorage.getItem("notifications");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/formularios", {
          withCredentials: true,
        });
        setFormularios(res.data);
      } catch (err) {
        console.error("Error al cargar formularios:", err);
      }
    })();
  }, []);

  // —— SSE: suscripción a cambios de estado ——
  useEffect(() => {
    const base = import.meta.env.VITE_BACKEND || "http://localhost:3000";
    const evtSource = new EventSource(`${base}/api/formularios/events`);

    evtSource.addEventListener("formulario-actualizado", (e) => {
      const { id, nro_orden, nuevoEstado } = JSON.parse(e.data);

      // 1) Actualiza tu listado local
      setFormularios((prev) =>
        prev.map((f) =>
          f.id_formulario === id ? { ...f, estado: nuevoEstado } : f
        )
      );

      // 2) Prepara la notificación
      const mensaje = `Informe N° ${nro_orden} → Cambio a ${nuevoEstado}`;
      const nuevaNotif = {
        id: Date.now(),
        mensaje,
        fecha: new Date().toISOString(),
        leido: false,
      };

      // 3) Agrega la notificación a tu estado
      setNotifications((prev) => [nuevaNotif, ...prev]);

      // 4) Muestra el toast
      toast.info(mensaje, { icon: "🔔" });
    });

    return () => evtSource.close();
  }, []);

  // sincronizar con localStorage cada vez que notifications cambie
  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  // Fechas de comparación
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(now.getDate() - 14);

  // Helper para contar en rango + estado
  const countByPeriodo = (start, end, estado) =>
    formularios.filter((f) => {
      const d = new Date(f.fecha_creacion);
      return d >= start && d < end && f.estado === estado;
    }).length;

  // Métricas totales
  const total = formularios.length;
  const pendientes = formularios.filter(
    (f) => f.estado === "En revisión"
  ).length;
  const aprobados = formularios.filter((f) => f.estado === "Aprobado").length;
  const rechazados = formularios.filter((f) => f.estado === "Rechazado").length;
  const tecnicosActivos = new Set(formularios.map((f) => f.tecnico_id)).size;

  // Cálculo de trends semanales
  const makeTrend = (thisVal, lastVal) => {
    if (lastVal === 0) return "—";
    const pct = ((thisVal - lastVal) / lastVal) * 100;
    const sign = pct >= 0 ? "+" : "";
    return `${sign}${pct.toFixed(1)}% vs sem. pasada`;
  };

  const pendientesThis = countByPeriodo(weekAgo, now, "En revisión");
  const pendientesLast = countByPeriodo(twoWeeksAgo, weekAgo, "En revisión");
  const pendientesTrend = makeTrend(pendientesThis, pendientesLast);

  const aprobadosThis = countByPeriodo(weekAgo, now, "Aprobado");
  const aprobadosLast = countByPeriodo(twoWeeksAgo, weekAgo, "Aprobado");
  const aprobadosTrend = makeTrend(aprobadosThis, aprobadosLast);

  const rechazadosThis = countByPeriodo(weekAgo, now, "Rechazado");
  const rechazadosLast = countByPeriodo(twoWeeksAgo, weekAgo, "Rechazado");
  const rechazadosTrend = makeTrend(rechazadosThis, rechazadosLast);

  // Para técnicos activos: cuántos IDs distintos en cada periodo
  const techsByPeriodo = (start, end) =>
    new Set(
      formularios
        .filter((f) => {
          const d = new Date(f.fecha_creacion);
          return d >= start && d < end;
        })
        .map((f) => f.tecnico_id)
    ).size;
  const techsThis = techsByPeriodo(weekAgo, now);
  const techsLast = techsByPeriodo(twoWeeksAgo, weekAgo);
  const techsTrend = makeTrend(techsThis, techsLast);

  // Filtros y búsquedas
  const filtrados = formularios
    .filter((f) => activeTab === "Todos" || f.estado === activeTab)
    .filter((f) =>
      Object.values(f).some((v) =>
        String(v).toLowerCase().includes(search.toLowerCase())
      )
    );

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-brand">Magoo Solutions</div>
        <nav>
          <ul>
            <li className="active" onClick={() => navigate("/admin/dashboard")}>
              <FiHome size={18} style={{ marginRight: 8 }} />
              Dashboard
            </li>
            <li onClick={() => navigate("/admin/formularios")}>
              <FiFileText size={18} style={{ marginRight: 8 }} />
              Formularios
            </li>
            <li onClick={() => navigate("/admin/tecnicos")}>
              <FiUsers size={18} style={{ marginRight: 8 }} />
              Técnicos
            </li>
          </ul>
        </nav>
        <div className="sidebar-footer">
          <div className="user-avatar">{usuario?.nombre?.[0] ?? "A"}</div>
          <div>
            <div style={{ fontSize: "0.875rem", fontWeight: 500 }}>
              {usuario?.nombre || "Admin"}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#ccc" }}>
              {usuario?.email || "admin@ejemplo.com"}
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnHover
      />
      <div className="main-content">
        {/* HEADER */}
        <header className="main-header">
          <h1>Dashboard</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              className="btn-primary"
              onClick={() => navigate("/admin/formulario/nuevo")}
            >
              <FiPlus style={{ marginRight: 4 }} />
              Crear formulario
            </button>
            <button
              className="btn-outline"
              onClick={() => navigate("/admin/tecnicos")}
            >
              <FiUsers style={{ marginRight: 4 }} />
              Ver técnicos
            </button>
            <button
              className="btn-outline"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              <FiLogOut style={{ marginRight: 4 }} />
              Cerrar sesión
            </button>
            {/* aquí ponemos nuestro panel */}
            <NotificationsPanel
              notifications={notifications}
              setNotifications={setNotifications}
            />
          </div>
        </header>

        {/* MÉTRICAS */}
        <section className="metrics-cards">
          <MetricCard
            title="Total Formularios"
            value={total}
            trend={makeTrend(
              countByPeriodo(weekAgo, now), // nuevos esta semana
              countByPeriodo(twoWeeksAgo, weekAgo) // vs semana pasada
            )}
          />
          <MetricCard
            title="Pendientes"
            value={pendientes}
            trend={pendientesTrend}
          />
          <MetricCard
            title="Aprobados"
            value={aprobados}
            trend={aprobadosTrend}
          />
          <MetricCard
            title="Rechazados"
            value={rechazados}
            trend={rechazadosTrend}
          />
          <MetricCard
            title="Técnicos Activos"
            value={tecnicosActivos}
            trend={techsTrend}
          />
        </section>

        {/* TABS */}
        <div className="tabs">
          {estados.map((est) => (
            <button
              key={est}
              className={`tab ${activeTab === est ? "active" : ""}`}
              onClick={() => setActiveTab(est)}
            >
              {est}
            </button>
          ))}
        </div>

        {/* BÚSQUEDA */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar en todos los campos…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* TABLA */}
        <div className="table-section">
          <DataTable columns={columns} data={filtrados} />
        </div>
      </div>
    </div>
  );
}
