// src/components/layout/Sidebar.jsx
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiHome, FiFileText, FiUsers } from "react-icons/fi";

export default function Sidebar({ children }) {
  const navigate = useNavigate();
  const { slug } = useParams();
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">Magoo Solutions</div>
      <nav>
        <ul>
          <li onClick={() => navigate(`/${slug}/admin/dashboard`)}>
            <FiHome size={18} style={{ marginRight: 8 }} />
            Inicio
          </li>
          <li onClick={() => navigate(`/${slug}/admin/tecnicos`)}>
            <FiUsers size={18} style={{ marginRight: 8 }} />
            Técnicos
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        {children}
      </div>
    </aside>
  );
}
