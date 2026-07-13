import { Pool } from "pg";

// El esquema del módulo académico (Materia, Tema, Recurso, Actividad,
// ExamenFinal) vive en database/schema.sql (base nueva) o
// database/migrations/migrations_completo.sql (base existente). Aplica el
// que corresponda antes de usar las rutas /materias, /temas, /recursos,
// /actividades y /calificaciones.

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

