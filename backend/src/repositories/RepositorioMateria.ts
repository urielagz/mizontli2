import { pool } from "../config/database";
import { Materia } from "../models/Materia";

// Materia es un contenedor simple (título + imagen + color) y es el
// nivel superior del módulo académico (ya no cuelga de Asignatura).
const COLUMNAS = `
    m.id_materia, m.nombre, m.icono, m.color, m.orden,
    m.id_docente, m.fecha_creacion, m.fecha_actualizacion
`;

class RepositorioMaterias {

    // ============================================
    // Obtener todas las materias
    // ============================================
    async obtenerTodas() {

        const sql = `
            SELECT ${COLUMNAS}
            FROM Materia m
            ORDER BY m.orden, m.nombre;
        `;

        const { rows } = await pool.query(sql);

        return rows;

    }

    // ============================================
    // Obtener por ID
    // ============================================

    async obtenerPorId(id: number) {

        const sql = `
            SELECT ${COLUMNAS}
            FROM Materia m
            WHERE m.id_materia = $1;
        `;

        const { rows } = await pool.query(sql, [id]);

        return rows.length ? rows[0] : null;

    }

    // ============================================
    // Obtener materias de un docente
    // ============================================

    async obtenerPorDocente(idDocente: number) {

        const sql = `
            SELECT ${COLUMNAS}
            FROM Materia m
            WHERE m.id_docente = $1
            ORDER BY m.orden, m.nombre;
        `;

        const { rows } = await pool.query(sql, [idDocente]);

        return rows;

    }

    // ============================================
    // Crear
    // ============================================

    async crear(materia: Materia) {

        const sql = `
            INSERT INTO Materia (nombre, icono, color, orden, id_docente)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING ${COLUMNAS.replace(/m\./g, "")};
        `;

        const values = [
            materia.nombre,
            materia.icono ?? null,
            materia.color ?? null,
            materia.orden ?? 0,
            materia.id_docente
        ];

        const { rows } = await pool.query(sql, values);

        return rows[0];

    }

    // ============================================
    // Actualizar
    // ============================================

    async actualizar(id: number, materia: Materia) {

        const sql = `
            UPDATE Materia
            SET nombre = $1, icono = $2, color = $3, orden = $4
            WHERE id_materia = $5
            RETURNING ${COLUMNAS.replace(/m\./g, "")};
        `;

        const values = [
            materia.nombre,
            materia.icono ?? null,
            materia.color ?? null,
            materia.orden ?? 0,
            id
        ];

        const { rows } = await pool.query(sql, values);

        return rows.length ? rows[0] : null;

    }

    // ============================================
    // Eliminar
    // ============================================

    async eliminar(id: number) {

        const sql = `DELETE FROM Materia WHERE id_materia = $1;`;

        const result = await pool.query(sql, [id]);

        return (result.rowCount ?? 0) > 0;

    }

    // ============================================
    // Verificar existencia
    // ============================================

    async existe(id: number) {

        const sql = `SELECT id_materia FROM Materia WHERE id_materia = $1;`;

        const { rows } = await pool.query(sql, [id]);

        return rows.length > 0;

    }

    // ============================================
    // Verificar propietario
    // ============================================

    async esDelDocente(idMateria: number, idDocente: number) {

        const sql = `
            SELECT id_materia
            FROM Materia
            WHERE id_materia = $1 AND id_docente = $2;
        `;

        const { rows } = await pool.query(sql, [idMateria, idDocente]);

        return rows.length > 0;

    }

}

export default new RepositorioMaterias();
