import { useState, useEffect } from "react";
import axios from "../api/axios";
import { useNavigate, Link, useParams } from "react-router-dom";
import Select from "react-select";

function CrearFormulario() {
  const [tecnicos, setTecnicos] = useState([]);
  const [form, setForm] = useState({
    tecnico_id: "",
    nro_orden: "",
    nro_cliente: "",
    nombre: "",
    domicilio: "",
    telefono: "",
    servicios_instalar: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const navigate = useNavigate();
  const { slug } = useParams();
  useEffect(() => {
    const cargarTecnicos = async () => {
      const res = await axios.get("/tecnicos", { withCredentials: true });
      setTecnicos(res.data.filter((t) => t.rol === "tecnico"));
    };
    cargarTecnicos();
  }, []);

  const opciones = tecnicos.map((t) => ({
    value: t.id_tecnico,
    label: `${t.id_tecnico} - ${t.nombre}`,
  }));

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await axios.post("/formularios", form, { withCredentials: true });
      setSuccessMsg("Formulario creado correctamente");

      setTimeout(() => {
        navigate(`/${slug}/dashboard`);
      }, 2000);
    } catch (error) {
      const mensaje = error.response?.data?.message || "Error del servidor";
      setErrorMsg(mensaje);
    }
  };

  const autoResize = (e) => {
    e.target.style.height = "auto"; // reset por si achica
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h2 className="form-title">Crear nuevo formulario</h2>

      {errorMsg && <div className="alert-error">⚠️ {errorMsg}</div>}
      {successMsg && <div className="alert-success">✅ {successMsg}</div>}

      <form className="form-card" onSubmit={handleSubmit}>
        <label>Técnico:</label>
        <Select
          options={opciones}
          onChange={(opcion) => setForm({ ...form, tecnico_id: opcion.value })}
          placeholder="Seleccionar técnico..."
          isSearchable
          styles={{ menu: (base) => ({ ...base, zIndex: 999 }) }}
        />

        <label>Nro Orden:</label>
        <input name="nro_orden" onChange={handleChange} required />

        <label>Nro Cliente:</label>
        <input name="nro_cliente" onChange={handleChange} required />

        <label>Nombre:</label>
        <input name="nombre" onChange={handleChange} required />

        <label>Domicilio:</label>
        <input name="domicilio" onChange={handleChange} required />

        <label>Teléfono:</label>
        <input
          name="telefono"
          type="tel"
          onChange={handleChange}
          required
          pattern="[0-9]{8,20}"
          title="Solo números entre 8 y 20 dígitos"
        />
        <label htmlFor="servicios_instalar">Servicios a Instalar:</label>
        <textarea
          name="servicios_instalar"
          value={form.servicios_instalar}
          onChange={(e) => {
            handleChange(e);
            autoResize(e);
          }}
          placeholder="Ej: ABONO TELEFONIA 75388999 (COMUN SITIO WEB)"
          rows={1} // arranca con una fila mínima
          style={{ overflow: "hidden", resize: "none" }}
        />

        <button
          type="submit"
          className="btn btn-primary"
          style={{ marginTop: 12 }}
        >
          Crear
        </button>
      </form>

      <div style={{ marginTop: 20 }}>
        <Link to="/dashboard">← Volver al dashboard</Link>
      </div>
    </div>
  );
}

export default CrearFormulario;
