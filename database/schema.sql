-- =========================================================
-- Miztontli - Esquema completo y vigente del proyecto
-- =========================================================
-- Este es el esquema objetivo actual: ya incluye el módulo académico
-- rediseñado (Materia -> Índice -> Tema/capítulo -> Recurso / Actividad /
-- Entrega / Examen Final) directamente en las CREATE TABLE, sin necesidad
-- de aplicar ALTER por separado. Materia ya no cuelga de Asignatura -- es
-- el nivel superior del módulo académico.
--
-- Uso:
--   - Base de datos NUEVA/vacía: corre solo este archivo.
--   - Base de datos EXISTENTE con el esquema viejo (con Leccion,
--     Evaluacion, Pregunta, Opcion, Respuesta, ResultadoEvaluacion):
--     NO corras este archivo directamente sobre ella. En su lugar aplica
--     database/migrations/001_modulo_academico.sql y luego
--     database/migrations/migrations_completo.sql, que migran esa base
--     a este mismo esquema sin perder datos (excepto las tablas que el
--     rediseño elimina a propósito).
--
-- Idempotente: usa CREATE ... IF NOT EXISTS, se puede correr varias veces.
-- =========================================================

-- ---------------------------------------------------------
-- 1. Tipos ENUM
-- ---------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE rol_usuario AS ENUM ('alumno', 'docente', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE tipo_recurso AS ENUM (
        'informacion', 'documento', 'video', 'enlace',
        'pdf', 'word', 'excel', 'powerpoint', 'imagen', 'audio', 'zip', 'rar', 'otro'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE tipo_notificacion AS ENUM ('actividad', 'evaluacion', 'comentario');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE estado_solicitud AS ENUM ('pendiente', 'aprobado', 'rechazado');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------------------------------------------------------
-- 2. Usuarios
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

-- Solicitudes de registro como docente (revisión manual del admin).
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
-- 3. Módulo académico: Materia -> Tema
-- ---------------------------------------------------------
-- Materia: contenedor simple (título + imagen + color), asignado a un
-- docente responsable. Es el nivel superior del módulo académico.
CREATE TABLE IF NOT EXISTS materia (
    id_materia SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    icono VARCHAR(255),
    color VARCHAR(20),
    orden INTEGER NOT NULL DEFAULT 0,
    id_docente INTEGER REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tema: el capítulo completo del libro (título + introducción +
-- contenido largo + hasta 2 imágenes). El "índice" de una materia es
-- solo la lista de sus temas ordenados por "orden"; no se guarda aparte.
CREATE TABLE IF NOT EXISTS tema (
    id_tema SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    introduccion TEXT,
    contenido TEXT,
    imagen1 VARCHAR(255),
    imagen2 VARCHAR(255),
    orden INTEGER,
    id_materia INTEGER NOT NULL REFERENCES materia(id_materia) ON DELETE CASCADE
);

-- ---------------------------------------------------------
-- 4. Recursos (archivos de apoyo de un tema)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS recurso (
    id_recurso SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    tipo tipo_recurso NOT NULL,
    url_archivo VARCHAR(255) NOT NULL,
    nombre_original VARCHAR(255),
    extension VARCHAR(10),
    tamano_bytes BIGINT,
    fecha_publicacion TIMESTAMP NOT NULL DEFAULT NOW(),
    id_tema INTEGER NOT NULL REFERENCES tema(id_tema) ON DELETE CASCADE,
    id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

-- ---------------------------------------------------------
-- 5. Actividades y entregas
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS actividad (
    id_actividad SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    fecha_limite TIMESTAMP,
    puntaje NUMERIC(5,2) NOT NULL DEFAULT 10,
    archivos_permitidos VARCHAR(255) NOT NULL DEFAULT 'pdf,word,zip,imagen,video,audio,codigo',
    archivos_apoyo JSONB NOT NULL DEFAULT '[]'::jsonb,
    id_tema INTEGER NOT NULL REFERENCES tema(id_tema) ON DELETE CASCADE,
    id_docente INTEGER REFERENCES usuario(id_usuario) ON DELETE SET NULL
);

-- Entrega de un alumno para una actividad: puede ser un archivo, una URL
-- (ej. Google Docs, un video), o ambos. El comentario del alumno (al
-- entregar) y las observaciones del docente (al calificar) son columnas
-- separadas a propósito, para que calificar no borre el comentario
-- original del alumno.
CREATE TABLE IF NOT EXISTS actividad_completada (
    id_registro SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    id_actividad INTEGER NOT NULL REFERENCES actividad(id_actividad) ON DELETE CASCADE,
    fecha_entrega TIMESTAMP,
    archivo_url VARCHAR(255),
    nombre_original VARCHAR(255),
    url_entrega VARCHAR(500),
    calificacion NUMERIC(5,2),
    comentario_alumno TEXT,
    observaciones_docente TEXT,
    UNIQUE (id_usuario, id_actividad)
);

-- ---------------------------------------------------------
-- 6. Examen final (uno por materia, solo enlace a Google Forms)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS examen_final (
    id_examen SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    url_formulario VARCHAR(500) NOT NULL,
    id_materia INTEGER NOT NULL UNIQUE REFERENCES materia(id_materia) ON DELETE CASCADE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------
-- 7. Progreso (caché recalculable de avance por alumno y materia)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS progreso (
    id_progreso SERIAL PRIMARY KEY,
    porcentaje_avance NUMERIC(5,2) NOT NULL DEFAULT 0,
    act_completas INTEGER NOT NULL DEFAULT 0,
    evaluaciones_completas INTEGER NOT NULL DEFAULT 0,
    ultima_actualizacion TIMESTAMP NOT NULL DEFAULT NOW(),
    id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    id_materia INTEGER NOT NULL REFERENCES materia(id_materia) ON DELETE CASCADE,
    UNIQUE (id_usuario, id_materia)
);

-- ---------------------------------------------------------
-- 8. Publicaciones (Anuncios y Asesorías comparten esta tabla;
--    Asesoría se distingue por la marca "__asesoria":true dentro
--    de "contenido", no es una tabla propia), Comentarios y
--    Notificaciones. Ninguna de estas 3 últimas tiene endpoints de
--    autenticación en el backend actual salvo publicacion (que las
--    usa Anuncios/Asesorías, ambos públicos sin token).
-- ---------------------------------------------------------
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

CREATE TABLE IF NOT EXISTS usuario_materia (
    id_inscripcion SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    id_materia INTEGER NOT NULL REFERENCES materia(id_materia) ON DELETE CASCADE,
    fecha_inscripcion TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (id_usuario, id_materia)
);

-- ---------------------------------------------------------
-- 9. Índices de apoyo
-- ---------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_materia_docente ON materia(id_docente);
CREATE INDEX IF NOT EXISTS idx_tema_materia ON tema(id_materia);
CREATE INDEX IF NOT EXISTS idx_recurso_tema ON recurso(id_tema);
CREATE INDEX IF NOT EXISTS idx_actividad_tema ON actividad(id_tema);
CREATE INDEX IF NOT EXISTS idx_actividad_completada_actividad ON actividad_completada(id_actividad);
CREATE INDEX IF NOT EXISTS idx_progreso_materia ON progreso(id_materia);
