import { useHistorial } from '../hooks/useHistorial';
import HistorialItem from './HistorialItem';
import { LoadingState } from './ui/LoadingState';
import '../styles/historial.css';

const HistorialFormulario = ({ formularioId }) => {
  const { 
    historial, 
    isLoading, 
    error 
  } = useHistorial(formularioId);

  if (isLoading) {
    return <LoadingState mensaje="Cargando historial..." />;
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-mensaje">Error al cargar el historial: {error}</p>
      </div>
    );
  }

  if (!historial || historial.length === 0) {
    return (
      <div className="empty-state">
        <p>No hay registros en el historial</p>
      </div>
    );
  }

  return (
    <div className="historial-container">
      <h3 className="historial-titulo-principal">Historial de Modificaciones</h3>
      <div className="historial-lista">
        {historial.map((item) => (
          <HistorialItem 
            key={item.id_historial} 
            item={item} 
            className={`historial-item ${item.accion.toLowerCase()}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HistorialFormulario; 