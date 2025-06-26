import { pool } from "../db.js";

export const contratistasActivos = async (req, res) => {
  const result = await pool.query(
    "SELECT nombre, slug, logo_url, colores_tema FROM contratistas WHERE activo = true"
  );
  res.json(result.rows);
};

export const validarContratista = async (req, res) => {
  const { slug } = req.params;
  
  try {
    const result = await pool.query(
      "SELECT id_contratista, nombre, slug, activo FROM contratistas WHERE slug = $1",
      [slug]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        existe: false, 
        mensaje: "Contratista no encontrada" 
      });
    }
    
    const contratista = result.rows[0];
    
    if (!contratista.activo) {
      return res.status(400).json({ 
        existe: false, 
        mensaje: "Contratista inactiva" 
      });
    }
    
    res.json({ 
      existe: true, 
      contratista: {
        id: contratista.id_contratista,
        nombre: contratista.nombre,
        slug: contratista.slug
      }
    });
  } catch (error) {
    console.error("Error validando contratista:", error);
    res.status(500).json({ 
      existe: false, 
      mensaje: "Error interno del servidor" 
    });
  }
};
