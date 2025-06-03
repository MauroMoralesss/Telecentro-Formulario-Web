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
            <span className="valor-nuevo">{valor.nuevo}</span>
          </div>
        </div>
      );
    }

    return (
      <div className="campo-modificado" key={campo}>
        <span className="campo-nombre">{formatearNombreCampo(campo)}:</span>
        <div className="campo-valores">
          <span className="valor-anterior">{valor.anterior}</span>
          <span className="flecha">→</span>
          <span className="valor-nuevo">{valor.nuevo}</span>
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