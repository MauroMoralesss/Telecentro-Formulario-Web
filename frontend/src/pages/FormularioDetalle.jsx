import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axios.js";

function FormularioDetalle() {
  const { id } = useParams();
  const [formulario, setFormulario] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [tecnico, setTecnico] = useState(null);

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

      if (res.data?.tecnico_id) {
        const tecnicoRes = await axios.get(`/tecnico/${res.data.tecnico_id}`, {
          withCredentials: true,
        });
        setTecnico(tecnicoRes.data);
      }
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
    <div className="formulario-detalle-container card-container">
      <div className="card">
        <h2>Formulario #{formulario.id_formulario}</h2>
        <p>
          <strong>Técnico ID:</strong> {formulario.tecnico_id}
        </p>
        <p>
          <strong>Técnico:</strong>{" "}
          {tecnico
            ? `${tecnico.nombre}`
            : `ID ${formulario.tecnico_id}`}
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
          <strong>Vt:</strong> {formulario.vt}
        </p>
        <p>
          <strong>Estado:</strong>{" "}
          <span className={`estado-${formulario.estado.toLowerCase()}`}>
            {formulario.estado}
          </span>
        </p>
        <p>
          <strong>Motivo cierre:</strong> {formulario.motivo_cierre || "—"}
        </p>
        <div>
          <strong>Checklist:</strong>
          {formulario.checklist ? (
            <ul style={{ margin: 0, paddingLeft: 20 }}>
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
          <>
            <p>
              <strong>Archivo:</strong>{" "}
              <a
                href={formulario.url_archivo}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver archivo
              </a>
            </p>
            <div className="preview-archivo">
              {formulario.url_archivo.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                <img src={formulario.url_archivo} alt="Vista previa" />
              ) : formulario.url_archivo.match(/\.(mp4|webm)$/i) ? (
                <video controls>
                  <source src={formulario.url_archivo} type="video/mp4" />
                  Tu navegador no soporta este formato.
                </video>
              ) : (
                <p>
                  No se puede mostrar una vista previa para este tipo de
                  archivo.
                </p>
              )}
            </div>
          </>
        )}

        {usuario?.rol === "admin" && formulario.estado === "En revision" && (
          <div style={{ marginTop: 12 }}>
            <button onClick={() => cambiarEstado("Aprobado")} className="btn">
              ✅ Aprobar
            </button>
            <button
              onClick={() => cambiarEstado("Rechazado")}
              className="btn btn-secundario"
              style={{ marginLeft: 10 }}
            >
              ❌ Rechazar
            </button>
          </div>
        )}

        {usuario?.rol === "tecnico" && formulario.estado === "Rechazado" && (
          <p className="alert-warning">
            ⚠️ Este formulario fue rechazado. Debe ser corregido.
          </p>
        )}
      </div>

      {usuario?.rol === "tecnico" &&
        ["Iniciado", "Rechazado"].includes(formulario.estado) && (
          <form onSubmit={enviarFormulario} className="form-card">
            <label>Motivo cierre:</label>
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

            <label>Checklist:</label>
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
                  />{" "}
                  {opcion}
                </label>
              </div>
            ))}

            <label>Observaciones:</label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
            ></textarea>

            <label>Archivo:</label>
            <input
              type="file"
              onChange={(e) => setArchivo(e.target.files[0])}
            />

            <button type="submit" className="btn" style={{ marginTop: 10 }}>
              Enviar formulario
            </button>
          </form>
        )}

      <button
        onClick={() => window.history.back()}
        className="btn btn-back"
        style={{ marginTop: 20 }}
      >
        ← Volver al Dashboard
      </button>
    </div>
  );
}

export default FormularioDetalle;
