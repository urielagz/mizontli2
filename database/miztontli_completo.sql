-- =========================================================
-- Miztontli - Script COMPLETO (esquema base + módulo académico)
-- =========================================================
-- Idempotente: puedes correrlo las veces que quieras, sobre una base
-- vacía o sobre tu base "Miztontli" ya existente. Nunca borra datos.
-- Cada CREATE usa IF NOT EXISTS y cada ALTER usa ADD COLUMN IF NOT EXISTS,
-- así que lo que ya existe simplemente se salta.
--
-- No corras esto además de database/schema.sql o database/migrations/001_...sql:
-- este script YA incluye todo lo que traían esos dos archivos.
-- =========================================================

-- ---------------------------------------------------------
-- 1. TIPOS ENUM
-- ---------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE rol_usuario AS ENUM ('alumno', 'docente', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE tipo_recurso AS ENUM (
        'informacion','documento','video','enlace',
        'pdf','word','excel','powerpoint','imagen','audio','zip','rar','otro'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE tipo_notificacion AS ENUM ('actividad','evaluacion','comentario');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE estado_solicitud AS ENUM ('pendiente', 'aprobado', 'rechazado');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Si tipo_recurso ya existía de antes con menos valores, se completan los que falten.
DO $$
DECLARE v text;
BEGIN
    FOREACH v IN ARRAY ARRAY['pdf','word','excel','powerpoint','imagen','audio','zip','rar','otro'] LOOP
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = v AND enumtypid = 'tipo_recurso'::regtype) THEN
            EXECUTE format('ALTER TYPE tipo_recurso ADD VALUE %L', v);
        END IF;
    END LOOP;
END $$;

-- ---------------------------------------------------------
-- 2. TABLAS BASE (sistema de usuarios / contenido original)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuario (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    rol rol_usuario NOT NULL DEFAULT 'alumno',
    foto_perfil VARCHAR(255),
    biografia TEXT,
    fecha_registro TIMESTAMP NOT NULL DEFAULT NOW(),
    estado BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS materia (
    id_materia SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    icono VARCHAR(255),
    nivel_educativo VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS usuario_materia (
    id_inscripcion SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    id_materia INTEGER NOT NULL REFERENCES materia(id_materia) ON DELETE CASCADE,
    fecha_inscripcion TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (id_usuario, id_materia)
);

CREATE TABLE IF NOT EXISTS tema (
    id_tema SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    orden INTEGER,
    id_materia INTEGER NOT NULL REFERENCES materia(id_materia) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS actividad (
    id_actividad SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    fecha_entrega TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_tema INTEGER NOT NULL REFERENCES tema(id_tema) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS actividad_completada (
    id_registro SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    id_actividad INTEGER NOT NULL REFERENCES actividad(id_actividad) ON DELETE CASCADE,
    fecha_entrega TIMESTAMP,
    calificacion NUMERIC(5,2),
    observaciones TEXT,
    UNIQUE (id_usuario, id_actividad)
);

CREATE TABLE IF NOT EXISTS evaluacion (
    id_evaluacion SERIAL PRIMARY KEY,
    titulo VARCHAR(50) NOT NULL,
    descripcion TEXT,
    lim_tiempo INTEGER,
    fecha_lim TIMESTAMP,
    id_tema INTEGER NOT NULL REFERENCES tema(id_tema) ON DELETE CASCADE,
    id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

-- OJO: nombre exacto "resultado_evaluacion" (con guion bajo) porque así
-- está en tu base de datos real y así la consulta el código del backend.
CREATE TABLE IF NOT EXISTS resultado_evaluacion (
    id_resultado SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    id_evaluacion INTEGER NOT NULL REFERENCES evaluacion(id_evaluacion) ON DELETE CASCADE,
    calificacion NUMERIC(5,2) NOT NULL,
    fecha_presentacion TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (id_usuario, id_evaluacion)
);

CREATE TABLE IF NOT EXISTS recurso (
    id_recurso SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    tipo tipo_recurso NOT NULL,
    url_archivo VARCHAR(255) NOT NULL,
    fecha_publicacion TIMESTAMP NOT NULL DEFAULT NOW(),
    id_tema INTEGER NOT NULL REFERENCES tema(id_tema) ON DELETE CASCADE,
    id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS progreso (
    id_progreso SERIAL PRIMARY KEY,
    porcentaje_avance NUMERIC(5,2) NOT NULL DEFAULT 0,
    act_completas INTEGER NOT NULL DEFAULT 0,
    evaluaciones_completas INTEGER NOT NULL DEFAULT 0,
    ultima_actualizacion TIMESTAMP NOT NULL DEFAULT NOW(),
    id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    id_materia INTEGER NOT NULL REFERENCES materia(id_materia) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS publicacion (
    id_publicacion SERIAL PRIMARY KEY,
    titulo VARCHAR(50) NOT NULL,
    contenido TEXT,
    fecha_publicacion TIMESTAMP NOT NULL DEFAULT NOW(),
    id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comentario (
    id_comentario SERIAL PRIMARY KEY,
    contenido TEXT NOT NULL,
    fecha_comentario TIMESTAMP NOT NULL DEFAULT NOW(),
    id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    id_publicacion INTEGER NOT NULL REFERENCES publicacion(id_publicacion) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notificacion (
    id_notificacion SERIAL PRIMARY KEY,
    titulo VARCHAR(50) NOT NULL,
    mensaje TEXT NOT NULL,
    leida BOOLEAN NOT NULL DEFAULT FALSE,
    tipo tipo_notificacion NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_lectura TIMESTAMP,
    id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

-- OJO: nombre exacto "docenteespera" (todo junto, sin guion bajo) porque
-- así la consulta RepositorioDocenteEspera.ts (CREATE TABLE DocenteEspera
-- sin comillas se guarda en minúsculas y sin separar palabras).
CREATE TABLE IF NOT EXISTS docenteespera (
    id_solicitud SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    cedula_profesional VARCHAR(255) NOT NULL,
    diploma VARCHAR(255) NOT NULL,
    estado estado_solicitud NOT NULL DEFAULT 'pendiente',
    fecha_solicitud TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_revision TIMESTAMP
);

-- ---------------------------------------------------------
-- 3. MÓDULO ACADÉMICO: Asignatura
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS asignatura (
    id_asignatura SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    imagen VARCHAR(255),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 4. Materia: se liga a Asignatura y a un docente responsable
-- ---------------------------------------------------------
ALTER TABLE materia ADD COLUMN IF NOT EXISTS id_asignatura INTEGER REFERENCES asignatura(id_asignatura) ON DELETE CASCADE;
ALTER TABLE materia ADD COLUMN IF NOT EXISTS id_docente INTEGER REFERENCES usuario(id_usuario) ON DELETE CASCADE;
ALTER TABLE materia ADD COLUMN IF NOT EXISTS orden INTEGER NOT NULL DEFAULT 0;
ALTER TABLE materia ADD COLUMN IF NOT EXISTS fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE materia ADD COLUMN IF NOT EXISTS fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW();

-- ---------------------------------------------------------
-- 5. Leccion: contenido de un tema
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS leccion (
    id_leccion SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    contenido TEXT,
    codigo TEXT,
    imagenes JSONB NOT NULL DEFAULT '[]'::jsonb,
    videos JSONB NOT NULL DEFAULT '[]'::jsonb,
    enlaces JSONB NOT NULL DEFAULT '[]'::jsonb,
    orden INTEGER NOT NULL DEFAULT 0,
    id_tema INTEGER NOT NULL REFERENCES tema(id_tema) ON DELETE CASCADE,
    id_docente INTEGER REFERENCES usuario(id_usuario) ON DELETE SET NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 6. Recurso: metadatos de archivo (Multer)
-- ---------------------------------------------------------
ALTER TABLE recurso ADD COLUMN IF NOT EXISTS nombre_original VARCHAR(255);
ALTER TABLE recurso ADD COLUMN IF NOT EXISTS extension VARCHAR(10);
ALTER TABLE recurso ADD COLUMN IF NOT EXISTS tamano_bytes BIGINT;

-- ---------------------------------------------------------
-- 7. Actividad: puntaje, archivos permitidos, docente autor
-- ---------------------------------------------------------
ALTER TABLE actividad ADD COLUMN IF NOT EXISTS puntaje NUMERIC(5,2) NOT NULL DEFAULT 10;
ALTER TABLE actividad ADD COLUMN IF NOT EXISTS archivos_permitidos VARCHAR(255) NOT NULL DEFAULT 'pdf,word,zip,imagen,video,audio,codigo';
ALTER TABLE actividad ADD COLUMN IF NOT EXISTS id_docente INTEGER REFERENCES usuario(id_usuario) ON DELETE SET NULL;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'actividad' AND column_name = 'fecha_entrega'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'actividad' AND column_name = 'fecha_limite'
    ) THEN
        ALTER TABLE actividad RENAME COLUMN fecha_entrega TO fecha_limite;
    END IF;
END $$;

-- ---------------------------------------------------------
-- 8. Actividad_completada: archivo entregado + calificación opcional
-- ---------------------------------------------------------
ALTER TABLE actividad_completada ADD COLUMN IF NOT EXISTS archivo_url VARCHAR(255);
ALTER TABLE actividad_completada ADD COLUMN IF NOT EXISTS nombre_original VARCHAR(255);
ALTER TABLE actividad_completada ALTER COLUMN calificacion DROP NOT NULL;

-- ---------------------------------------------------------
-- 9. Evaluacion: intentos permitidos y calificación máxima
-- ---------------------------------------------------------
ALTER TABLE evaluacion ADD COLUMN IF NOT EXISTS intentos_permitidos INTEGER NOT NULL DEFAULT 1;
ALTER TABLE evaluacion ADD COLUMN IF NOT EXISTS calificacion_maxima NUMERIC(5,2) NOT NULL DEFAULT 10;

-- ---------------------------------------------------------
-- 10. Pregunta y Opcion
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS pregunta (
    id_pregunta SERIAL PRIMARY KEY,
    enunciado TEXT NOT NULL,
    puntaje NUMERIC(5,2) NOT NULL DEFAULT 1,
    orden INTEGER NOT NULL DEFAULT 0,
    id_evaluacion INTEGER NOT NULL REFERENCES evaluacion(id_evaluacion) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS opcion (
    id_opcion SERIAL PRIMARY KEY,
    texto VARCHAR(255) NOT NULL,
    es_correcta BOOLEAN NOT NULL DEFAULT FALSE,
    orden INTEGER NOT NULL DEFAULT 0,
    id_pregunta INTEGER NOT NULL REFERENCES pregunta(id_pregunta) ON DELETE CASCADE
);

-- ---------------------------------------------------------
-- 11. resultado_evaluacion: soporte de múltiples intentos
-- ---------------------------------------------------------
ALTER TABLE resultado_evaluacion ADD COLUMN IF NOT EXISTS numero_intento INTEGER NOT NULL DEFAULT 1;

ALTER TABLE resultado_evaluacion DROP CONSTRAINT IF EXISTS resultado_evaluacion_id_usuario_id_evaluacion_key;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'resultado_evaluacion_intento_unico'
    ) THEN
        ALTER TABLE resultado_evaluacion ADD CONSTRAINT resultado_evaluacion_intento_unico
            UNIQUE (id_usuario, id_evaluacion, numero_intento);
    END IF;
END $$;

-- ---------------------------------------------------------
-- 12. Respuesta: respuesta de un alumno a una pregunta, por intento
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS respuesta (
    id_respuesta SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    id_pregunta INTEGER NOT NULL REFERENCES pregunta(id_pregunta) ON DELETE CASCADE,
    id_opcion INTEGER REFERENCES opcion(id_opcion) ON DELETE CASCADE,
    id_resultado INTEGER NOT NULL REFERENCES resultado_evaluacion(id_resultado) ON DELETE CASCADE,
    fecha_respuesta TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (id_resultado, id_pregunta)
);

-- ---------------------------------------------------------
-- 13. progreso: un registro por alumno y materia (caché recalculable)
-- ---------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'progreso_id_usuario_id_materia_key'
    ) THEN
        ALTER TABLE progreso ADD CONSTRAINT progreso_id_usuario_id_materia_key
            UNIQUE (id_usuario, id_materia);
    END IF;
END $$;

-- ---------------------------------------------------------
-- 14. Índices de apoyo
-- ---------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_materia_asignatura ON materia(id_asignatura);
CREATE INDEX IF NOT EXISTS idx_materia_docente ON materia(id_docente);
CREATE INDEX IF NOT EXISTS idx_leccion_tema ON leccion(id_tema);
CREATE INDEX IF NOT EXISTS idx_pregunta_evaluacion ON pregunta(id_evaluacion);
CREATE INDEX IF NOT EXISTS idx_opcion_pregunta ON opcion(id_pregunta);
CREATE INDEX IF NOT EXISTS idx_respuesta_resultado ON respuesta(id_resultado);
