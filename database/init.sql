CREATE TYPE rol_tecnico AS ENUM ('admin', 'tecnico');
CREATE TYPE estado_formulario AS ENUM ('Iniciado', 'En revision', 'Aprobado', 'Rechazado');
CREATE TYPE motivo_cierre_enum AS ENUM ('Evento fuera de norma', 'Conformidad de cliente', 'Varios / otros');

CREATE TABLE tecnicos (
  id_tecnico SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  rol rol_tecnico DEFAULT 'tecnico' NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE formulario (
  id_formulario SERIAL PRIMARY KEY,
  tecnico_id INTEGER REFERENCES tecnicos(id_tecnico),
  nro_orden VARCHAR(255) NOT NULL,
  nro_cliente VARCHAR(255) NOT NULL,
  abonado VARCHAR(255) NOT NULL,
  vt VARCHAR(255) NOT NULL,
  estado estado_formulario DEFAULT 'Iniciado' NOT NULL,
  motivo_cierre motivo_cierre_enum NOT NULL,
  checklist TEXT NOT NULL,
  url_archivo VARCHAR(500),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  observaciones TEXT,
  activo BOOLEAN DEFAULT TRUE
);

INSERT INTO tecnicos (nombre, email, password, rol, activo)
VALUES (
  'Admin Principal',
  'admin@telecentro.com',
  '$2b$10$UdELc/VYgN7El5SXeyvime8PqyNzjsfMu/GEaOV6a/R7ordbKYKWG',
  'admin',
  true
);

ALTER TABLE formulario ALTER COLUMN motivo_cierre DROP NOT NULL;
ALTER TABLE formulario ALTER COLUMN checklist DROP NOT NULL;

/* INSERT INTO opciones_checklist (opcion)
VALUES 
  ('Cableado realizado correctamente'),
  ('Inconveniente con cliente'),
  ('Daño a la propiedad');
 */
