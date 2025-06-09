import { useHistorial } from '../hooks/useHistorial';
import HistorialItem from './HistorialItem';
import { LoadingState } from './ui/LoadingState';
import '../styles/historial.css';
import React from 'react';

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

  const renderCampoModificado = (campo, valor, idx) => {
    if (!valor) return null;

    // Solo mostrar campos simples (string, number, boolean)
    if (typeof valor.nuevo === 'string' || typeof valor.nuevo === 'number' || typeof valor.nuevo === 'boolean') {
      return (
        <div className="campo-modificado" key={campo + idx}>
          <h4>{campo}:</h4>
          <div>
            <strong>Anterior:</strong> {valor.anterior || '—'}
          </div>
          <div>
            <strong>Nuevo:</strong> {valor.nuevo || '—'}
          </div>
        </div>
      );
    }

    // Si no es simple, no mostrar nada
    return null;
  };

  return (
    <div className="historial-container">
      <h3 className="historial-titulo-principal">Historial de Modificaciones</h3>
      <div className="historial-lista">
        {historial.map((item) => (
          <div key={item.id_historial} className="historial-item">
            <div className="historial-header">
              <span className="fecha">
                {new Date(item.fecha_accion).toLocaleString()}
              </span>
              <span className="accion">{item.accion}</span>
            </div>
            <div className="historial-detalles">
              <p>{item.detalles}</p>
              {item.campos_modificados && (
                <div className="campos-modificados">
                  {Object.entries(item.campos_modificados).map(([campo, valor], idx) => (
                    <div key={campo + idx}>
                      {renderCampoModificado(campo, valor, idx)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistorialFormulario; 