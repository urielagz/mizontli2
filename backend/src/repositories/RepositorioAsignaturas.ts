import { pool } from "../config/database";
import { Asignatura } from "../models/Asignatura";

// Asignatura es un contenedor simple (título + imagen + color), igual
// que Materia. No expone "descripcion".
const COLUMNAS = "id_asignatura, nombre, imagen, color, fecha_creacion, fecha_actualizacion";

class RepositorioAsignaturas {

    // ==========================
    // Obtener todas
    // ==========================
    async obtenerTodas(): Promise<Asignatura[]> {

        const sql = `
            SELECT ${COLUMNAS}
            FROM Asignatura
            ORDER BY nombre ASC;
        `;

        const { rows } = await pool.query(sql);

        return rows;
    }

    // ==========================
    // Buscar por ID
    // ==========================
    async obtenerPorId(id: number): Promise<Asignatura | null> {

        const sql = `
            SELECT ${COLUMNAS}
            FROM Asignatura
            WHERE id_asignatura = $1;
        `;

        const { rows } = await pool.query(sql, [id]);

        if (rows.length === 0)
            return null;

        return rows[0];
    }

    // ==========================
    // Crear
    // ==========================
    async crear(asignatura: Asignatura): Promise<Asignatura> {

        const sql = `

            INSERT INTO Asignatura
            (
                nombre,
                imagen,
                color
            )

            VALUES
            (
                $1,
                $2,
                $3
            )

            RETURNING ${COLUMNAS};

        `;

        const values = [

            asignatura.nombre,

            asignatura.imagen ?? null,

            asignatura.color ?? null

        ];

        const { rows } = await pool.query(sql, values);

        return rows[0];

    }

    // ==========================
    // Actualizar
    // ==========================
    async actualizar(
        id: number,
        asignatura: Asignatura
    ): Promise<Asignatura | null> {

        const sql = `

            UPDATE Asignatura

            SET

                nombre = $1,

                imagen = $2,

                color = $3

            WHERE id_asignatura = $4

            RETURNING ${COLUMNAS};

        `;

        const values = [

            asignatura.nombre,

            asignatura.imagen ?? null,

            asignatura.color ?? null,

            id

        ];

        const { rows } = await pool.query(sql, values);

        if (rows.length === 0)
            return null;

        return rows[0];

    }

    // ==========================
    // Eliminar
    // ==========================
    async eliminar(id: number): Promise<boolean> {

        const sql = `

            DELETE FROM Asignatura

            WHERE id_asignatura = $1;

        `;

        const result = await pool.query(sql, [id]);

        return result.rowCount !== null && result.rowCount > 0;

    }

    // ==========================
    // Buscar por nombre
    // ==========================
    async buscarPorNombre(nombre: string): Promise<Asignatura | null> {

        const sql = `

            SELECT ${COLUMNAS}

            FROM Asignatura

            WHERE LOWER(nombre)=LOWER($1);

        `;

        const { rows } = await pool.query(sql, [nombre]);

        if (rows.length === 0)
            return null;

        return rows[0];

    }

    // ==========================
    // Existe
    // ==========================
    async existe(id: number): Promise<boolean> {

        const sql = `

            SELECT 1

            FROM Asignatura

            WHERE id_asignatura=$1;

        `;

        const { rows } = await pool.query(sql, [id]);

        return rows.length > 0;

    }

}

export default new RepositorioAsignaturas();
