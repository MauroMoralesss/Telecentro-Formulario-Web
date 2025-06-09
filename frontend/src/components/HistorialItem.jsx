import { FaClock, FaUser } from 'react-icons/fa';

const HistorialItem = ({ item }) => {
  // Función para formatear la fecha
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para renderizar valores de forma amigable
  const renderValorAmigable = (v) => {
    if (v === null || v === undefined || v === "null") return <span style={{ color: "#888" }}>Sin datos</span>;

    // Si es un string que parece un array serializado
    if (typeof v === "string" && v.startsWith("[") && v.endsWith("]")) {
      try {
        const arr = JSON.parse(v);
        if (Array.isArray(arr)) return arr.length ? arr.join(", ") : <span style={{ color: "#888" }}>Sin datos</span>;
      } catch { /* no es JSON válido */ }
    }

    // Si es un objeto de videos
    if (typeof v === "object" && v !== null && ("interior" in v || "exterior" in v || "extra" in v)) {
      return (
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {["interior", "exterior", "extra"].map((key) =>
            v[key]
              ? <li key={key}><a href={v[key]} target="_blank" rel="noopener noreferrer">{key.charAt(0).toUpperCase() + key.slice(1)}</a></li>
              : <li key={key}><span style={{ color: "#888" }}>{key.charAt(0).toUpperCase() + key.slice(1)}: Sin datos</span></li>
          )}
        </ul>
      );
    }

    // Si es un array de objetos (ej: dispositivos)
    if (Array.isArray(v)) {
      if (v.length === 0) return <span style={{ color: "#888" }}>Sin datos</span>;
      return (
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {v.map((obj, idx) =>
            typeof obj === "object"
              ? <li key={idx}>{Object.entries(obj).map(([k, val]) => <span key={k}><b>{k}:</b> {val ?? <span style={{ color: "#888" }}>Sin datos</span>} </span>)}</li>
              : <li key={idx}>{obj}</li>
          )}
        </ul>
      );
    }

    // Si es un objeto genérico
    if (typeof v === "object" && v !== null) {
      return (
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {Object.entries(v).map(([k, val]) =>
            <li key={k}><b>{k}:</b> {val === null ? <span style={{ color: "#888" }}>Sin datos</span> : String(val)}</li>
          )}
        </ul>
      );
    }

    // Valor simple
    return String(v);
  };

  // Función para formatear los campos modificados
  const formatearCampo = (campo, valor) => {
    // Si el valor es null, mostrar "No definido"
    if (valor.anterior === null) valor.anterior = "No definido";
    if (valor.nuevo === null) valor.nuevo = "No definido";

    // Formatear el campo para mejor legibilidad
    const formatearNombreCampo = (nombre) => {
      const nombres = {
        motivo_cierre: "Motivo de cierre",
        checklist: "Lista de verificación",
        observaciones: "Observaciones",
        estado: "Estado",
        // Agregar más mappings según necesidad
      };
      return nombres[nombre] || nombre;
    };

    // Personalización para acción 'Creación'
    if (item.accion && item.accion.toLowerCase() === 'creación') {
      return (
        <div className="campo-modificado" key={campo}>
          <span className="campo-nombre">{formatearNombreCampo(campo)}:</span>
          <div className="campo-valores">
            <span className="valor-nuevo">{renderValorAmigable(valor.nuevo)}</span>
          </div>
        </div>
      );
    }

    return (
      <div className="campo-modificado" key={campo}>
        <span className="campo-nombre">{formatearNombreCampo(campo)}:</span>
        <div className="campo-valores">
          <span className="valor-anterior">{renderValorAmigable(valor.anterior)}</span>
          <span className="flecha">→</span>
          <span className="valor-nuevo">{renderValorAmigable(valor.nuevo)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="historial-item">
      <div className="historial-header">
        <div className="historial-titulo">
          <h4>{item.accion}</h4>
          <span className="fecha">
            <FaClock className="icon-small" />
            {formatearFecha(item.fecha_accion)}
          </span>
        </div>
        <div className="historial-usuario">
          <FaUser className="icon-small" />
          <span>{item.tecnico_nombre || 'Usuario del sistema'}</span>
        </div>
      </div>
      
      <div className="historial-contenido">
        {item.campos_modificados && (
          <div className="campos-modificados">
            {Object.entries(item.campos_modificados).map(([campo, valor]) => 
              formatearCampo(campo, valor)
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistorialItem; 