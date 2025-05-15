import { useState } from "react";
import axios from "../../api/axios";

function TecnicoModal({ onClose }) {
  const [nuevo, setNuevo] = useState({
    id_tecnico: null, 
    nombre: "",
    email: "",
    password: "",
    telefono: "",
    rol: "tecnico",
    activo: true,
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleCrear = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await axios.post("/signup", nuevo, { withCredentials: true });
      setSuccessMsg("Técnico creado correctamente");

      // Cerrar el modal después de 2 segundos
      setTimeout(() => {
        onClose();
        // Opcional: recargar la página para mostrar el nuevo técnico
        window.location.reload();
      }, 2000);
    } catch (error) {
      const mensaje = error.response?.data?.message || "Error del servidor";
      setErrorMsg(mensaje);
    }
  };

  return (
    <div>
      <form className="form-card" onSubmit={handleCrear}>
        <input
          type="number"
          placeholder="ID Técnico"
          value={nuevo.id_tecnico}
          onChange={(e) => setNuevo({ ...nuevo, id_tecnico: parseInt(e.target.value, 10) || 0 })}
          required
        />
        <input
          type="text"
          placeholder="Nombre"
          value={nuevo.nombre}
          onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={nuevo.email}
          onChange={(e) => setNuevo({ ...nuevo, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={nuevo.password}
          onChange={(e) => setNuevo({ ...nuevo, password: e.target.value })}
          required
        />
        <input
          type="tel"
          placeholder="Teléfono"
          value={nuevo.telefono}
          onChange={(e) => setNuevo({ ...nuevo, telefono: e.target.value })}
          required
        />

        <div className="modal-actions">
          {errorMsg && <div className="alert-error">⚠️ {errorMsg}</div>}
          {successMsg && <div className="alert-success">✅ {successMsg}</div>}
          <button type="button" className="btn" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            Crear técnico
          </button>
        </div>
      </form>
    </div>
  );
}

export default TecnicoModal;