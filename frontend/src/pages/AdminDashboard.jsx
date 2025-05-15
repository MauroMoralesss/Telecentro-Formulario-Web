// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axios.js";
import Layout from "../components/layout/Layout.jsx";
import DataTable from "../components/ui/DataTable.jsx";
import { columns } from "../components/ui/columns.jsx";
import { isSameDay, addDays, subDays, format } from "date-fns";
import DatePicker from "react-datepicker";
import es from "date-fns/locale/es";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

// react-toastify
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-datepicker/dist/react-datepicker.css";

import "../styles/global.css";
import "../styles/dashboard.css";
import "../styles/table.css";
import "../styles/modal.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout, usuario } = useAuth();

  // Estado local
  const [formularios, setFormularios] = useState([]);
  const [activeTab, setActiveTab] = useState("Todos");
  const [search, setSearch] = useState("");
  const [notifications, setNotifications] = useState(() => {
    const stored = localStorage.getItem("notifications");
    return stored ? JSON.parse(stored) : [];
  });

  const estados = [
    "Todos",
    "Iniciado",
    "En revisión",
    "Aprobado",
    "Visto sin validar",
    "Rechazado",
  ];

  const [selectedDate, setSelectedDate] = useState(new Date());

  // Carga inicial de datos
  useEffect(() => {
    axios
      .get("/formularios", { withCredentials: true })
      .then((r) => setFormularios(r.data))
      .catch(console.error);
  }, []);

  // SSE para recibir actualizaciones en tiempo real
  useEffect(() => {
    const base = import.meta.env.VITE_BACKEND || "http://localhost:3000";
    const evtSource = new EventSource(`${base}/formularios/events`, {
      withCredentials: true,
    });

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
  }, []);

  // Persiste notifs en localStorage
  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  // Filtrado por pestaña y búsqueda
  let filtrados = formularios.filter(
    (f) => activeTab === "Todos" || f.estado === activeTab
  );

  if (search.trim() !== "") {
    filtrados = filtrados.filter((f) =>
      Object.values(f).some((v) =>
        String(v).toLowerCase().includes(search.toLowerCase())
      )
    );
  } else {
    filtrados = filtrados.filter((f) => {
      const fechaForm = new Date(f.fecha_creacion);
      return isSameDay(fechaForm, selectedDate);
    });
  }

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

      <div className="date-navigator">
        <button
          className="boton-flecha-fecha"
          onClick={() => setSelectedDate((d) => subDays(d, 1))}
        >
          <FiChevronLeft />
        </button>
        <span style={{ minWidth: 200, textAlign: "center", fontWeight: 500 }}>
          {format(selectedDate, "EEEE dd 'de' MMMM yyyy", { locale: es })}
        </span>
        <button
          className="boton-flecha-fecha"
          onClick={() => setSelectedDate((d) => addDays(d, 1))}
        >
          <FiChevronRight />
        </button>

        {/* Reemplazo del input nativo con React-DatePicker */}
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="dd/MM/yyyy" // Formato de cómo se muestra la fecha en el input
          locale={es} // Para que el calendario popup esté en español
          className="tu-clase-css-para-el-input-datepicker" // Clase CSS opcional para el input
          // Puedes añadir un customInput si quieres un control total sobre el input
          // customInput={<CustomInput />}
        />
      </div>

      {/* Tabla de resultados */}
      <div className="table-section">
        {/* Pestañas de estado */}
        <div className="tabbs">
          {estados.map((est) => (
            <button
              key={est}
              className={`tabb ${activeTab === est ? "active" : ""}`}
              onClick={() => setActiveTab(est)}
            >
              {est}
            </button>
          ))}
        </div>

        {/* Buscador global */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar en todos los campos…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <DataTable columns={columns} data={filtrados} />
      </div>
    </Layout>
  );
}
