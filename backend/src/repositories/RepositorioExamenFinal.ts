import { pool } from "../config/database";
import { ExamenFinal } from "../models/ExamenFinal";

// El examen final no se desarrolla dentro del sistema: solo se guarda un
// título, una descripción y la URL de un formulario externo (Google
// Forms). Es único por materia, así que "guardar" hace upsert.
class RepositorioExamenFinal {

    async obtenerPorMateria(idMateria: number): Promise<ExamenFinal | null> {

        const sql = `SELECT * FROM examen_final WHERE id_materia = $1;`;

        const { rows } = await pool.query(sql, [idMateria]);

        return rows.length ? rows[0] : null;

    }

    async guardar(examen: ExamenFinal): Promise<ExamenFinal> {

        const sql = `
            INSERT INTO examen_final (titulo, descripcion, url_formulario, id_materia)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (id_materia)
            DO UPDATE SET
                titulo = EXCLUDED.titulo,
                descripcion = EXCLUDED.descripcion,
                url_formulario = EXCLUDED.url_formulario,
                fecha_actualizacion = NOW()
            RETURNING *;
        `;

        const values = [
            examen.titulo,
            examen.descripcion ?? null,
            examen.url_formulario,
            examen.id_materia
        ];

        const { rows } = await pool.query(sql, values);

        return rows[0];

    }

    async eliminar(idMateria: number): Promise<boolean> {

        const sql = `DELETE FROM examen_final WHERE id_materia = $1;`;

        const result = await pool.query(sql, [idMateria]);

        return (result.rowCount ?? 0) > 0;

    }

}

export default new RepositorioExamenFinal();
