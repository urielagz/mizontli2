import { Pool } from "pg";

// El esquema del módulo académico (Asignatura, Materia, Tema, Recurso,
// Actividad, ExamenFinal) vive en database/migrations/001_modulo_academico.sql
// y database/migrations/migrations_completo.sql. Aplica ambos manualmente
// (psql -f database/migrations/001_modulo_academico.sql, luego
// psql -f database/migrations/migrations_completo.sql) antes de usar las
// rutas /asignaturas, /materias, /temas, /recursos, /actividades y
// /calificaciones.

export const pool = new Pool({
    host: "localhost",
    port: 5432,
    database: "prueba3",
    user: "postgres",
    password: "12345"
});
// Nota: evitamos connect() inmediato para que no rompa el arranque
// cuando la app corre sin DB disponible todavía.
// El pool manejará conexiones bajo demanda con `pool.query(...)`.

