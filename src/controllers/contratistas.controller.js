import { pool } from "../db.js";

export const contratistasActivos = async (req, res) => {
  const result = await pool.query(
    "SELECT nombre, slug, logo_url, colores_tema FROM contratistas WHERE activo = true"
  );
  res.json(result.rows);
};
