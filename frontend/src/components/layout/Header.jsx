// src/components/layout/Header.jsx
import React from "react";
import { FiPlus, FiUsers, FiLogOut } from "react-icons/fi";
import NotificationsPanel from "../ui/NotificationsPanel.jsx";

export default function Header({ onNew, onViewTechs, onLogout, notifications, setNotifications }) {
  return (
    <header className="main-header">
      <h1>Dashboard</h1>
      <div className="header-actions">
        <button onClick={onNew}><FiPlus /> Crear formulario</button>
        <button onClick={onViewTechs}><FiUsers /> Ver técnicos</button>
        <button onClick={onLogout}><FiLogOut /> Cerrar sesión</button>
        <NotificationsPanel
          notifications={notifications}
          setNotifications={setNotifications}
        />
      </div>
    </header>
  );
}
