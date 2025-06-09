// src/components/NotificationsPanel.jsx
import React, { useState } from "react";
import { FiBell, FiTrash2 } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

export default function NotificationsPanel({
  notifications,
  setNotifications,
}) {
  const [open, setOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.leido).length;
  const navigate = useNavigate();
  const { slug } = useParams();
  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, leido: true })));
  };

  const clearAll = () => {
    setNotifications([]);
    localStorage.removeItem("notifications");
  };

  return (
    <div className="notifications-wrapper">
      <button
        className="btn-icon"
        onClick={() => {
          setOpen((o) => !o);
          markAllRead();
        }}
        aria-label="Notificaciones"
      >
        <FiBell size={20} />
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notifications-dropdown">
          <div className="dropdown-header">
            <span>Notificaciones</span>
            {notifications.length > 0 && (
              <button
                className="btn-clear"
                onClick={clearAll}
                aria-label="Borrar todas las notificaciones"
              >
                <FiTrash2 size={16} />
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="notification-empty">Sin notificaciones</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`notification-item ${n.leido ? "leido" : "nuevo"}`}
              >
                <div className="notif-message">{n.mensaje}</div>
                <div className="notif-time">
                  {new Date(n.fecha).toLocaleTimeString("es-AR")}
                </div>
                <div className="dropdown-btn">
                  {n.id_formulario && (
                    <button
                      className="btn-ver-formulario"
                      onClick={() => {
                        setOpen(false);
                        navigate(`/${slug}/admin/formulario/${n.id_formulario}`);
                      }}
                    >
                      Ver detalles
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
