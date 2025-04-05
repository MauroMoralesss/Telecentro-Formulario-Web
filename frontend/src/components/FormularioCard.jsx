import { Link } from "react-router-dom";

const getColor = (estado) => {
    switch (estado) {
      case "Iniciado": return "#f0ad4e";      // amarillo
      case "En revision": return "#5bc0de";   // celeste
      case "Aprobado": return "#5cb85c";      // verde
      case "Rechazado": return "#d9534f";     // rojo
      default: return "#ccc";
    }
  };
  
  function FormularioCard({ form }) {
    const color = getColor(form.estado);
  
    return (
      <Link to={`/formulario/${form.id_formulario}`} style={{ textDecoration: "none", color: "inherit" }}>
      <div style={{
        border: `2px solid ${color}`,
        padding: 12,
        marginBottom: 8,
        borderRadius: 6
      }}>
        <p><strong>ID:</strong> {form.id_formulario}</p>
        <p><strong>Orden:</strong> {form.nro_orden}</p>
        <p><strong>Cliente:</strong> {form.nro_cliente}</p>
        <p><strong>Estado:</strong> <span style={{ color }}>{form.estado}</span></p>
      </div>
    </Link>
    );
  }
  
  export default FormularioCard;
  