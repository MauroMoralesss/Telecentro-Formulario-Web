import bcrypt from "bcrypt";
import { pool } from "../db.js";
import { createAccessToken } from "../libs/jwt.js";

export const signin = async (req, res) => {
  const { id_tecnico, password, slug_contratista } = req.body;

  // Primero verificamos que el contratista existe y está activo
  const contratistaResult = await pool.query(
    "SELECT * FROM contratistas WHERE slug = $1 AND activo = true",
    [slug_contratista]
  );

  if (contratistaResult.rowCount === 0) {
    return res.status(400).json({
      message: "Contratista no encontrado o inactivo",
    });
  }

  const contratista = contratistaResult.rows[0];

  const result = await pool.query(
    "SELECT * FROM tecnicos WHERE id_tecnico = $1 AND id_contratista = $2",
    [id_tecnico, contratista.id_contratista]
  );

  if (result.rowCount === 0) {
    return res.status(400).json({
      message: "El ID no está registrado para este contratista",
    });
  }

  const tecnico = result.rows[0];

  // ✅ Nueva validación: si el técnico está inactivo
  if (!tecnico.activo) {
    return res.status(403).json({
      message: "El técnico está inactivo y no puede iniciar sesión",
    });
  }

  const validPassword = await bcrypt.compare(password, tecnico.password);

  if (!validPassword) {
    return res.status(400).json({
      message: "La contraseña es incorrecta",
    });
  }

  const token = await createAccessToken({
    id: tecnico.id_tecnico,
    rol: tecnico.rol,
    id_contratista: contratista.id_contratista,
    slug_contratista: contratista.slug
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000,
  });

  return res.json({
    id: tecnico.id_tecnico,
    nombre: tecnico.nombre,
    email: tecnico.email,
    rol: tecnico.rol,
    contratista: {
      id: contratista.id_contratista,
      nombre: contratista.nombre,
      slug: contratista.slug,
      colores_tema: contratista.colores_tema
    }
  });
};

export const signup = async (req, res) => {
  const { id_tecnico, nombre, email, password, rol, activo, telefono } =
    req.body;

  try {
    const existeId = await pool.query(
      "SELECT * FROM tecnicos WHERE id_tecnico = $1",
      [id_tecnico]
    );
    if (existeId.rows.length > 0) {
      return res.status(400).json({ message: "El ID ya está registrado" });
    }

    const existeEmail = await pool.query(
      "SELECT * FROM tecnicos WHERE email = $1",
      [email]
    );
    if (existeEmail.rows.length > 0) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }

    if (!/^\d{8,20}$/.test(telefono)) {
      return res.status(400).json({
        message:
          "El teléfono debe contener solo números y tener entre 8 y 20 dígitos",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO tecnicos (id_tecnico, nombre, email, password, rol, activo, telefono, id_contratista) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      [id_tecnico, nombre, email, hashedPassword, rol, activo, telefono, req.id_contratista]
    );

    res.status(201).json({ message: "Técnico registrado correctamente" });
  } catch (error) {
    console.error("Error al registrar técnico:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

export const signout = (req, res) => {
  res.clearCookie("token");
  res.sendStatus(200);
};

export const profile = async (req, res) => {
  const result = await pool.query(
    `SELECT t.*, c.nombre as nombre_contratista, c.slug as slug_contratista, c.colores_tema 
     FROM tecnicos t 
     JOIN contratistas c ON t.id_contratista = c.id_contratista 
     WHERE t.id_tecnico = $1`,
    [req.userId]
  );
  
  if (result.rowCount === 0) {
    return res.status(404).json({
      message: "Usuario no encontrado",
    });
  }
  
  const usuario = result.rows[0];
  
  return res.json({
    id: usuario.id_tecnico,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
    contratista: {
      id: usuario.id_contratista,
      nombre: usuario.nombre_contratista,
      slug: usuario.slug_contratista,
      colores_tema: usuario.colores_tema
    }
  });
};
