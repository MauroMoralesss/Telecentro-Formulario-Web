// src/components/layout/Layout.jsx
import React from "react";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";

export default function Layout({
  onNew,
  onViewTechs,
  onLogout,
  notifications,
  setNotifications,
  userName,
  userEmail,
  children,
}) {
  return (
    <div className="dashboard-layout">
      <Sidebar>
        {/* aquí podrías mostrar avatar, nombre, email */}
        <div className="user-info">
          <div className="user-avatar">{userName?.[0] ?? "A"}</div>
          <div>
            <div>{userName}</div>
            <div>{userEmail}</div>
          </div>
        </div>
      </Sidebar>
      <div className="main-content">
        <Header
          onNew={onNew}
          onViewTechs={onViewTechs}
          onLogout={onLogout}
          notifications={notifications}
          setNotifications={setNotifications}
        />
        {children}
      </div>
    </div>
  );
}
