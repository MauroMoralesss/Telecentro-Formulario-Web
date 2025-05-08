import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axios.js";
import { getCurrentPositionPromise } from "../api/geolocation.js";
import DispositivoScanner from "../components/DispositivoScanner.jsx";

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
  const [archivoInterior, setArchivoInterior] = useState(null);
  const [archivoExterior, setArchivoExterior] = useState(null);
  const [previewInterior, setPreviewInterior] = useState(null);
  const [previewExterior, setPreviewExterior] = useState(null);
  const [archivoExtra, setArchivoExtra] = useState(null);
  const [previewExtra, setPreviewExtra] = useState(null);
  const [alerta, setAlerta] = useState("");
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [estadoMsg, setEstadoMsg] = useState("");

  const { usuario } = useAuth();

  // Nuevo estado para lista de dispositivos
  const [dispositivos, setDispositivos] = useState([]);

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

  // Sincronizar dispositivos tras cargar formulario
  useEffect(() => {
    if (formulario) {
      setDispositivos(formulario.dispositivos || []);
    }
  }, [formulario]);

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
      setArchivoInterior(null);
      setArchivoExterior(null);
      setPreviewInterior(null);
      setPreviewExterior(null);
      setEstadoMsg(`✅ Estado cambiado a "${nuevoEstado}"`);

      setTimeout(() => setEstadoMsg(""), 3000);
    } catch (err) {
      console.error("Error al cambiar estado", err);
    }
  };

  const enviarFormulario = async (e) => {
    e.preventDefault();

    // Intentar capturar coordenadas
    let latitud, longitud;
    try {
      const { coords } = await getCurrentPositionPromise({ timeout: 5000 });
      latitud = coords.latitude;
      longitud = coords.longitude;
    } catch (err) {
      console.warn("No se pudo obtener ubicación:", err.message);
      // continuamos sin coordenadas
    }

    if (enviando || !archivoInterior || !archivoExterior) {
      setAlerta("❌ Debes subir ambos videos: interior y exterior");
      return;
    }

    setEnviando(true);
    setAlerta("⏳ Subiendo ambos videos (interior y exterior)… 📤");
    setProgreso(1);

    try {
      const formData = new FormData();
      if (archivoInterior) formData.append("video_interior", archivoInterior);
      if (archivoExterior) formData.append("video_exterior", archivoExterior);
      if (archivoExtra) formData.append("video_extra", archivoExtra);
      formData.append("motivo_cierre", motivoCierre);
      formData.append("checklist", seleccionados.join(", "));
      formData.append("observaciones", observaciones);
      formData.append("dispositivos", JSON.stringify(dispositivos));
      // Añadir coords si las tenemos
      if (latitud != null && longitud != null) {
        formData.append("latitud", latitud);
        formData.append("longitud", longitud);
      }

      const res = await axios.patch(
        `/formularios/${formulario.id_formulario}/completar`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 10 * 60 * 1000,
          onUploadProgress: (event) => {
            if (event.lengthComputable) {
              let percent = Math.round((event.loaded * 100) / event.total);
              if (percent >= 100) percent = 99;
              setProgreso(percent);

              if (percent === 99) {
                setAlerta("✅ Videos subidos. ⏳ Procesando en el servidor...");
              }
            }
          },
        }
      );

      setProgreso(100);
      setAlerta(
        "✅ Videos comprimidos y subidos correctamente. Guardando datos..."
      );
      await new Promise((r) => setTimeout(r, 1000));

      setFormulario(res.data);
      setAlerta("✅ Formulario enviado correctamente");
      setPreviewUrl(null);

      setTimeout(() => {
        setSeleccionados([]);
        setMotivoCierre("");
        setObservaciones("");
        setArchivoInterior(null);
        setArchivoExterior(null);
        setPreviewInterior(null);
        setPreviewExterior(null);
      }, 1000);
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
        <h2 style={{ marginBottom: 12 }}>📋 Orden N° {formulario.nro_orden}</h2>

        <div className="info-grid">
          <p>
            <strong>Técnico ID:</strong> {formulario.tecnico_id}
          </p>
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
            <strong>Nombre:</strong> {formulario.nombre}
          </p>
          <p>
            <strong>Domicilio:</strong> {formulario.domicilio}
          </p>
          <p>
            <strong>Teléfono:</strong> {formulario.telefono}
          </p>
          <p>
            <strong>Estado:</strong>{" "}
            <span
              className={`estado-${formulario.estado
                .toLowerCase()
                .replace(/\s+/g, "-")}`}
            >
              {formulario.estado}
            </span>
          </p>
          <p>
            <strong>Fecha de creación:</strong>{" "}
            {new Date(formulario.fecha_creacion).toLocaleString("es-AR")}
          </p>
          {usuario?.rol === "admin" && formulario.fecha_modificacion && (
            <p>
              <strong>Última modificación:</strong>{" "}
              {new Date(formulario.fecha_modificacion).toLocaleString("es-AR")}
            </p>
          )}
        </div>
        {formulario.servicios_instalar && (
          <>
            <p style={{ margin: "8px 0" }}>
              <strong>Servicios a Instalar:</strong>
            </p>
            <ul className="servicios-lista">
              {formulario.servicios_instalar
                .split(/\r?\n/)
                .filter((s) => s.trim() !== "")
                .map((servicio, idx) => (
                  <li key={idx}>{servicio}</li>
                ))}
            </ul>
          </>
        )}

        <section style={{ margin: "2rem 0" }}>
          <h3 style={{ borderBottom: "2px solid #ddd", paddingBottom: 4 }}>
            🔌 Inventario registrados
          </h3>
          {dispositivos.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "1rem",
                marginTop: "1rem",
              }}
            >
              {dispositivos.map((d, i) => (
                <div
                  key={i}
                  style={{
                    background: "#fafafa",
                    border: "1px solid #e0e0e0",
                    borderRadius: 6,
                    padding: "12px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  <span style={{ fontSize: "0.9rem", color: "#555" }}>
                    Tipo
                  </span>
                  <strong style={{ fontSize: "1.1rem", color: "#003399" }}>
                    {d.tipo}
                  </strong>
                  <span
                    style={{
                      fontSize: "1rem",
                      fontFamily: "monospace",
                      color: "#333",
                    }}
                  >
                    MAC: {d.mac}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ marginTop: 8, color: "#666" }}>
              No hay dispositivos registrados aún.
            </p>
          )}
        </section>

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

          {formulario.url_video_interior && (
            <>
              <p>
                <strong>Video Interior:</strong>{" "}
                <a
                  href={formulario.url_video_interior}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver video
                </a>
              </p>
              <div className="preview-archivo" style={{ marginTop: 10 }}>
                <video
                  controls
                  style={{ maxWidth: "100%", borderRadius: 6 }}
                  referrerPolicy="no-referrer"
                >
                  <source
                    src={formulario.url_video_interior}
                    type="video/mp4"
                  />
                  Tu navegador no soporta este formato.
                </video>
              </div>
            </>
          )}

          {formulario.url_video_exterior && (
            <>
              <p>
                <strong>Video Exterior:</strong>{" "}
                <a
                  href={formulario.url_video_exterior}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver video
                </a>
              </p>
              <div className="preview-archivo" style={{ marginTop: 10 }}>
                <video
                  controls
                  style={{ maxWidth: "100%", borderRadius: 6 }}
                  referrerPolicy="no-referrer"
                >
                  <source
                    src={formulario.url_video_exterior}
                    type="video/mp4"
                  />
                  Tu navegador no soporta este formato.
                </video>
              </div>
            </>
          )}
        </div>

        {formulario.url_video_extra && (
          <>
            <p>
              <strong>Video Extra:</strong>{" "}
              <a
                href={formulario.url_video_extra}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver video
              </a>
            </p>
            <div className="preview-archivo" style={{ marginTop: 10 }}>
              <video
                controls
                style={{ maxWidth: "100%", borderRadius: 6 }}
                referrerPolicy="no-referrer"
              >
                <source src={formulario.url_video_extra} type="video/mp4" />
                Tu navegador no soporta este formato.
              </video>
            </div>
          </>
        )}

        {formulario.latitud && formulario.longitud && (
          <section style={{ margin: "2rem 0" }}>
            <h3>📍 Ubicación</h3>
            <iframe
              width="100%"
              height="240"
              style={{ border: 0, borderRadius: 8 }}
              loading="lazy"
              allowFullScreen
              src={`https://www.google.com/maps?q=${formulario.latitud},${formulario.longitud}&z=15&output=embed`}
            />
          </section>
        )}

        {usuario?.rol === "admin" &&
          ["En revision", "Visto sin validar"].includes(formulario.estado) && (
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
                {estadoMsg && (
                  <p className="alert-success" style={{ marginTop: 10 }}>
                    {estadoMsg}
                  </p>
                )}
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
                <button
                  onClick={() => cambiarEstado("Visto sin validar")}
                  className="btn btn-amarillo"
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 6,
                    border: "1px solid #ccc",
                    marginBottom: 10,
                  }}
                >
                  🔄 Continuar a revisión
                </button>
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

            <label>Video Interior:</label>
            <input
              type="file"
              accept="video/*"
              capture="environment"
              disabled={enviando}
              onChange={(e) => {
                const file = e.target.files[0];
                setArchivoInterior(file);
                setPreviewInterior(URL.createObjectURL(file));
              }}
            />

            {previewInterior && (
              <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                <p>
                  <strong>Vista previa Interior:</strong>
                </p>
                <video
                  src={previewInterior}
                  controls
                  width="100%"
                  style={{ borderRadius: "8px", maxHeight: "300px" }}
                />
              </div>
            )}

            <label>Video Exterior:</label>
            <input
              type="file"
              accept="video/*"
              capture="environment"
              disabled={enviando}
              onChange={(e) => {
                const file = e.target.files[0];
                setArchivoExterior(file);
                setPreviewExterior(URL.createObjectURL(file));
              }}
            />

            {previewExterior && (
              <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                <p>
                  <strong>Vista previa Exterior:</strong>
                </p>
                <video
                  src={previewExterior}
                  controls
                  width="100%"
                  style={{ borderRadius: "8px", maxHeight: "300px" }}
                />
              </div>
            )}

            <label>Video Extra (opcional):</label>
            <input
              type="file"
              accept="video/*"
              capture="environment"
              disabled={enviando}
              onChange={(e) => {
                const file = e.target.files[0];
                setArchivoExtra(file);
                setPreviewExtra(URL.createObjectURL(file));
              }}
            />

            {previewExtra && (
              <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                <p>
                  <strong>Vista previa Extra:</strong>
                </p>
                <video
                  src={previewExtra}
                  controls
                  width="100%"
                  style={{ borderRadius: "8px", maxHeight: "300px" }}
                />
              </div>
            )}

            <hr />
            <DispositivoScanner
              dispositivos={dispositivos}
              setDispositivos={setDispositivos}
            />
            <p style={{ marginBottom: "8px" }}>
              Dispositivos agregados: {dispositivos.length}
            </p>
            <hr style={{ marginBottom: "8px" }} />

            <label style={{ marginTop: "20px" }}>Motivo cierre:</label>
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
              <option value="Instalación cableada sin terminar">
                Instalación cableada sin terminar
              </option>
              <option value="Datos erróneos">Datos erróneos</option>
              <option value="Varios / otros">Varios / otros</option>
            </select>

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

            <button
              type="submit"
              className="btn"
              disabled={enviando}
              style={{ marginTop: 10 }}
            >
              {enviando ? (
                <>
                  <span className="spinner" /> Enviando...
                </>
              ) : (
                "Enviar formulario"
              )}
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
            {enviando && progreso === 99 && (
              <div style={{ marginTop: 10, fontSize: 12, color: "#555" }}>
                <span className="spinner" style={{ marginRight: 5 }} />
                Procesando en el servidor...
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
