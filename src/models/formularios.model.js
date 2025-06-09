import { pool } from "../db.js";

export const crearFormulario = async ({
  tecnico_id,
  nro_orden,
  nro_cliente,
  nombre,
  domicilio,
  telefono,
  servicios_instalar,
  id_contratista
}) => {
  const result = await pool.query(
    `INSERT INTO formulario (
      tecnico_id, nro_orden, nro_cliente, nombre, domicilio, fecha_modificacion, telefono, servicios_instalar, id_contratista
    ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6, $7, $8) RETURNING *`,
    [
      tecnico_id,
      nro_orden,
      nro_cliente,
      nombre,
      domicilio,
      telefono,
      servicios_instalar,
      id_contratista
    ]
  );
  return result.rows[0];
};

export const obtenerTodosFormularios = async (id_contratista) => {
  const result = await pool.query(`SELECT 
      f.*, 
      t.nombre AS tecnico_nombre,
      c.nombre as nombre_contratista,
      c.slug as slug_contratista
    FROM formulario f
    LEFT JOIN tecnicos t ON f.tecnico_id = t.id_tecnico
    LEFT JOIN contratistas c ON f.id_contratista = c.id_contratista
    WHERE f.id_contratista = $1
    ORDER BY f.fecha_creacion DESC`, [id_contratista]);
  return result.rows;
};

export const obtenerFormularioPorId = async (id, id_contratista) => {
  const result = await pool.query(
    `SELECT f.*, 
      t.nombre as tecnico_nombre, 
      t.email as tecnico_email,
      c.nombre as nombre_contratista,
      c.slug as slug_contratista
     FROM formulario f
     LEFT JOIN tecnicos t ON f.tecnico_id = t.id_tecnico
     LEFT JOIN contratistas c ON f.id_contratista = c.id_contratista
     WHERE f.id_formulario = $1 AND f.id_contratista = $2`,
    [id, id_contratista]
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
    `UPDATE formulario SET ${campos.join(
      ", "
    )} WHERE id_formulario = $${i} RETURNING *`,
    valores
  );

  return result.rows[0];
};

export const obtenerFormulariosPorTecnico = async (tecnico_id, id_contratista) => {
  const result = await pool.query(
    `SELECT f.*, 
      c.nombre as nombre_contratista,
      c.slug as slug_contratista
     FROM formulario f
     LEFT JOIN contratistas c ON f.id_contratista = c.id_contratista
     WHERE f.tecnico_id = $1 AND f.id_contratista = $2`,
    [tecnico_id, id_contratista]
  );
  return result.rows;
};

/**
 * Actualiza los campos básicos de un formulario
 * @param {number} id_formulario - ID del formulario a actualizar
 * @param {Object} datos - Datos a actualizar
 * @returns {Promise<Object>} Formulario actualizado
 */
export const editarCamposBasicos = async (id_formulario, datos) => {
  if (!id_formulario) {
    throw new Error('ID de formulario es requerido');
  }

  try {
    const query = `
      UPDATE formulario SET 
        tecnico_id = $1,
        nro_orden = $2,
        nro_cliente = $3,
        nombre = $4,
        domicilio = $5,
        telefono = $6,
        servicios_instalar = $7,
        fecha_modificacion = CURRENT_TIMESTAMP
      WHERE id_formulario = $8 AND id_contratista = $9
      RETURNING *
    `;

    const values = [
      datos.tecnico_id,
      datos.nro_orden,
      datos.nro_cliente,
      datos.nombre,
      datos.domicilio,
      datos.telefono,
      datos.servicios_instalar,
      id_formulario,
      datos.id_contratista
    ];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      throw new Error(`No se encontró el formulario con ID ${id_formulario}`);
    }

    return result.rows[0];
  } catch (error) {
    console.error('Error en editarCamposBasicos:', error);
    if (error.code === '23505') { // Error de duplicación
      throw new Error('Ya existe un formulario con ese número de orden');
    }
    throw error;
  }
};
