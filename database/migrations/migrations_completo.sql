-- =========================================================
-- Miztontli - Migración: rediseño del módulo académico
-- =========================================================
-- Idempotente: puedes correrlo las veces que quieras. Cada ALTER usa
-- ADD COLUMN IF NOT EXISTS y cada DROP usa IF EXISTS, así que lo que ya
-- se aplicó simplemente se salta.
--
-- Contexto: Tema pasa a comportarse como el "capítulo" completo del libro
-- (título + introducción + contenido + 2 imágenes), por lo que ya no se
-- necesita la tabla Leccion como sub-entidad. El examen final de cada
-- materia deja de ser un banco de preguntas dentro del sistema y pasa a
-- ser solo un título + descripción + URL de Google Forms, por lo que el
-- sistema de Evaluacion/Pregunta/Opcion/Respuesta/ResultadoEvaluacion
-- también queda obsoleto. Ambos se eliminan por completo (tablas y datos).
-- =========================================================

-- ---------------------------------------------------------
-- 1. Eliminar Leccion y el sistema de Evaluación con preguntas
-- ---------------------------------------------------------
DROP TABLE IF EXISTS respuesta CASCADE;
DROP TABLE IF EXISTS resultado_evaluacion CASCADE;
DROP TABLE IF EXISTS opcion CASCADE;
DROP TABLE IF EXISTS pregunta CASCADE;
DROP TABLE IF EXISTS evaluacion CASCADE;
DROP TABLE IF EXISTS leccion CASCADE;

-- ---------------------------------------------------------
-- 2. Materia: contenedor simple (título + imagen + color)
-- ---------------------------------------------------------
ALTER TABLE materia ADD COLUMN IF NOT EXISTS color VARCHAR(20);

-- ---------------------------------------------------------
-- 3. Tema: ahora es el capítulo completo (antes solo era el índice)
-- ---------------------------------------------------------
ALTER TABLE tema ADD COLUMN IF NOT EXISTS introduccion TEXT;
ALTER TABLE tema ADD COLUMN IF NOT EXISTS contenido TEXT;
ALTER TABLE tema ADD COLUMN IF NOT EXISTS imagen1 VARCHAR(255);
ALTER TABLE tema ADD COLUMN IF NOT EXISTS imagen2 VARCHAR(255);

-- ---------------------------------------------------------
-- 4. Actividad: archivos de apoyo opcionales subidos por el docente
-- ---------------------------------------------------------
ALTER TABLE actividad ADD COLUMN IF NOT EXISTS archivos_apoyo JSONB NOT NULL DEFAULT '[]'::jsonb;

-- ---------------------------------------------------------
-- 5. actividad_completada: separar el comentario del alumno (al entregar)
-- de las observaciones del docente (al calificar) -- antes compartían
-- la misma columna "observaciones" y la calificación del docente
-- borraba el comentario del alumno.
-- ---------------------------------------------------------
ALTER TABLE actividad_completada ADD COLUMN IF NOT EXISTS comentario_alumno TEXT;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'actividad_completada' AND column_name = 'observaciones'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'actividad_completada' AND column_name = 'observaciones_docente'
    ) THEN
        ALTER TABLE actividad_completada RENAME COLUMN observaciones TO observaciones_docente;
    END IF;
END $$;

-- ---------------------------------------------------------
-- 6. Examen final: uno por materia, solo enlace a Google Forms
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
-- 7. Asignatura: contenedor simple (título + imagen + color), igual
-- que Materia -- ya no lleva "descripcion".
-- ---------------------------------------------------------
ALTER TABLE asignatura ADD COLUMN IF NOT EXISTS color VARCHAR(20);
ALTER TABLE asignatura DROP COLUMN IF EXISTS descripcion;

-- ---------------------------------------------------------
-- 8. Entrega de actividad: el alumno puede entregar con un archivo,
-- una URL (ej. Google Docs, un video), o ambos -- estilo Teams.
-- ---------------------------------------------------------
ALTER TABLE actividad_completada ADD COLUMN IF NOT EXISTS url_entrega VARCHAR(500);

-- ---------------------------------------------------------
-- 9. Eliminar Asignatura: Materia deja de colgar de una asignatura y
-- pasa a ser el nivel superior del módulo académico.
-- ---------------------------------------------------------
ALTER TABLE materia DROP COLUMN IF EXISTS id_asignatura;
DROP TABLE IF EXISTS asignatura CASCADE;
