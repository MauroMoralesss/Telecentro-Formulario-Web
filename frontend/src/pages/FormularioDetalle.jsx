import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axios.js";

function FormularioDetalle() {
  const { id } = useParams();
  const [formulario, setFormulario] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const opcionesChecklist = [
    "Cableado realizado correctamente",
    "Inconveniente con cliente",
    "Daño a la propiedad",
  ];

  const [seleccionados, setSeleccionados] = useState([]);
  const [motivoCierre, setMotivoCierre] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [archivo, setArchivo] = useState(null);

  const { usuario } = useAuth();

  useEffect(() => {
    const fetchForm = async () => {
      const res = await axios.get(`/formularios/${id}`, {
        withCredentials: true,
      });
      setFormulario(res.data);
    };
    fetchForm();
  }, [id]);

  if (!formulario) return <p>Cargando formulario...</p>;

  const cambiarEstado = async (nuevoEstado) => {
    try {
      await axios.patch(`/formularios/${formulario.id_formulario}/estado`, {
        estado: nuevoEstado,
      });
      setFormulario({ ...formulario, estado: nuevoEstado });
    } catch (err) {
      console.error("Error al cambiar estado", err);
    }
  };

  const enviarFormulario = async (e) => {
    e.preventDefault();
    if (enviando) return;

    setEnviando(true);
    const formData = new FormData();
    formData.append("motivo_cierre", motivoCierre);
    formData.append("checklist", seleccionados.join(", "));
    formData.append("observaciones", observaciones);
    if (archivo) formData.append("archivo", archivo);

    try {
      const res = await axios.patch(
        `/formularios/${formulario.id_formulario}/completar`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setFormulario(res.data);
      alert("Formulario enviado correctamente");
    } catch (error) {
      console.error("Error al completar formulario", error);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Formulario #{formulario.id_formulario}</h2>
      <p>
        <strong>Técnico ID:</strong> {formulario.tecnico_id}
      </p>
      <p>
        <strong>Orden:</strong> {formulario.nro_orden}
      </p>
      <p>
        <strong>Cliente:</strong> {formulario.nro_cliente}
      </p>
      <p>
        <strong>Abonado:</strong> {formulario.abonado}
      </p>
      <p>
        <strong>Velocidad:</strong> {formulario.vt}
      </p>
      <p>
        <strong>Estado:</strong> {formulario.estado}
      </p>
      <p>
        <strong>Motivo cierre:</strong> {formulario.motivo_cierre || "—"}
      </p>
      <div>
        <strong>Checklist:</strong>
        {formulario.checklist ? (
          <ul>
            {formulario.checklist.split(",").map((item, index) => (
              <li key={index}>✅ {item.trim()}</li>
            ))}
          </ul>
        ) : (
          <span>—</span>
        )}
      </div>

      <p>
        <strong>Observaciones:</strong> {formulario.observaciones || "—"}
      </p>

      {formulario.url_archivo && (
        <p>
          <strong>Archivo:</strong>{" "}
          <a href={formulario.url_archivo} target="_blank" rel="noreferrer">
            Ver archivo
          </a>
        </p>
      )}

      {usuario?.rol === "admin" && formulario.estado === "En revision" && (
        <div style={{ marginTop: 12 }}>
          <button
            onClick={() => cambiarEstado("Aprobado")}
            style={{ marginRight: 8 }}
          >
            ✅ Aprobar
          </button>
          <button
            onClick={() => cambiarEstado("Rechazado")}
            style={{ backgroundColor: "red", color: "white" }}
          >
            ❌ Rechazar
          </button>
        </div>
      )}

      {usuario?.rol === "tecnico" && formulario.estado === "Rechazado" && (
        <p style={{ color: "orange" }}>
          ⚠️ Este formulario fue rechazado. Debe ser corregido.
        </p>
      )}

      {usuario?.rol === "tecnico" &&
        ["Iniciado", "Rechazado"].includes(formulario.estado) && (
          <form onSubmit={enviarFormulario} style={{ marginTop: 20 }}>
            <div>
              <label>Motivo cierre:</label>
              <br />
              <select
                value={motivoCierre}
                onChange={(e) => setMotivoCierre(e.target.value)}
                required
              >
                <option value="">Seleccionar...</option>
                <option value="Evento fuera de norma">
                  Evento fuera de norma
                </option>
                <option value="Conformidad de cliente">
                  Conformidad de cliente
                </option>
                <option value="Varios / otros">Varios / otros</option>
              </select>
            </div>

            <div>
              <label>Checklist:</label>
              <br />
              {opcionesChecklist.map((opcion) => (
                <div key={opcion}>
                  <label>
                    <input
                      type="checkbox"
                      value={opcion}
                      checked={seleccionados.includes(opcion)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSeleccionados([...seleccionados, opcion]);
                        } else {
                          setSeleccionados(
                            seleccionados.filter((o) => o !== opcion)
                          );
                        }
                      }}
                    />
                    {opcion}
                  </label>
                </div>
              ))}
            </div>

            <div>
              <label>Observaciones:</label>
              <br />
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              ></textarea>
            </div>

            <div>
              <label>Archivo:</label>
              <br />
              <input
                type="file"
                onChange={(e) => setArchivo(e.target.files[0])}
              />
            </div>

            <button type="submit" style={{ marginTop: 10 }}>
              Enviar formulario
            </button>
          </form>
        )}

      <button onClick={() => window.history.back()} style={{ marginTop: 20 }}>
        ← Volver al Dashboard
      </button>
    </div>
  );
}

export default FormularioDetalle;
