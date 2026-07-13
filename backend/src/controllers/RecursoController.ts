import { Request, Response } from "express";
import path from "path";
import RepositorioRecursos from "../repositories/RepositorioRecursos";
import { RepositorioTemas } from "../repositories/RepositorioTemas";
import { clasificarTipo } from "../config/uploadAcademico";

const repoTemas = new RepositorioTemas();

class RecursoController {

    // =====================================================
    // GET /recursos/tema/:idTema
    // =====================================================
    async obtenerPorTema(req: Request, res: Response): Promise<Response> {

        try {

            const idTema = Number(req.params.idTema);

            if (!Number.isInteger(idTema)) {
                return res.status(400).json({ ok: false, mensaje: "ID de tema inválido." });
            }

            const recursos = await RepositorioRecursos.obtenerPorTema(idTema);

            return res.status(200).json({ ok: true, total: recursos.length, data: recursos });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ ok: false, mensaje: "Error al obtener los recursos." });
        }
    }

    // =====================================================
    // GET /recursos/:id
    // =====================================================
    async obtenerPorId(req: Request, res: Response): Promise<Response> {

        try {

            const id = Number(req.params.id);

            if (!Number.isInteger(id)) {
                return res.status(400).json({ ok: false, mensaje: "ID inválido." });
            }

            const recurso = await RepositorioRecursos.obtenerPorId(id);

            if (!recurso) {
                return res.status(404).json({ ok: false, mensaje: "Recurso no encontrado." });
            }

            return res.status(200).json({ ok: true, data: recurso });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ ok: false, mensaje: "Error del servidor." });
        }
    }

    // =====================================================
    // POST /recursos  (multipart/form-data, campo "archivo")
    // =====================================================
    async crear(req: Request, res: Response): Promise<Response> {

        try {

            const usuario = (req as any).usuario;
            const archivo = (req as any).file as Express.Multer.File | undefined;
            const { titulo, descripcion, id_tema } = req.body;

            if (!titulo || !id_tema) {
                return res.status(400).json({ ok: false, mensaje: "El título y el tema son obligatorios." });
            }

            if (!archivo) {
                return res.status(400).json({ ok: false, mensaje: "Debes adjuntar un archivo." });
            }

            const temaExiste = await repoTemas.existe(Number(id_tema));

            if (!temaExiste) {
                return res.status(404).json({ ok: false, mensaje: "El tema indicado no existe." });
            }

            if (usuario.rol === "docente") {
                const propietario = await repoTemas.esDelDocente(Number(id_tema), usuario.id);

                if (!propietario) {
                    return res.status(403).json({ ok: false, mensaje: "No puedes subir recursos a un tema que no es tuyo." });
                }
            }

            const extension = path.extname(archivo.originalname);

            const recurso = await RepositorioRecursos.crear({
                titulo,
                descripcion,
                tipo: clasificarTipo(extension) as any,
                url_archivo: `recursos/${archivo.filename}`,
                nombre_original: archivo.originalname,
                extension,
                tamano_bytes: archivo.size,
                id_tema: Number(id_tema),
                id_usuario: usuario.id
            });

            return res.status(201).json({ ok: true, mensaje: "Recurso publicado correctamente.", data: recurso });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ ok: false, mensaje: "No fue posible publicar el recurso." });
        }
    }

    // =====================================================
    // PUT /recursos/:id  (solo metadatos)
    // =====================================================
    async actualizar(req: Request, res: Response): Promise<Response> {

        try {

            const id = Number(req.params.id);
            const usuario = (req as any).usuario;

            if (!Number.isInteger(id)) {
                return res.status(400).json({ ok: false, mensaje: "ID inválido." });
            }

            const existe = await RepositorioRecursos.existe(id);

            if (!existe) {
                return res.status(404).json({ ok: false, mensaje: "El recurso no existe." });
            }

            if (usuario.rol === "docente") {
                const propietario = await RepositorioRecursos.esDelDocente(id, usuario.id);

                if (!propietario) {
                    return res.status(403).json({ ok: false, mensaje: "No puedes modificar este recurso." });
                }
            }

            const { titulo, descripcion } = req.body;

            if (!titulo) {
                return res.status(400).json({ ok: false, mensaje: "El título es obligatorio." });
            }

            const actualizado = await RepositorioRecursos.actualizar(id, titulo, descripcion);

            return res.status(200).json({ ok: true, mensaje: "Recurso actualizado correctamente.", data: actualizado });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ ok: false, mensaje: "Error al actualizar el recurso." });
        }
    }

    // =====================================================
    // DELETE /recursos/:id
    // =====================================================
    async eliminar(req: Request, res: Response): Promise<Response> {

        try {

            const id = Number(req.params.id);
            const usuario = (req as any).usuario;

            if (!Number.isInteger(id)) {
                return res.status(400).json({ ok: false, mensaje: "ID inválido." });
            }

            if (usuario.rol === "docente") {
                const propietario = await RepositorioRecursos.esDelDocente(id, usuario.id);

                if (!propietario) {
                    return res.status(403).json({ ok: false, mensaje: "No puedes eliminar este recurso." });
                }
            }

            const eliminado = await RepositorioRecursos.eliminar(id);

            if (!eliminado) {
                return res.status(404).json({ ok: false, mensaje: "Recurso no encontrado." });
            }

            return res.status(200).json({ ok: true, mensaje: "Recurso eliminado correctamente." });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ ok: false, mensaje: "No fue posible eliminar el recurso." });
        }
    }

    // =====================================================
    // GET /recursos/:id/descargar
    // =====================================================
    async descargar(req: Request, res: Response): Promise<void> {

        try {

            const id = Number(req.params.id);

            if (!Number.isInteger(id)) {
                res.status(400).json({ ok: false, mensaje: "ID inválido." });
                return;
            }

            const recurso = await RepositorioRecursos.obtenerPorId(id);

            if (!recurso) {
                res.status(404).json({ ok: false, mensaje: "Recurso no encontrado." });
                return;
            }

            const ruta = path.join(process.cwd(), process.env.UPLOADS_PATH || "uploads", recurso.url_archivo);

            res.download(ruta, recurso.nombre_original || recurso.titulo, (error) => {
                if (error && !res.headersSent) {
                    res.status(404).json({ ok: false, mensaje: "Archivo no encontrado." });
                }
            });

        } catch (error) {
            console.error(error);

            if (!res.headersSent) {
                res.status(500).json({ ok: false, mensaje: "Error del servidor." });
            }
        }
    }

}

export default new RecursoController();
