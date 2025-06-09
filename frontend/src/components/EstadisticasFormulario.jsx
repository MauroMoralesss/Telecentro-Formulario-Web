import React from 'react';
import { 
  FaHistory, 
  FaUser, 
  FaClock, 
  FaEdit,
  FaExchangeAlt,
  FaCalendarAlt,
  FaUsers,
  FaChartLine
} from 'react-icons/fa';
import '../styles/estadisticas.css';

export const EstadisticasFormulario = ({ estadisticas }) => {
  if (!estadisticas) {
    return (
      <div className="sin-datos">
        <p>No hay estadísticas disponibles</p>
      </div>
    );
  }

  console.log('Estadísticas recibidas:', estadisticas);

  const {
    resumenGeneral = {},
    accionesPorTipo = [],
    actividadPorTecnico = [],
    flujoEstados = [],
    camposModificados = [],
    actividadPorPeriodo = []
  } = estadisticas;

  const formatearFecha = (fecha) => {
    if (!fecha) return 'No disponible';
    return new Date(fecha).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearTiempo = (segundos) => {
    if (!segundos) return '0m';
    const dias = Math.floor(segundos / (24 * 3600));
    const horas = Math.floor((segundos % (24 * 3600)) / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    
    if (dias > 0) return `${dias}d ${horas}h`;
    if (horas > 0) return `${horas}h ${minutos}m`;
    return `${minutos}m`;
  };

  const calcularTiempoTotal = () => {
    if (!resumenGeneral.primera_accion || !resumenGeneral.ultima_accion) return 'No disponible';
    return formatearTiempo(resumenGeneral.tiempo_total_segundos);
  };

  const renderValor = (valor) => {
    if (Array.isArray(valor)) {
      return (
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {valor.map((v, i) => (
            <li key={i}>{renderValor(v)}</li>
          ))}
        </ul>
      );
    }
    if (typeof valor === 'object' && valor !== null) {
      // Si es un objeto de videos, NO mostrar nada en estadísticas
      if (
        Object.keys(valor).length &&
        ['interior', 'exterior', 'extra'].some((k) => Object.keys(valor).includes(k))
      ) {
        return <span style={{ color: '#888' }}>No aplica</span>;
      }
      // Si es otro objeto, mostrarlo como string legible en <pre>
      return <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: '#f8f8f8', borderRadius: 4, padding: 4 }}>{JSON.stringify(valor, null, 2)}</pre>;
    }
    return <>{valor}</>;
  };

  const esObjetoVideo = (valor) =>
    valor && typeof valor === 'object' &&
    ['interior', 'exterior', 'extra'].some(k => Object.keys(valor).includes(k));

  return (
    <div className="estadisticas-contenedor">
      {/* Resumen General */}
      <div className="estadisticas-resumen">
        <div className="estadistica-card">
          <div className="estadistica-header">
            <FaHistory className="icon" />
            <h3>Total de cambios</h3>
          </div>
          <div className="estadistica-valor">
            {resumenGeneral?.total_cambios || 0}
          </div>
          <div className="estadistica-subtexto">
            Desde {formatearFecha(resumenGeneral?.primera_accion)}
          </div>
        </div>

        <div className="estadistica-card">
          <div className="estadistica-header">
            <FaUsers className="icon" />
            <h3>Técnicos involucrados</h3>
          </div>
          <div className="estadistica-valor">
            {resumenGeneral?.total_tecnicos || 0}
          </div>
        </div>

        <div className="estadistica-card">
          <div className="estadistica-header">
            <FaClock className="icon" />
            <h3>Tiempo total de proceso</h3>
          </div>
          <div className="estadistica-valor">
            {calcularTiempoTotal()}
          </div>
          <div className="estadistica-subtexto">
            Última actividad: {formatearFecha(resumenGeneral?.ultima_accion)}
          </div>
        </div>
      </div>

      {/* Acciones por Tipo */}
      {accionesPorTipo?.length > 0 && (
        <div className="estadistica-seccion">
          <h3>
            <FaChartLine className="icon-titulo" />
            Distribución de acciones
          </h3>
          <div className="grafico-barras">
            {accionesPorTipo.map((accion, index) => (
              <div key={index} className="barra-container">
                <span className="barra-etiqueta">{accion.accion}</span>
                <div className="barra">
                  <div 
                    className="barra-relleno"
                    style={{ 
                      width: `${accion.porcentaje}%`,
                      backgroundColor: getColorPorAccion(accion.accion)
                    }}
                  />
                </div>
                <div className="barra-valor">{renderValor(accion.total)} ({renderValor(accion.porcentaje)}%)</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actividad por Técnico */}
      {actividadPorTecnico?.length > 0 && (
        <div className="estadistica-seccion">
          <h3>
            <FaUser className="icon-titulo" />
            Actividad por técnico
          </h3>
          <div className="tabla-actividad">
            {actividadPorTecnico.map((tecnico, index) => (
              <div key={index} className="actividad-tecnico">
                <div className="tecnico-header">
                  <span className="tecnico-nombre">
                    <FaUser className="icon-small" />
                    {tecnico.tecnico_nombre || 'Sin nombre'}
                  </span>
                  <span className="tecnico-total">{renderValor(tecnico.total_acciones)} acciones</span>
                </div>
                <div className="tecnico-detalles">
                  <div className="detalle-item">
                    <span className="detalle-label">Tipos de acciones:</span>
                    <span className="detalle-valor">{renderValor(tecnico.tipos_acciones)}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Primera actividad:</span>
                    <span className="detalle-valor">{renderValor(formatearFecha(tecnico.primera_accion))}</span>
                  </div>
                  <div className="detalle-item">
                    <span className="detalle-label">Última actividad:</span>
                    <span className="detalle-valor">{renderValor(formatearFecha(tecnico.ultima_accion))}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Flujo de Estados */}
      {flujoEstados?.length > 0 && (
        <div className="estadistica-seccion">
          <h3>
            <FaExchangeAlt className="icon-titulo" />
            Flujo de estados
          </h3>
          <div className="flujo-estados">
            {flujoEstados.map((cambio, index) => (
              <div key={index} className="estado-cambio">
                <div className="estado-header">
                  <span className="estado-anterior">{renderValor(cambio.estado_anterior || 'Inicio')}</span>
                  <FaExchangeAlt className="icon-small" />
                  <span className="estado-nuevo">{renderValor(cambio.estado_nuevo)}</span>
                </div>
                <div className="estado-detalles">
                  <span className="estado-total">{renderValor(cambio.total)} veces</span>
                  <span className="estado-tiempo">
                    Tiempo promedio: {renderValor(formatearTiempo(cambio.tiempo_promedio_segundos))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actividad por Período */}
      {actividadPorPeriodo?.length > 0 && (
        <div className="estadistica-seccion">
          <h3>
            <FaCalendarAlt className="icon-titulo" />
            Actividad diaria
          </h3>
          <div className="actividad-diaria">
            {actividadPorPeriodo.map((dia, index) => (
              <div key={index} className="dia-actividad">
                <div className="dia-fecha">
                  {new Date(dia.fecha).toLocaleDateString('es-AR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </div>
                <div className="dia-detalles">
                  <span className="dia-total">{renderValor(dia.total_acciones)} acciones</span>
                  <span className="dia-tipos">{renderValor(dia.tipos_acciones)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Campos Modificados */}
      {camposModificados?.length > 0 && (
        <div className="estadistica-seccion">
          <h3>
            <FaEdit className="icon-titulo" />
            Campos más modificados
          </h3>
          <div className="grafico-barras">
            {camposModificados
              .filter(campo => !esObjetoVideo(campo.valor))
              .map((campo, index) => (
                <div key={index} className="barra-container">
                  <span className="barra-etiqueta">
                    <FaEdit className="icon-small" />
                    {renderValor(formatearNombreCampo(campo.campo))}
                  </span>
                  <div className="barra">
                    <div 
                      className="barra-relleno"
                      style={{ 
                        width: `${(campo.total_modificaciones / resumenGeneral?.total_cambios) * 100}%` 
                      }}
                    />
                  </div>
                  <div className="barra-valor">{renderValor(campo.valor)}</div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Funciones auxiliares
const getColorPorAccion = (accion) => {
  switch (accion?.toLowerCase()) {
    case 'creación':
      return '#3b82f6';
    case 'edición':
      return '#8b5cf6';
    case 'completar formulario':
      return '#10b981';
    case 'cambio de estado':
      return '#f59e0b';
    default:
      return '#6b7280';
  }
};

const formatearNombreCampo = (campo) => {
  const nombres = {
    motivo_cierre: 'Motivo de cierre',
    checklist: 'Lista de verificación',
    observaciones: 'Observaciones',
    estado: 'Estado',
    nro_orden: 'Número de orden',
    nro_cliente: 'Número de cliente',
    nombre: 'Nombre',
    domicilio: 'Domicilio',
    telefono: 'Teléfono',
    servicios_instalar: 'Servicios a instalar'
  };
  return nombres[campo] || campo;
}; 