import { useEffect, useState } from "react";
import axios from "../api/axios";
import { Link, useNavigate } from "react-router-dom";

function TecnicosAdmin() {
  const [tecnicos, setTecnicos] = useState([]);
  const [nuevo, setNuevo] = useState({ nombre: "", email: "", password: "" });
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const cargarTecnicos = async () => {
      const res = await axios.get("/tecnicos", { withCredentials: true });
      setTecnicos(res.data.filter((t) => t.rol === "tecnico"));
    };
    cargarTecnicos();
  }, []);

  const handleCrear = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await axios.post(
        "/signup",
        {
          ...nuevo,
          id_tecnico: parseInt(nuevo.id_tecnico),
          rol: "tecnico",
        },
        { withCredentials: true }
      );

      setSuccessMsg("Técnico creado correctamente");
      // Limpia el mensaje después de 4 segundos
      setTimeout(() => {
        setSuccessMsg("");
      }, 4000);

      setTecnicos((prev) => [
        ...prev,
        {
          ...nuevo,
          id_tecnico: parseInt(nuevo.id_tecnico),
          rol: "tecnico",
          activo: true,
        },
      ]);

      setNuevo({
        id_tecnico: "",
        nombre: "",
        email: "",
        password: "",
      });
    } catch (error) {
      const mensaje = error.response?.data?.message || "Error del servidor";
      setErrorMsg(mensaje);
      // Limpia el mensaje después de 4 segundos
      setTimeout(() => {
        setErrorMsg("");
      }, 4000);
    }
  };

  const toggleEstado = async (id, estadoActual) => {
    const res = await axios.patch(
      `/tecnicos/${id}/estado`,
      { activo: !estadoActual },
      { withCredentials: true }
    );
    setTecnicos((prev) =>
      prev.map((t) => (t.id_tecnico === id ? res.data : t))
    );
  };

  return (
    <div className="admin-container card-container">
      <h2 className="admin-title">Administrar Técnicos</h2>

      <h3 className="section-title">Crear nuevo técnico</h3>

      {errorMsg && <div className="alert-error">⚠️ {errorMsg}</div>}

      {successMsg && <div className="alert-success">✅ {successMsg}</div>}

      <form className="form-card" onSubmit={handleCrear}>
        <input
          type="number"
          placeholder="ID Técnico"
          value={nuevo.id_tecnico}
          onChange={(e) => setNuevo({ ...nuevo, id_tecnico: e.target.value })}
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
        <button type="submit" className="btn btn-primary">
          Crear técnico
        </button>
      </form>

      <button onClick={() => navigate("/dashboard")} className="btn btn-back">
        ← Volver al Dashboard
      </button>

      <hr className="divider" />

      <h3 className="section-title">Lista de técnicos</h3>
      <div className="tecnicos-grid">
        {tecnicos.map((tecnico) => (
          <div key={tecnico.id_tecnico} className="tecnico-card">
            <p>
              <strong>ID:</strong> {tecnico.id_tecnico}
            </p>
            <p>
              <strong>Nombre:</strong> {tecnico.nombre}
            </p>
            <p>
              <strong>Email:</strong> {tecnico.email}
            </p>
            <p>
              <strong>Estado:</strong>{" "}
              {tecnico.activo ? (
                <span className="activo">✅ Activo</span>
              ) : (
                <span className="inactivo">❌ Inactivo</span>
              )}
            </p>
            <div className="acciones">
              <button
                onClick={() => navigate(`/tecnico/${tecnico.id_tecnico}`)}
              >
                Ver perfil
              </button>
              <button
                className={tecnico.activo ? "btn-rojo" : "btn-verde"}
                onClick={() => toggleEstado(tecnico.id_tecnico, tecnico.activo)}
              >
                {tecnico.activo ? "Desactivar" : "Activar"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TecnicosAdmin;
