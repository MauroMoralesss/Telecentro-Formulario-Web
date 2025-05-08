// src/components/FormularioCard.jsx
import { useNavigate } from "react-router-dom";
import { FaTimesCircle } from "react-icons/fa";

function FormularioCard({ form }) {
  const navigate = useNavigate();

  const estadoColor = {
    Aprobado: "#2e7d32",
    Rechazado: "#c62828",
    "En revision": "#0277bd",
    Iniciado: "#377771",
    "Visto sin validar": "#f1c40f",
  };

  const estadoLabel = {
    Aprobado: "Aprobado",
    Rechazado: "Rechazado",
    "En revision": "En revisión",
    Iniciado: "Iniciado",
    "Visto sin validar": "Visto sin validar",
  };

  const borderColor = estadoColor[form.estado] || "#ccc";

  return (
    <div className="form-card-formularios">
      <div
        className="form-card__band"
        style={{ backgroundColor: borderColor }}
      />
      <div className="form-card__body">
        {form.estado === "Rechazado" && (
          <div className="form-card__badge-rechazado">
            <FaTimesCircle /> Rechazado
          </div>
        )}

        <h3 className="form-card__title">Orden Nº {form.nro_orden}</h3>

        <div className="form-card__info">
          <p>
            <strong>Técnico ID:</strong> {form.tecnico_id}
          </p>
          {form.tecnico_nombre && (
            <p>
              <strong>Técnico:</strong> {form.tecnico_nombre}
            </p>
          )}
          <p>
            <strong>Cliente:</strong> #{form.nro_cliente}
          </p>
          <p>
            <strong>Estado:</strong>{" "}
            <span
              className={`estado-${form.estado
                .toLowerCase()
                .replace(/\s+/g, "-")}`}
            >
              {estadoLabel[form.estado]}
            </span>
          </p>
          <p>
            <strong>Fecha:</strong>{" "}
            {new Date(form.fecha_creacion).toLocaleString("es-AR")}
          </p>
        </div>

        <button
          className="btn btn-primary form-card__btn"
          onClick={() => navigate(`/formulario/${form.id_formulario}`)}
        >
          Ver detalles
        </button>
      </div>
    </div>
  );
}

export default FormularioCard;
