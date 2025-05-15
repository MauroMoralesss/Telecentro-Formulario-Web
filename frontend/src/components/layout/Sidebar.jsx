// src/components/layout/Sidebar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { FiHome, FiFileText, FiUsers } from "react-icons/fi";

export default function Sidebar({ children }) {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">Magoo Solutions</div>
      <nav>
        <ul>
          <li onClick={() => navigate("/admin/dashboard")}>
            <FiHome size={18} style={{ marginRight: 8 }} />
            Dashboard
          </li>
{/*           <li onClick={() => navigate("/admin/formularios")}>
            <FiFileText size={18} style={{ marginRight: 8 }} />
            Formularios
          </li> */}
          <li onClick={() => navigate("/admin/tecnicos")}>
            <FiUsers size={18} style={{ marginRight: 8 }} />
            Técnicos
          </li>
          <li onClick={() => navigate("/dashboard")}>
            --VIEJO DISEÑO--
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        {children}
      </div>
    </aside>
  );
}
