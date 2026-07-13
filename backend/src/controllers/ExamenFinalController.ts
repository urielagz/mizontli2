import { Request, Response } from "express";
import RepositorioExamenFinal from "../repositories/RepositorioExamenFinal";
import RepositorioMaterias from "../repositories/RepositorioMateria";

class ExamenFinalController {

    // =====================================================
    // GET /materias/:id/examen
    // =====================================================
    async obtenerPorMateria(req: Request, res: Response): Promise<Response> {

        try {

            const idMateria = Number(req.params.id);

            if (!Number.isInteger(idMateria)) {
                return res.status(400).json({ ok: false, mensaje: "ID de materia inválido." });
            }

            const examen = await RepositorioExamenFinal.obtenerPorMateria(idMateria);

            if (!examen) {
                return res.status(404).json({ ok: false, mensaje: "Esta materia todavía no tiene examen final configurado." });
            }

            return res.status(200).json({ ok: true, data: examen });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ ok: false, mensaje: "Error del servidor." });
        }
    }

    // =====================================================
    // POST /materias/:id/examen  (docente/admin) - crea o actualiza
    // =====================================================
    async guardar(req: Request, res: Response): Promise<Response> {

        try {

            const idMateria = Number(req.params.id);
            const usuario = (req as any).usuario;

            if (!Number.isInteger(idMateria)) {
                return res.status(400).json({ ok: false, mensaje: "ID de materia inválido." });
            }

            const materiaExiste = await RepositorioMaterias.existe(idMateria);

            if (!materiaExiste) {
                return res.status(404).json({ ok: false, mensaje: "La materia indicada no existe." });
            }

            if (usuario.rol === "docente") {
                const propietario = await RepositorioMaterias.esDelDocente(idMateria, usuario.id);

                if (!propietario) {
                    return res.status(403).json({ ok: false, mensaje: "No puedes configurar el examen final de esta materia." });
                }
            }

            const { titulo, descripcion, url_formulario } = req.body;

            if (!titulo || !url_formulario) {
                return res.status(400).json({ ok: false, mensaje: "El título y la URL del formulario son obligatorios." });
            }

            const examen = await RepositorioExamenFinal.guardar({
                titulo,
                descripcion,
                url_formulario,
                id_materia: idMateria
            });

            return res.status(200).json({ ok: true, mensaje: "Examen final guardado correctamente.", data: examen });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ ok: false, mensaje: "No fue posible guardar el examen final." });
        }
    }

    // =====================================================
    // DELETE /materias/:id/examen  (docente/admin)
    // =====================================================
    async eliminar(req: Request, res: Response): Promise<Response> {

        try {

            const idMateria = Number(req.params.id);
            const usuario = (req as any).usuario;

            if (!Number.isInteger(idMateria)) {
                return res.status(400).json({ ok: false, mensaje: "ID de materia inválido." });
            }

            if (usuario.rol === "docente") {
                const propietario = await RepositorioMaterias.esDelDocente(idMateria, usuario.id);

                if (!propietario) {
                    return res.status(403).json({ ok: false, mensaje: "No puedes eliminar el examen final de esta materia." });
                }
            }

            const eliminado = await RepositorioExamenFinal.eliminar(idMateria);

            if (!eliminado) {
                return res.status(404).json({ ok: false, mensaje: "Esta materia no tiene examen final configurado." });
            }

            return res.status(200).json({ ok: true, mensaje: "Examen final eliminado correctamente." });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ ok: false, mensaje: "No fue posible eliminar el examen final." });
        }
    }

}

export default new ExamenFinalController();
