import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axios.js";

import { AiOutlineWarning } from "react-icons/ai";

function FormularioDetalle() {
  const { id } = useParams();
  const [formulario, setFormulario] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [tecnico, setTecnico] = useState(null);
  const [progreso, setProgreso] = useState(0);

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
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [tiempoInicio, setTiempoInicio] = useState(null);

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

  const uploadVideoToCloudinary = async (file) => {
    setTiempoInicio(Date.now());
    return new Promise((resolve, reject) => {
      const url = "https://api.cloudinary.com/v1_1/dfe8vpoxs/video/upload";
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "formulario_directo");
      formData.append("folder", "formularios");

      const xhr = new XMLHttpRequest();
      xhr.open("POST", url);

      // ✅ Movemos esto adentro del bloque donde se define `percent`
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded * 100) / event.total);
          setProgreso(percent);

          // Estimación de tiempo restante (opcional)
          const tiempoActual = Date.now();
          const tiempoTranscurrido = (tiempoActual - tiempoInicio) / 1000; // segundos

          if (percent > 0) {
            const estimadoTotal = tiempoTranscurrido / (percent / 100);
            const estimadoRestante = estimadoTotal - tiempoTranscurrido;

            console.log(
              `⏳ Estimado restante: ${Math.round(estimadoRestante)}s`
            );
            // Podés guardar en un estado si querés mostrarlo:
            // setTiempoRestante(Math.round(estimadoRestante));
          }
        }
      });

      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            resolve(response.secure_url);
          } else {
            try {
              const error = JSON.parse(xhr.responseText);
              console.error("Cloudinary error:", error);
              reject(
                new Error(error.error?.message || "Error al subir a Cloudinary")
              );
            } catch (err) {
              reject(new Error("Error desconocido al subir a Cloudinary"));
            }
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error("Error de red al subir a Cloudinary"));
      };

      xhr.send(formData);
    });
  };

  if (!formulario) return <p>Cargando formulario...</p>;

  const cambiarEstado = async (nuevoEstado, motivo = "") => {
    try {
      const payload = { estado: nuevoEstado };
      if (nuevoEstado === "Rechazado") payload.motivo_rechazo = motivo;

      const res = await axios.patch(
        `/formularios/${formulario.id_formulario}/estado`,
        payload,
        { withCredentials: true }
      );
      setFormulario(res.data);
      setSeleccionados([]);
      setMotivoCierre("");
      setObservaciones("");
      setArchivo(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error("Error al cambiar estado", err);
    }
  };

  const enviarFormulario = async (e) => {
    e.preventDefault();
    if (enviando || !archivo) return;

    setEnviando(true);
    setAlerta("⏳ Subiendo video...");

    try {
      setAlerta("⏳ Subiendo video...");
      const videoUrl = await uploadVideoToCloudinary(archivo);

      // Mostramos la alerta de éxito por al menos 1 segundo
      setAlerta("✅ Video subido correctamente. ⏳ Enviando formulario...");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const payload = {
        motivo_cierre: motivoCierre,
        checklist: seleccionados.join(", "),
        observaciones,
        url_archivo: videoUrl,
      };

      console.log(
        "📡 Enviando PATCH a /formularios/:id/completar con:",
        payload
      );

      const res = await axios.patch(
        `/formularios/${formulario.id_formulario}/completar`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
          timeout: 120000,
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
      setProgreso(0);
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
          <div
            style={{
              marginTop: 40,
              border: "1px solid #ddd",
              borderRadius: 10,
              padding: 20,
              backgroundColor: "#f9f9f9",
            }}
          >
            <h3 style={{ marginBottom: 20, color: "#2c3e50" }}>
              🛠 Acciones del administrador
            </h3>

            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              <button
                onClick={() => cambiarEstado("Aprobado")}
                className="btn btn-verde"
                style={{
                  flex: 1,
                  minWidth: 200,
                  padding: "12px",
                  fontWeight: "bold",
                  borderRadius: 6,
                }}
              >
                ✅ Aprobar formulario
              </button>

              <div style={{ flex: 3 }}>
                <input
                  type="text"
                  value={motivoRechazo}
                  onChange={(e) => setMotivoRechazo(e.target.value)}
                  placeholder="Ej: Faltan observaciones o archivo incorrecto"
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 6,
                    border: "1px solid #ccc",
                    marginBottom: 10,
                  }}
                />

                <button
                  onClick={() => cambiarEstado("Rechazado", motivoRechazo)}
                  disabled={!motivoRechazo}
                  className="btn btn-rojo"
                  style={{
                    width: "100%",
                    padding: "12px",
                    fontWeight: "bold",
                    borderRadius: 6,
                  }}
                >
                  ❌ Rechazar formulario
                </button>
              </div>
            </div>
          </div>
        )}

        {usuario?.rol === "tecnico" && formulario.estado === "Rechazado" && (
          <div className="rechazo-alert">
            <div className="rechazo-icon">
              <AiOutlineWarning />
            </div>
            <div>
              <p className="rechazo-titulo">
                Este formulario fue rechazado. Debe ser corregido.
              </p>
              {formulario.motivo_rechazo && (
                <p className="rechazo-detalle">
                  <strong>Motivo del rechazo:</strong>{" "}
                  {formulario.motivo_rechazo}
                </p>
              )}
            </div>
          </div>
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
              disabled={enviando}
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
            {enviando && progreso > 0 && (
              <div style={{ marginTop: 10 }}>
                <div
                  style={{ height: 10, background: "#ddd", borderRadius: 4 }}
                >
                  <div
                    style={{
                      width: `${progreso}%`,
                      height: "100%",
                      background: "#3b82f6",
                      borderRadius: 4,
                    }}
                  ></div>
                </div>
                <p style={{ fontSize: 12, marginTop: 4 }}>{progreso}% subido</p>
                {progreso > 0 && progreso < 100 && (
                  <p style={{ fontSize: 12, color: "#555" }}>
                    Tiempo restante estimado: ~
                    {Math.round((100 - progreso) / 2)}s
                  </p>
                )}
              </div>
            )}
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
