import { pool } from "../db.js";

/**
 * Registra una nueva entrada en el historial
 */
export const registrarAccion = async ({
  formulario_id,
  tecnico_id,
  accion,
  detalles,
  estado_anterior,
  estado_nuevo,
  campos_modificados
}) => {
  const query = `
    INSERT INTO historial_formulario (
      formulario_id,
      tecnico_id,
      accion,
      detalles,
      estado_anterior,
      estado_nuevo,
      campos_modificados
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;

  const values = [
    formulario_id,
    tecnico_id,
    accion,
    detalles,
    estado_anterior,
    estado_nuevo,
    campos_modificados ? JSON.stringify(campos_modificados) : null
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Obtiene el historial completo de un formulario
 */
export const obtenerHistorialFormulario = async (formulario_id) => {
  const query = `
    SELECT 
      h.*,
      t.nombre as tecnico_nombre,
      t.email as tecnico_email
    FROM historial_formulario h
    LEFT JOIN tecnicos t ON h.tecnico_id = t.id_tecnico
    WHERE h.formulario_id = $1
    ORDER BY h.fecha_accion DESC
  `;

  const result = await pool.query(query, [formulario_id]);
  return result.rows;
};

/**
 * Obtiene estadísticas del historial de un formulario
 */
export const obtenerEstadisticasHistorial = async (formulario_id) => {
  try {
    const queries = {
      // Resumen general
      resumenGeneral: `
        SELECT 
          COUNT(*) as total_cambios,
          COUNT(DISTINCT tecnico_id) as total_tecnicos,
          MIN(fecha_accion) as primera_accion,
          MAX(fecha_accion) as ultima_accion,
          EXTRACT(EPOCH FROM (MAX(fecha_accion) - MIN(fecha_accion))) as tiempo_total_segundos
        FROM historial_formulario
        WHERE formulario_id = $1
      `,
      
      // Acciones por tipo
      accionesPorTipo: `
        SELECT 
          accion,
          COUNT(*) as total,
          ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM historial_formulario WHERE formulario_id = $1), 2) as porcentaje
        FROM historial_formulario
        WHERE formulario_id = $1
        GROUP BY accion
        ORDER BY total DESC
      `,
      
      // Actividad por técnico
      actividadPorTecnico: `
        SELECT 
          t.nombre as tecnico_nombre,
          COUNT(*) as total_acciones,
          STRING_AGG(DISTINCT h.accion, ', ') as tipos_acciones,
          MIN(h.fecha_accion) as primera_accion,
          MAX(h.fecha_accion) as ultima_accion
        FROM historial_formulario h
        LEFT JOIN tecnicos t ON h.tecnico_id = t.id_tecnico
        WHERE h.formulario_id = $1
        GROUP BY t.nombre
        ORDER BY total_acciones DESC
      `,
      
      // Flujo de estados
      flujoEstados: `
        WITH estados_ordenados AS (
          SELECT 
            estado_anterior,
            estado_nuevo,
            fecha_accion,
            LEAD(fecha_accion) OVER (ORDER BY fecha_accion) as siguiente_fecha,
            ROW_NUMBER() OVER (ORDER BY fecha_accion) as orden
          FROM historial_formulario
          WHERE formulario_id = $1
            AND (estado_anterior IS NOT NULL OR estado_nuevo IS NOT NULL)
          ORDER BY fecha_accion
        )
        SELECT 
          estado_anterior,
          estado_nuevo,
          COUNT(*) as total,
          ROUND(AVG(EXTRACT(EPOCH FROM (siguiente_fecha - fecha_accion)))) as tiempo_promedio_segundos
        FROM estados_ordenados
        WHERE siguiente_fecha IS NOT NULL
        GROUP BY estado_anterior, estado_nuevo
        ORDER BY MIN(orden)
      `,
      
      // Campos más modificados con detalles
      camposModificados: `
        WITH campos_json AS (
          SELECT 
            jsonb_object_keys(campos_modificados) as campo,
            fecha_accion,
            campos_modificados
          FROM historial_formulario
          WHERE formulario_id = $1
            AND campos_modificados IS NOT NULL
        )
        SELECT 
          campo,
          COUNT(*) as total_modificaciones,
          MIN(fecha_accion) as primera_modificacion,
          MAX(fecha_accion) as ultima_modificacion
        FROM campos_json
        GROUP BY campo
        ORDER BY total_modificaciones DESC
      `,

      // Actividad por período
      actividadPorPeriodo: `
        SELECT 
          DATE_TRUNC('day', fecha_accion) as fecha,
          COUNT(*) as total_acciones,
          STRING_AGG(DISTINCT accion, ', ') as tipos_acciones
        FROM historial_formulario
        WHERE formulario_id = $1
        GROUP BY DATE_TRUNC('day', fecha_accion)
        ORDER BY fecha DESC
      `
    };

    const results = await Promise.all([
      pool.query(queries.resumenGeneral, [formulario_id]),
      pool.query(queries.accionesPorTipo, [formulario_id]),
      pool.query(queries.actividadPorTecnico, [formulario_id]),
      pool.query(queries.flujoEstados, [formulario_id]),
      pool.query(queries.camposModificados, [formulario_id]),
      pool.query(queries.actividadPorPeriodo, [formulario_id])
    ]);

    return {
      resumenGeneral: results[0].rows[0] || {
        total_cambios: 0,
        total_tecnicos: 0,
        primera_accion: null,
        ultima_accion: null,
        tiempo_total_segundos: 0
      },
      accionesPorTipo: results[1].rows || [],
      actividadPorTecnico: results[2].rows || [],
      flujoEstados: results[3].rows || [],
      camposModificados: results[4].rows || [],
      actividadPorPeriodo: results[5].rows || []
    };
  } catch (error) {
    console.error('Error en obtenerEstadisticasHistorial:', error);
    throw error;
  }
}; 