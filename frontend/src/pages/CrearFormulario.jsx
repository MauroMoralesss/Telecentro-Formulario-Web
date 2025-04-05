import { useState, useEffect } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Select from "react-select";

function CrearFormulario() {
  const [tecnicos, setTecnicos] = useState([]);
  const [form, setForm] = useState({
    tecnico_id: "",
    nro_orden: "",
    nro_cliente: "",
    abonado: "",
    vt: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const cargarTecnicos = async () => {
      const res = await axios.get("/tecnicos", { withCredentials: true });
      // filtramos solo los que tienen rol tecnico
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
    await axios.post("/formularios", form, { withCredentials: true });
    alert("Formulario creado correctamente");
    navigate("/dashboard");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Crear nuevo formulario</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Técnico:</label>
          <br />
          <Select
            options={opciones}
            onChange={(opcion) =>
              setForm({ ...form, tecnico_id: opcion.value })
            }
            placeholder="Seleccionar técnico..."
            isSearchable
          />
        </div>
        <div>
          <label>Nro Orden:</label>
          <br />
          <input name="nro_orden" onChange={handleChange} required />
        </div>
        <div>
          <label>Nro Cliente:</label>
          <br />
          <input name="nro_cliente" onChange={handleChange} required />
        </div>
        <div>
          <label>Abonado:</label>
          <br />
          <input name="abonado" onChange={handleChange} required />
        </div>
        <div>
          <label>Vt:</label>
          <br />
          <input name="vt" onChange={handleChange} required />
        </div>
        <button type="submit"> Crear </button>
        <br />
        <br />
        <Link to="/dashboard">← Volver al dashboard</Link>
      </form>
    </div>
  );
}

export default CrearFormulario;
