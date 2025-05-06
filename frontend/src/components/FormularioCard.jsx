import { useNavigate } from "react-router-dom";
import { FaTimesCircle } from "react-icons/fa"; // Ícono para Rechazado

function FormularioCard({ form }) {
  const navigate = useNavigate();

  const estadoColor = {
    Aprobado: "green",
    Rechazado: "red",
    "En revision": "#007bff",
    Iniciado: "#377771",
    "Visto sin validar": "#f1c40f",
  };

  const estadoLabel = {
    Aprobado: "Aprobado",
    Rechazado: "Rechazado",
    "En revision": "En revisión",
    Iniciado: "Iniciado",
  };

  const estado = form.estado;

  return (
    <div
      className="card"
      style={{
        borderLeft: `6px solid ${estadoColor[estado] || "#ccc"}`,
        padding: "16px",
        marginBottom: "16px",
        backgroundColor: "#fff",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        position: "relative",
      }}
    >
      {/* Etiqueta de rechazado */}
      {estado === "Rechazado" && (
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            backgroundColor: "#f8d7da",
            color: "#842029",
            padding: "4px 10px",
            borderRadius: 6,
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <FaTimesCircle /> Rechazado
        </div>
      )}

      <h3 style={{ marginBottom: 8 }}>
        <strong>Orden N° {form.nro_orden}</strong>
      </h3>

      <p>
        <strong>Técnico ID:</strong> {form.tecnico_id}
      </p>
      <p>
        <strong>Orden:</strong> {form.nro_orden}
      </p>
      <p>
        <strong>Cliente:</strong> {form.nro_cliente}
      </p>
      <p>
        <strong>Nombre:</strong> {form.nombre}
      </p>
      <p>
        <strong>Domicilio:</strong> {form.domicilio}
      </p>
      <p>
        <strong>Teléfono:</strong> {form.telefono}
      </p>

      <p>
        <strong>Estado:</strong>{" "}
        <span style={{ color: estadoColor[estado] || "#000" }}>
          {estadoLabel[estado] || estado}
        </span>
      </p>
      <p>
        <strong>Fecha:</strong>{" "}
        {new Date(form.fecha_creacion).toLocaleString("es-AR")}
      </p>

      <div style={{ marginTop: 12 }}>
        <button
          className="btn btn-primary"
          onClick={() => navigate(`/formulario/${form.id_formulario}`)}
        >
          Ver detalles
        </button>
      </div>
    </div>
  );
}

export default FormularioCard;
