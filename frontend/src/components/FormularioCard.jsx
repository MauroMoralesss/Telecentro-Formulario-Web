import { Link } from "react-router-dom";

const getColor = (estado) => {
  switch (estado) {
    case "Iniciado": return "#f0ad4e";
    case "En revision": return "#5bc0de";
    case "Aprobado": return "#5cb85c";
    case "Rechazado": return "#d9534f";
    default: return "#ccc";
  }
};

function FormularioCard({ form }) {
  const color = getColor(form.estado);

  return (
    <Link
      to={`/formulario/${form.id_formulario}`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div
        className="card"
        style={{
          borderLeft: `5px solid ${color}`,
          padding: 16,
          marginBottom: 16,
          borderRadius: 8,
          backgroundColor: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          transition: "transform 0.2s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
      >
        <p><strong>ID:</strong> {form.id_formulario}</p>
        <p><strong>ID Tecnico:</strong> {form.tecnico_id}</p>
        <p><strong>Orden:</strong> {form.nro_orden}</p>
        <p><strong>Cliente:</strong> {form.nro_cliente}</p>
        <p><strong>Estado:</strong> <span style={{ color }}>{form.estado}</span></p>
      </div>
    </Link>
  );
}

export default FormularioCard;
