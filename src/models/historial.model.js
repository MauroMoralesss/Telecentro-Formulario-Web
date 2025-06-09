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
export const obtenerHistorialFormulario = async (formulario_id, id_contratista) => {
  const query = `
    SELECT 
      h.*,
      t.nombre as tecnico_nombre,
      t.email as tecnico_email,
      c.nombre as nombre_contratista,
      c.slug as slug_contratista
    FROM historial_formulario h
    LEFT JOIN tecnicos t ON h.tecnico_id = t.id_tecnico
    LEFT JOIN formulario f ON h.formulario_id = f.id_formulario
    LEFT JOIN contratistas c ON f.id_contratista = c.id_contratista
    WHERE h.formulario_id = $1 AND f.id_contratista = $2
    ORDER BY h.fecha_accion DESC
  `;

  const result = await pool.query(query, [formulario_id, id_contratista]);
  return result.rows;
};

/**
 * Obtiene estadísticas del historial de un formulario
 */
export const obtenerEstadisticasHistorial = async (formulario_id, id_contratista) => {
  try {
    const queries = {
      // Resumen general
      resumenGeneral: `
        SELECT 
          COUNT(*) as total_cambios,
          COUNT(DISTINCT h.tecnico_id) as total_tecnicos,
          MIN(h.fecha_accion) as primera_accion,
          MAX(h.fecha_accion) as ultima_accion,
          EXTRACT(EPOCH FROM (MAX(h.fecha_accion) - MIN(h.fecha_accion))) as tiempo_total_segundos
        FROM historial_formulario h
        JOIN formulario f ON h.formulario_id = f.id_formulario
        WHERE h.formulario_id = $1 AND f.id_contratista = $2
      `,
      
      // Acciones por tipo
      accionesPorTipo: `
        SELECT 
          h.accion,
          COUNT(*) as total,
          ROUND(COUNT(*) * 100.0 / (
            SELECT COUNT(*) 
            FROM historial_formulario h2
            JOIN formulario f ON h2.formulario_id = f.id_formulario
            WHERE h2.formulario_id = $1 AND f.id_contratista = $2
          ), 2) as porcentaje
        FROM historial_formulario h
        JOIN formulario f ON h.formulario_id = f.id_formulario
        WHERE h.formulario_id = $1 AND f.id_contratista = $2
        GROUP BY h.accion
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
        JOIN formulario f ON h.formulario_id = f.id_formulario
        WHERE h.formulario_id = $1 AND f.id_contratista = $2
        GROUP BY t.nombre
        ORDER BY total_acciones DESC
      `
    };

    const results = await Promise.all([
      pool.query(queries.resumenGeneral, [formulario_id, id_contratista]),
      pool.query(queries.accionesPorTipo, [formulario_id, id_contratista]),
      pool.query(queries.actividadPorTecnico, [formulario_id, id_contratista])
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
      actividadPorTecnico: results[2].rows || []
    };
  } catch (error) {
    console.error('Error en obtenerEstadisticasHistorial:', error);
    throw error;
  }
}; 