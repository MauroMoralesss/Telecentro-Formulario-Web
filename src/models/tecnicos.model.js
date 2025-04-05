import { pool } from "../db.js";

export const obtenerTodosLosTecnicos = async () => {
  const result = await pool.query("SELECT * FROM tecnicos");
  return result.rows;
};

export const obtenerTecnicoPorId = async (id) => {
  const result = await pool.query("SELECT * FROM tecnicos WHERE id_tecnico = $1", [id]);
  return result.rows[0];
};

export const cambiarEstadoTecnico = async (id, nuevoEstado) => {
  const result = await pool.query(
    "UPDATE tecnicos SET activo = $1 WHERE id_tecnico = $2 RETURNING *",
    [nuevoEstado, id]
  );
  return result.rows[0];
};
