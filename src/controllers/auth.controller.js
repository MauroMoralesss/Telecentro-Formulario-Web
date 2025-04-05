import bcrypt from "bcrypt";
import { pool } from "../db.js";
import { createAccessToken } from "../libs/jwt.js";

export const signin = async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.query("SELECT * FROM tecnicos WHERE email = $1", [
    email,
  ]);

  if (result.rowCount === 0) {
    return res.status(400).json({
      message: "El correo no está registrado",
    });
  }

  const tecnico = result.rows[0];
  const validPassword = await bcrypt.compare(password, tecnico.password);

  if (!validPassword) {
    return res.status(400).json({
      message: "La contraseña es incorrecta",
    });
  }

  const token = await createAccessToken({ id: tecnico.id_tecnico, rol: tecnico.rol });

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
  });
};

export const signup = async (req, res, next) => {
  const { nombre, email, password, rol } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO tecnicos(nombre, email, password, rol) VALUES($1, $2, $3, $4) RETURNING *",
      [nombre, email, hashedPassword, rol || "tecnico"]
    );

    return res.json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({
        message: "El correo ya está registrado",
      });
    }

    next(error);
  }
};

export const signout = (req, res) => {
  res.clearCookie("token");
  res.sendStatus(200);
};

export const profile = async (req, res) => {
  const result = await pool.query("SELECT * FROM tecnicos WHERE id_tecnico = $1", [
    req.userId,
  ]);
  return res.json(result.rows[0]);
};