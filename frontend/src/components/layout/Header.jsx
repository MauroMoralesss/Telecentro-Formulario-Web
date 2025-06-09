// src/components/layout/Header.jsx
import React, { useState, useEffect } from "react";
import { FiPlus, FiUsers, FiLogOut } from "react-icons/fi";
import NotificationsPanel from "../ui/NotificationsPanel.jsx";
import Modal from "./modal-component";
import FormularioModal from "./formulario-modal";
import TecnicoModal from "./tecnico-modal";
import { useParams } from "react-router-dom";

export default function Header({ onLogout, notifications, setNotifications }) {
  const { slug } = useParams();
  const [isFormularioModalOpen, setIsFormularioModalOpen] = useState(false);
  const [isTecnicoModalOpen, setIsTecnicoModalOpen] = useState(false);
  return (
    <header className="main-header">
      <h1>{slug.toUpperCase()}</h1>
      <div className="header-actions">
        <button onClick={() => setIsFormularioModalOpen(true)}>
          <FiPlus /> Crear formulario
        </button>
        <button onClick={() => setIsTecnicoModalOpen(true)}>
          <FiUsers /> Registrar tecnico
        </button>
        <button onClick={onLogout}>
          <FiLogOut /> Cerrar sesión
        </button>
        <NotificationsPanel
          notifications={notifications}
          setNotifications={setNotifications}
        />
      </div>
      {/* Modal para crear formulario */}
      <Modal
        isOpen={isFormularioModalOpen}
        onClose={() => setIsFormularioModalOpen(false)}
        title="Crear nuevo formulario"
      >
        <FormularioModal onClose={() => setIsFormularioModalOpen(false)} />
      </Modal>

      {/* Modal para crear técnico */}
      <Modal
        isOpen={isTecnicoModalOpen}
        onClose={() => setIsTecnicoModalOpen(false)}
        title="Crear nuevo técnico"
      >
        <TecnicoModal onClose={() => setIsTecnicoModalOpen(false)} />
      </Modal>
    </header>
  );
}
