// src/components/layout/Sidebar.jsx
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiHome, FiFileText, FiUsers, FiMenu, FiX } from "react-icons/fi";

export default function Sidebar({ children }) {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [open, setOpen] = useState(false);

  // Mostrar el botón hamburguesa solo en móvil
  return (
    <>
      <button
        className="sidebar-hamburger"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
      >
        <FiMenu size={28} />
      </button>
      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}
      <aside className={`sidebar${open ? " open" : ""}`}>
        <div className="sidebar-brand">Magoo Solutions</div>
        <button
          className="sidebar-close"
          onClick={() => setOpen(false)}
          aria-label="Cerrar menú"
        >
          <FiX size={24} />
        </button>
        <nav>
          <ul>
            <li onClick={() => { setOpen(false); navigate(`/${slug}/admin/dashboard`); }}>
              <FiHome size={18} style={{ marginRight: 8 }} />
              Inicio
            </li>
            <li onClick={() => { setOpen(false); navigate(`/${slug}/admin/tecnicos`); }}>
              <FiUsers size={18} style={{ marginRight: 8 }} />
              Técnicos
            </li>
          </ul>
        </nav>
        <div className="sidebar-footer">{children}</div>
      </aside>
    </>
  );
}
