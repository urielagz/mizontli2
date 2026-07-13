import { pool } from "../config/database";
import { Tema } from "../models/Tema";

export class RepositorioTemas {

    private mapFilaAFila(row: any): Tema {
        return new Tema(
            row.id_tema,
            row.nombre,
            row.descripcion,
            row.introduccion,
            row.contenido,
            row.imagen1,
            row.imagen2,
            row.orden,
            row.id_materia
        );
    }

    async listar(): Promise<Tema[]> {
        const resultado = await pool.query("SELECT * FROM Tema ORDER BY orden, id_tema");
        return resultado.rows.map(row => this.mapFilaAFila(row));
    }

    async agregar(nombre: string, descripcion: string, orden: number, id_materia: number): Promise<Tema> {
        const resultado = await pool.query(
            `INSERT INTO Tema
             (nombre, descripcion, orden, id_materia)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [nombre, descripcion, orden, id_materia]
        );

        return this.mapFilaAFila(resultado.rows[0]);
    }

    async buscarPorMateria(idMateria: number): Promise<Tema[]> {
        const resultado = await pool.query(
            "SELECT * FROM Tema WHERE id_materia = $1 ORDER BY orden, id_tema",
            [idMateria]
        );

        return resultado.rows.map(row => this.mapFilaAFila(row));
    }

    // Versión liviana para el índice de una materia: solo lo necesario
    // para navegar (id, título, orden) más si el tema tiene actividades,
    // para que el front lo pinte como dropdown. No trae introduccion,
    // contenido ni imágenes.
    async buscarIndicePorMateria(idMateria: number): Promise<
        { id_tema: number; nombre: string; orden: number; tieneActividades: boolean; cantidadActividades: number }[]
    > {
        const resultado = await pool.query(
            `SELECT
                 t.id_tema,
                 t.nombre,
                 t.orden,
                 COUNT(a.id_actividad) > 0 AS "tieneActividades",
                 COUNT(a.id_actividad)::int AS "cantidadActividades"
             FROM Tema t
             LEFT JOIN Actividad a ON a.id_tema = t.id_tema
             WHERE t.id_materia = $1
             GROUP BY t.id_tema, t.nombre, t.orden
             ORDER BY t.orden, t.id_tema`,
            [idMateria]
        );

        return resultado.rows;
    }

    async buscarPorId(id_tema: number): Promise<Tema | undefined> {
        const resultado = await pool.query(
            "SELECT * FROM Tema WHERE id_tema = $1",
            [id_tema]
        );

        if (resultado.rows.length === 0) {
            return undefined;
        }

        return this.mapFilaAFila(resultado.rows[0]);
    }

    async actualizar(
        id_tema: number,
        nombre: string,
        descripcion: string,
        orden: number
    ): Promise<Tema | undefined> {
        const resultado = await pool.query(
            `UPDATE Tema
             SET nombre = $1, descripcion = $2, orden = $3
             WHERE id_tema = $4
             RETURNING *`,
            [nombre, descripcion, orden, id_tema]
        );

        if (resultado.rows.length === 0) {
            return undefined;
        }

        return this.mapFilaAFila(resultado.rows[0]);
    }

    // Actualiza el contenido del capítulo: introducción, contenido largo
    // y hasta dos imágenes. Independiente de actualizar() para no forzar
    // a mandar nombre/descripcion/orden cuando solo se edita el contenido.
    async actualizarContenido(
        id_tema: number,
        datos: { introduccion?: string | null; contenido?: string | null; imagen1?: string | null; imagen2?: string | null }
    ): Promise<Tema | undefined> {
        const resultado = await pool.query(
            `UPDATE Tema
             SET introduccion = $1, contenido = $2, imagen1 = $3, imagen2 = $4
             WHERE id_tema = $5
             RETURNING *`,
            [
                datos.introduccion ?? null,
                datos.contenido ?? null,
                datos.imagen1 ?? null,
                datos.imagen2 ?? null,
                id_tema
            ]
        );

        if (resultado.rows.length === 0) {
            return undefined;
        }

        return this.mapFilaAFila(resultado.rows[0]);
    }

    async eliminar(id_tema: number): Promise<boolean> {
        const resultado = await pool.query(
            "DELETE FROM Tema WHERE id_tema = $1",
            [id_tema]
        );

        return (resultado.rowCount ?? 0) > 0;
    }

    async existe(id_tema: number): Promise<boolean> {
        const resultado = await pool.query(
            "SELECT id_tema FROM Tema WHERE id_tema = $1",
            [id_tema]
        );

        return resultado.rows.length > 0;
    }

    // Un tema es "del docente" si es dueño de la materia a la que pertenece.
    async esDelDocente(id_tema: number, id_docente: number): Promise<boolean> {
        const resultado = await pool.query(
            `SELECT t.id_tema
             FROM Tema t
             INNER JOIN Materia m ON m.id_materia = t.id_materia
             WHERE t.id_tema = $1 AND m.id_docente = $2`,
            [id_tema, id_docente]
        );

        return resultado.rows.length > 0;
    }

}
