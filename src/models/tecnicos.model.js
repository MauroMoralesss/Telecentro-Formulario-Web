import { pool } from "../db.js";

export const obtenerTodosLosTecnicos = async () => {
  const result = await pool.query("SELECT * FROM tecnicos");
  return result.rows;
};