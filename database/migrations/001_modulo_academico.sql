-- =========================================================
-- Migración: Módulo académico Miztontli
-- Asignatura -> Materia -> Tema -> Leccion / Recurso / Actividad / Evaluacion
-- =========================================================
-- No modifica tablas del sistema de usuarios/autenticación (Usuario, DocenteEspera).
-- Cada bloque es idempotente (IF NOT EXISTS) para poder re-ejecutarse sin romper.

-- =========================================================
-- 1. Asignatura (categoría raíz: Matemáticas, Español, etc.)
-- =========================================================
CREATE TABLE IF NOT EXISTS Asignatura (
    id_asignatura SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    imagen VARCHAR(255),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 2. Materia: se liga a Asignatura y a un docente responsable
-- =========================================================
ALTER TABLE Materia ADD COLUMN IF NOT EXISTS id_asignatura INTEGER REFERENCES Asignatura(id_asignatura) ON DELETE CASCADE;
ALTER TABLE Materia ADD COLUMN IF NOT EXISTS id_docente INTEGER REFERENCES Usuario(id_usuario) ON DELETE CASCADE;
ALTER TABLE Materia ADD COLUMN IF NOT EXISTS orden INTEGER NOT NULL DEFAULT 0;
ALTER TABLE Materia ADD COLUMN IF NOT EXISTS fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE Materia ADD COLUMN IF NOT EXISTS fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW();

-- =========================================================
-- 3. Tema: ya existe y coincide con la jerarquía (id_materia). Sin cambios.
-- =========================================================

-- =========================================================
-- 4. Leccion: contenido de un tema (texto enriquecido, código, multimedia)
-- =========================================================
CREATE TABLE IF NOT EXISTS Leccion (
    id_leccion SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    contenido TEXT,
    codigo TEXT,
    imagenes JSONB NOT NULL DEFAULT '[]'::jsonb,
    videos JSONB NOT NULL DEFAULT '[]'::jsonb,
    enlaces JSONB NOT NULL DEFAULT '[]'::jsonb,
    orden INTEGER NOT NULL DEFAULT 0,
    id_tema INTEGER NOT NULL REFERENCES Tema(id_tema) ON DELETE CASCADE,
    id_docente INTEGER REFERENCES Usuario(id_usuario) ON DELETE SET NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 5. Recurso: ya existe, se amplían los tipos de archivo permitidos
--    y se agregan metadatos del archivo subido con Multer.
-- =========================================================
ALTER TABLE Recurso ADD COLUMN IF NOT EXISTS nombre_original VARCHAR(255);
ALTER TABLE Recurso ADD COLUMN IF NOT EXISTS extension VARCHAR(10);
ALTER TABLE Recurso ADD COLUMN IF NOT EXISTS tamano_bytes BIGINT;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'pdf' AND enumtypid = 'tipo_recurso'::regtype) THEN
        ALTER TYPE tipo_recurso ADD VALUE 'pdf';
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'word' AND enumtypid = 'tipo_recurso'::regtype) THEN
        ALTER TYPE tipo_recurso ADD VALUE 'word';
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'excel' AND enumtypid = 'tipo_recurso'::regtype) THEN
        ALTER TYPE tipo_recurso ADD VALUE 'excel';
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'powerpoint' AND enumtypid = 'tipo_recurso'::regtype) THEN
        ALTER TYPE tipo_recurso ADD VALUE 'powerpoint';
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'imagen' AND enumtypid = 'tipo_recurso'::regtype) THEN
        ALTER TYPE tipo_recurso ADD VALUE 'imagen';
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'audio' AND enumtypid = 'tipo_recurso'::regtype) THEN
        ALTER TYPE tipo_recurso ADD VALUE 'audio';
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'zip' AND enumtypid = 'tipo_recurso'::regtype) THEN
        ALTER TYPE tipo_recurso ADD VALUE 'zip';
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'rar' AND enumtypid = 'tipo_recurso'::regtype) THEN
        ALTER TYPE tipo_recurso ADD VALUE 'rar';
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'otro' AND enumtypid = 'tipo_recurso'::regtype) THEN
        ALTER TYPE tipo_recurso ADD VALUE 'otro';
    END IF;
END$$;

-- =========================================================
-- 6. Actividad: ya existe (titulo, descripcion, id_tema).
--    Se agrega puntaje, archivos permitidos, docente autor y se
--    renombra fecha_entrega -> fecha_limite (esa columna es la
--    fecha límite de la actividad, no la fecha en que el alumno entrega).
-- =========================================================
ALTER TABLE Actividad ADD COLUMN IF NOT EXISTS puntaje NUMERIC(5,2) NOT NULL DEFAULT 10;
ALTER TABLE Actividad ADD COLUMN IF NOT EXISTS archivos_permitidos VARCHAR(255) NOT NULL DEFAULT 'pdf,word,zip,imagen,video,audio,codigo';
ALTER TABLE Actividad ADD COLUMN IF NOT EXISTS id_docente INTEGER REFERENCES Usuario(id_usuario) ON DELETE SET NULL;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'actividad' AND column_name = 'fecha_entrega'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'actividad' AND column_name = 'fecha_limite'
    ) THEN
        ALTER TABLE Actividad RENAME COLUMN fecha_entrega TO fecha_limite;
    END IF;
END$$;

-- =========================================================
-- 7. Actividad_completada: es la entrega del alumno + calificación.
--    Se agrega el archivo subido y se permite calificación nula
--    (la actividad puede estar entregada pero aún no calificada).
-- =========================================================
ALTER TABLE Actividad_completada ADD COLUMN IF NOT EXISTS archivo_url VARCHAR(255);
ALTER TABLE Actividad_completada ADD COLUMN IF NOT EXISTS nombre_original VARCHAR(255);
ALTER TABLE Actividad_completada ALTER COLUMN calificacion DROP NOT NULL;

-- =========================================================
-- 8. Evaluacion: ya existe (titulo, descripcion, lim_tiempo, fecha_lim,
--    id_tema, id_usuario=docente). Se agregan intentos y calificación máxima.
-- =========================================================
ALTER TABLE Evaluacion ADD COLUMN IF NOT EXISTS intentos_permitidos INTEGER NOT NULL DEFAULT 1;
ALTER TABLE Evaluacion ADD COLUMN IF NOT EXISTS calificacion_maxima NUMERIC(5,2) NOT NULL DEFAULT 10;

-- =========================================================
-- 9. Pregunta: pertenece a una evaluación.
-- =========================================================
CREATE TABLE IF NOT EXISTS Pregunta (
    id_pregunta SERIAL PRIMARY KEY,
    enunciado TEXT NOT NULL,
    puntaje NUMERIC(5,2) NOT NULL DEFAULT 1,
    orden INTEGER NOT NULL DEFAULT 0,
    id_evaluacion INTEGER NOT NULL REFERENCES Evaluacion(id_evaluacion) ON DELETE CASCADE
);

-- =========================================================
-- 10. Opcion: opciones de respuesta de una pregunta de opción múltiple.
-- =========================================================
CREATE TABLE IF NOT EXISTS Opcion (
    id_opcion SERIAL PRIMARY KEY,
    texto VARCHAR(255) NOT NULL,
    es_correcta BOOLEAN NOT NULL DEFAULT FALSE,
    orden INTEGER NOT NULL DEFAULT 0,
    id_pregunta INTEGER NOT NULL REFERENCES Pregunta(id_pregunta) ON DELETE CASCADE
);

-- =========================================================
-- 11. ResultadoEvaluacion: ya existe, pero solo permitía 1 intento.
--     Se agrega numero_intento y se libera la restricción UNIQUE.
-- =========================================================
ALTER TABLE ResultadoEvaluacion ADD COLUMN IF NOT EXISTS numero_intento INTEGER NOT NULL DEFAULT 1;

ALTER TABLE ResultadoEvaluacion DROP CONSTRAINT IF EXISTS resultadoevaluacion_id_usuario_id_evaluacion_key;

ALTER TABLE ResultadoEvaluacion ADD CONSTRAINT resultado_evaluacion_intento_unico
    UNIQUE (id_usuario, id_evaluacion, numero_intento);

-- =========================================================
-- 12. Respuesta: respuesta de un alumno a una pregunta, ligada a un intento.
-- =========================================================
CREATE TABLE IF NOT EXISTS Respuesta (
    id_respuesta SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
    id_pregunta INTEGER NOT NULL REFERENCES Pregunta(id_pregunta) ON DELETE CASCADE,
    id_opcion INTEGER REFERENCES Opcion(id_opcion) ON DELETE CASCADE,
    id_resultado INTEGER NOT NULL REFERENCES ResultadoEvaluacion(id_resultado) ON DELETE CASCADE,
    fecha_respuesta TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (id_resultado, id_pregunta)
);

-- =========================================================
-- Índices de apoyo para las consultas jerárquicas más comunes
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_materia_asignatura ON Materia(id_asignatura);
CREATE INDEX IF NOT EXISTS idx_materia_docente ON Materia(id_docente);
CREATE INDEX IF NOT EXISTS idx_leccion_tema ON Leccion(id_tema);
CREATE INDEX IF NOT EXISTS idx_pregunta_evaluacion ON Pregunta(id_evaluacion);
CREATE INDEX IF NOT EXISTS idx_opcion_pregunta ON Opcion(id_pregunta);
CREATE INDEX IF NOT EXISTS idx_respuesta_resultado ON Respuesta(id_resultado);
