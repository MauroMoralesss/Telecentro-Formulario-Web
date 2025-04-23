import { pool } from "../db.js";

export const crearFormulario = async ({
  tecnico_id,
  nro_orden,
  nro_cliente,
  nombre,
  domicilio,
  telefono,
  servicios_instalar,
}) => {
  const result = await pool.query(
    `INSERT INTO formulario (
      tecnico_id, nro_orden, nro_cliente, nombre, domicilio, fecha_modificacion, telefono, servicios_instalar
    ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6, $7) RETURNING *`,
    [tecnico_id, nro_orden, nro_cliente, nombre, domicilio, telefono, servicios_instalar]
  );
  return result.rows[0];
};

export const obtenerTodosFormularios = async () => {
  const result = await pool.query(`SELECT * FROM formulario`);
  return result.rows;
};

export const obtenerFormularioPorId = async (id) => {
  const result = await pool.query(
    `SELECT * FROM formulario WHERE id_formulario = $1`,
    [id]
  );
  return result.rows[0];
};

export const actualizarFormulario = async (id, datos) => {
  const campos = [];
  const valores = [];
  let i = 1;

  for (let campo in datos) {
    campos.push(`${campo} = $${i}`);
    valores.push(datos[campo]);
    i++;
  }

  campos.push(`fecha_modificacion = CURRENT_TIMESTAMP`);

  valores.push(id); // último valor es el id

  const result = await pool.query(
    `UPDATE formulario SET ${campos.join(", ")} WHERE id_formulario = $${i} RETURNING *`,
    valores
  );

  return result.rows[0];
};

export const obtenerFormulariosPorTecnico = async (tecnico_id) => {
  const result = await pool.query(
    `SELECT * FROM formulario WHERE tecnico_id = $1`,
    [tecnico_id]
  );
  return result.rows;
};
