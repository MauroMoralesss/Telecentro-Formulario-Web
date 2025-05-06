import { pool } from "../db.js";

/**
 * Borra todos los dispositivos asociados a un formulario
 */
export const borrarDispositivosPorFormulario = async (formularioId) => {
  await pool.query(
    `DELETE FROM dispositivo WHERE formulario_id = $1`,
    [formularioId]
  );
};

/**
 * Inserta un array de { tipo, mac } para un formulario
 */
export const crearDispositivos = async (formularioId, dispositivos) => {
  if (!dispositivos.length) return;
  // Generamos VALUES dinámicamente: ($1, $2, $3), ($1, $4, $5), …
  const rowsSql = dispositivos
    .map((_, i) => `($1, $${i * 2 + 2}, $${i * 2 + 3})`)
    .join(", ");
  const params = [formularioId];
  dispositivos.forEach((d) => {
    params.push(d.tipo, d.mac);
  });

  await pool.query(
    `INSERT INTO dispositivo (formulario_id, tipo, mac) VALUES ${rowsSql}`,
    params
  );
};

/**
 * Trae todos los dispositivos de un formulario
 */
export const obtenerDispositivosPorFormulario = async (formularioId) => {
  const result = await pool.query(
    `SELECT id_dispositivo, tipo, mac
       FROM dispositivo
      WHERE formulario_id = $1`,
    [formularioId]
  );
  return result.rows;
};
