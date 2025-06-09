import { pool } from "../db.js";

export const obtenerTodosLosTecnicos = async (id_contratista) => {
  const result = await pool.query(
    `SELECT t.*, c.nombre as nombre_contratista, c.slug as slug_contratista
     FROM tecnicos t
     LEFT JOIN contratistas c ON t.id_contratista = c.id_contratista
     WHERE t.id_contratista = $1`,
    [id_contratista]
  );
  return result.rows;
};

export const obtenerTecnicoPorId = async (id, id_contratista) => {
  const result = await pool.query(
    `SELECT t.*, c.nombre as nombre_contratista, c.slug as slug_contratista
     FROM tecnicos t
     LEFT JOIN contratistas c ON t.id_contratista = c.id_contratista
     WHERE t.id_tecnico = $1 AND t.id_contratista = $2`,
    [id, id_contratista]
  );
  return result.rows[0];
};

export const cambiarEstadoTecnico = async (id, activo, id_contratista) => {
  const result = await pool.query(
    `UPDATE tecnicos 
     SET activo = $1 
     WHERE id_tecnico = $2 AND id_contratista = $3 
     RETURNING *`,
    [activo, id, id_contratista]
  );
  return result.rows[0];
};
