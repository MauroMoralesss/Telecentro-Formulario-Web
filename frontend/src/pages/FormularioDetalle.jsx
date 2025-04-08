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
    "Evento fuera de norma",
    "Niveles fuera de rango",
  ];

  const [seleccionados, setSeleccionados] = useState([]);
  const [motivoCierre, setMotivoCierre] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [alerta, setAlerta] = useState("");

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

    if (!archivo) {
      setAlerta("❌ Debe adjuntar un archivo antes de enviar el formulario.");
      setTimeout(() => setAlerta(""), 4000);
      return;
    }

    setEnviando(true);
    setAlerta("");
    const formData = new FormData();
    formData.append("motivo_cierre", motivoCierre);
    formData.append("checklist", seleccionados.join(", "));
    formData.append("observaciones", observaciones);
    formData.append("archivo", archivo);

    try {
      const res = await axios.patch(
        `/formularios/${formulario.id_formulario}/completar`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setFormulario(res.data);
      setAlerta("✅ Formulario enviado correctamente");
    } catch (error) {
      console.error("Error al completar formulario", error);
      setAlerta("❌ Error al enviar el formulario");
    } finally {
      setEnviando(false);
      setTimeout(() => setAlerta(""), 4000);
    }
  };

  return (
    <div className="formulario-detalle-container card-container">
      <div className="card" style={{ padding: 20 }}>
        <h2 style={{ marginBottom: 12 }}>
          📋 Formulario #{formulario.id_formulario}
        </h2>

        <div className="info-grid">
          <p>
            <strong>Técnico:</strong>{" "}
            {tecnico ? tecnico.nombre : `ID ${formulario.tecnico_id}`}
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
            <strong>Estado:</strong>{" "}
            <span className={`estado-${formulario.estado.toLowerCase()}`}>
              {formulario.estado}
            </span>
          </p>
          <p>
            <strong>Fecha de creación:</strong>{" "}
            {new Date(formulario.fecha_creacion).toLocaleString()}
          </p>
        </div>

        <hr style={{ margin: "12px 0" }} />

        <div>
          <p>
            <strong>Motivo de cierre:</strong> {formulario.motivo_cierre || "—"}
          </p>
          <p>
            <strong>Observaciones:</strong> {formulario.observaciones || "—"}
          </p>

          <div>
            <strong>Checklist:</strong>
            {formulario.checklist ? (
              <ul style={{ margin: "8px 0", paddingLeft: 20 }}>
                {formulario.checklist.split(",").map((item, i) => (
                  <li key={i}>✅ {item.trim()}</li>
                ))}
              </ul>
            ) : (
              <p>—</p>
            )}
          </div>

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
              <div className="preview-archivo" style={{ marginTop: 10 }}>
                {formulario.url_archivo.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                  <img
                    src={formulario.url_archivo}
                    alt="Vista previa"
                    style={{ maxWidth: "100%", borderRadius: 6 }}
                  />
                ) : formulario.url_archivo.match(/\.(mp4|webm)$/i) ? (
                  <video controls style={{ maxWidth: "100%", borderRadius: 6 }}>
                    <source src={formulario.url_archivo} type="video/mp4" />
                    Tu navegador no soporta este formato.
                  </video>
                ) : (
                  <p>No se puede mostrar vista previa.</p>
                )}
              </div>
            </>
          )}
        </div>

        {usuario?.rol === "admin" && formulario.estado === "En revision" && (
          <div style={{ marginTop: 20 }}>
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
          <p className="alert-warning" style={{ marginTop: 12 }}>
            ⚠️ Este formulario fue rechazado. Debe ser corregido.
          </p>
        )}
      </div>

      {usuario?.rol === "tecnico" &&
        ["Iniciado", "Rechazado"].includes(formulario.estado) && (
          <form onSubmit={enviarFormulario} className="form-card">
            <label>Motivos de instalación:</label>
            {opcionesChecklist.map((opcion) => (
              <div key={opcion} className="checkbox-container">
                <label className="checkbox-label">
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
                  <span>{opcion}</span>
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
              accept="video/*"
              capture="environment"
              onChange={(e) => {
                const file = e.target.files[0];
                setArchivo(file);
                setPreviewUrl(URL.createObjectURL(file));
              }}
            />

            {previewUrl && (
              <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                <p>
                  <strong>Vista previa del video:</strong>
                </p>
                <video
                  src={previewUrl}
                  controls
                  width="100%"
                  style={{ borderRadius: "8px", maxHeight: "300px" }}
                />
              </div>
            )}

            {alerta && (
              <div
                className={
                  alerta.includes("✅") ? "alert-success" : "alert-error"
                }
                style={{ marginTop: 10 }}
              >
                {alerta}
              </div>
            )}

            <label>Motivo cierre:</label>
            <select
              value={motivoCierre}
              onChange={(e) => setMotivoCierre(e.target.value)}
              required
            >
              <option value="">Seleccionar...</option>
              <option value="Instalacion ok">Instalacion ok</option>
              <option value="Conformidad del cliente">
                Conformidad del cliente
              </option>
              <option value="Desconformidad del cliente">
                Desconformidad del cliente
              </option>
              <option value="Ausente">Ausente</option>
              <option value="Datos erróneos">Datos erróneos</option>
              <option value="Varios / otros">Varios / otros</option>
            </select>

            <button
              type="submit"
              className="btn"
              disabled={enviando}
              style={{ marginTop: 10 }}
            >
              {enviando ? "Enviando..." : "Enviar formulario"}
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
