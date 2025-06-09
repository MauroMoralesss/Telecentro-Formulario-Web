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

ALTER TYPE motivo_cierre_enum ADD VALUE 'Instalacion ok';
ALTER TYPE motivo_cierre_enum ADD VALUE 'Conformidad del cliente';
ALTER TYPE motivo_cierre_enum ADD VALUE 'Desconformidad del cliente';
ALTER TYPE motivo_cierre_enum ADD VALUE 'Ausente';
ALTER TYPE motivo_cierre_enum ADD VALUE 'Datos erróneos';

/* reemplazar los antiguos con los nuevos

UPDATE formulario
SET motivo_cierre = 'Conformidad del cliente'
WHERE motivo_cierre = 'Conformidad de cliente';

UPDATE formulario
SET motivo_cierre = 'Varios / otros'
WHERE motivo_cierre = 'Evento fuera de norma'; */

ALTER TABLE formulario ADD COLUMN motivo_rechazo TEXT;
ALTER TABLE formulario ADD COLUMN fecha_modificacion TIMESTAMP;

ALTER TABLE tecnicos ADD COLUMN telefono VARCHAR(20);

ALTER TABLE formulario
RENAME COLUMN abonado TO nombre;

ALTER TABLE formulario
RENAME COLUMN vt TO domicilio;

ALTER TABLE formulario
ADD COLUMN telefono VARCHAR(20);

ALTER TYPE estado_formulario ADD VALUE 'Visto sin validar';

ALTER TABLE formulario
ADD COLUMN url_video_interior TEXT,
ADD COLUMN url_video_exterior TEXT;

ALTER TABLE formulario
ADD COLUMN latitud DOUBLE PRECISION,
ADD COLUMN longitud DOUBLE PRECISION;

CREATE TABLE public.dispositivo (
  id_dispositivo serial PRIMARY KEY,
  formulario_id integer NOT NULL
    REFERENCES public.formulario(id_formulario)
    ON DELETE CASCADE,
  tipo varchar(50)    NOT NULL,
  mac  varchar(50)    NOT NULL
);

ALTER TABLE dispositivo DROP CONSTRAINT dispositivo_formulario_id_key;

ALTER TABLE formulario ADD COLUMN url_video_extra TEXT;

-- Tabla para el historial de formularios
CREATE TABLE IF NOT EXISTS historial_formulario (
  id_historial SERIAL PRIMARY KEY,
  formulario_id INTEGER REFERENCES formulario(id_formulario),
  tecnico_id INTEGER REFERENCES tecnicos(id_tecnico),
  fecha_accion TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  accion VARCHAR(50) NOT NULL,
  detalles TEXT,
  estado_anterior VARCHAR(50),
  estado_nuevo VARCHAR(50),
  campos_modificados JSONB
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_historial_formulario_id ON historial_formulario(formulario_id);
CREATE INDEX IF NOT EXISTS idx_historial_tecnico_id ON historial_formulario(tecnico_id);
CREATE INDEX IF NOT EXISTS idx_historial_fecha ON historial_formulario(fecha_accion);

ALTER TYPE motivo_cierre_enum ADD VALUE 'Instalación cableada sin terminar';

-- Tabla de Contratistas simplificada
CREATE TABLE contratistas (
    id_contratista SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL, -- Para URLs amigables (ej: "bptel")
    logo_url TEXT,
    colores_tema JSON, -- Mantenemos esto para la personalización básica
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Modificar tabla de técnicos para incluir el contratista
ALTER TABLE tecnicos
ADD COLUMN id_contratista INTEGER REFERENCES contratistas(id_contratista);

-- Modificar tabla de formularios para incluir el contratista
ALTER TABLE formulario
ADD COLUMN id_contratista INTEGER REFERENCES contratistas(id_contratista);

-- 1. Primero insertamos la contratista BPTEL
INSERT INTO contratistas (
    nombre,
    slug,
    colores_tema,
    activo
) VALUES (
    'BPTEL',
    'bptel',
    '{"primary": "#2E424D", "secondary": "#5C8374"}',
    true
) RETURNING id_contratista;

-- 2. Actualizamos todos los técnicos existentes
UPDATE tecnicos 
SET id_contratista = (
    SELECT id_contratista 
    FROM contratistas 
    WHERE slug = 'bptel'
);

-- 3. Actualizamos todos los formularios existentes
UPDATE formulario 
SET id_contratista = (
    SELECT id_contratista 
    FROM contratistas 
    WHERE slug = 'bptel'
);

-- Ctra 2
INSERT INTO contratistas (
    nombre,
    slug,
    colores_tema,
    activo
) VALUES (
    'contratista 2',
    'contratista-2',
    '{"primary": "#37474F", "secondary": "#B0BEC5"}',
    true
);

-- Ctra 3
INSERT INTO contratistas (
    nombre,
    slug,
    colores_tema,
    activo
) VALUES (
    'contratista 3',
    'contratista-3',
    '{"primary": "#3E2723", "secondary": "#A1887F"}',
    true
);

INSERT INTO tecnicos (id_tecnico, nombre, email, password, rol, activo, id_contratista)
VALUES (
  111112,
  'Magoo Contratista 2',
  'admin@magoo.com',
  '$2b$10$UdELc/VYgN7El5SXeyvime8PqyNzjsfMu/GEaOV6a/R7ordbKYKWG',
  'admin',
  true,
  2
);

INSERT INTO tecnicos (id_tecnico, nombre, email, password, rol, activo, id_contratista)
VALUES (
  111113,
  'Magoo Contratista 3',
  'admin3@magoo.com',
  '$2b$10$UdELc/VYgN7El5SXeyvime8PqyNzjsfMu/GEaOV6a/R7ordbKYKWG',
  'admin',
  true,
  3
);