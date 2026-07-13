import { Request, Response } from "express";
import RepositorioActividades from "../repositories/RepositorioActividades";
import { RepositorioTemas } from "../repositories/RepositorioTemas";

const repoTemas = new RepositorioTemas();

class ActividadController {

    // =====================================================
    // GET /actividades/tema/:idTema
    // =====================================================
    async obtenerPorTema(req: Request, res: Response): Promise<Response> {

        try {

            const idTema = Number(req.params.idTema);

            if (!Number.isInteger(idTema)) {
                return res.status(400).json({ ok: false, mensaje: "ID de tema inválido." });
            }

            const actividades = await RepositorioActividades.obtenerPorTema(idTema);

            return res.status(200).json({ ok: true, total: actividades.length, data: actividades });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ ok: false, mensaje: "Error al obtener las actividades." });
        }
    }

    // =====================================================
    // GET /actividades/:id
    // =====================================================
    async obtenerPorId(req: Request, res: Response): Promise<Response> {

        try {

            const id = Number(req.params.id);

            if (!Number.isInteger(id)) {
                return res.status(400).json({ ok: false, mensaje: "ID inválido." });
            }

            const actividad = await RepositorioActividades.obtenerPorId(id);

            if (!actividad) {
                return res.status(404).json({ ok: false, mensaje: "Actividad no encontrada." });
            }

            return res.status(200).json({ ok: true, data: actividad });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ ok: false, mensaje: "Error del servidor." });
        }
    }

    // =====================================================
    // POST /actividades
    // =====================================================
    async crear(req: Request, res: Response): Promise<Response> {

        try {

            const usuario = (req as any).usuario;
            const { titulo, descripcion, fecha_limite, puntaje, archivos_permitidos, id_tema } = req.body;
            const archivos = ((req as any).files as Express.Multer.File[] | undefined) ?? [];

            if (!titulo || !id_tema) {
                return res.status(400).json({ ok: false, mensaje: "El título y el tema son obligatorios." });
            }

            const temaExiste = await repoTemas.existe(Number(id_tema));

            if (!temaExiste) {
                return res.status(404).json({ ok: false, mensaje: "El tema indicado no existe." });
            }

            if (usuario.rol === "docente") {
                const propietario = await repoTemas.esDelDocente(Number(id_tema), usuario.id);

                if (!propietario) {
                    return res.status(403).json({ ok: false, mensaje: "No puedes crear actividades en un tema que no es tuyo." });
                }
            }

            const actividad = await RepositorioActividades.crear({
                titulo,
                descripcion,
                fecha_limite: fecha_limite ? new Date(fecha_limite) : undefined,
                puntaje: puntaje !== undefined ? Number(puntaje) : undefined,
                archivos_permitidos,
                archivos_apoyo: archivos.map(archivo => ({
                    url: `actividades/${archivo.filename}`,
                    nombre_original: archivo.originalname
                })),
                id_tema: Number(id_tema),
                id_docente: usuario.id
            });

            return res.status(201).json({ ok: true, mensaje: "Actividad creada correctamente.", data: actividad });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ ok: false, mensaje: "No fue posible crear la actividad." });
        }
    }

    // =====================================================
    // PUT /actividades/:id
    // =====================================================
    async actualizar(req: Request, res: Response): Promise<Response> {

        try {

            const id = Number(req.params.id);
            const usuario = (req as any).usuario;

            if (!Number.isInteger(id)) {
                return res.status(400).json({ ok: false, mensaje: "ID inválido." });
            }

            const actividadExistente = await RepositorioActividades.obtenerPorId(id);

            if (!actividadExistente) {
                return res.status(404).json({ ok: false, mensaje: "La actividad no existe." });
            }

            if (usuario.rol === "docente") {
                const propietario = await RepositorioActividades.esDelDocente(id, usuario.id);

                if (!propietario) {
                    return res.status(403).json({ ok: false, mensaje: "No puedes modificar esta actividad." });
                }
            }

            const { titulo, descripcion, fecha_limite, puntaje, archivos_permitidos } = req.body;
            const archivosNuevos = ((req as any).files as Express.Multer.File[] | undefined) ?? [];

            if (!titulo) {
                return res.status(400).json({ ok: false, mensaje: "El título es obligatorio." });
            }

            const actualizada = await RepositorioActividades.actualizar(id, {
                titulo,
                descripcion,
                fecha_limite: fecha_limite ? new Date(fecha_limite) : undefined,
                puntaje: puntaje !== undefined ? Number(puntaje) : undefined,
                archivos_permitidos,
                archivos_apoyo: [
                    ...(actividadExistente.archivos_apoyo ?? []),
                    ...archivosNuevos.map(archivo => ({
                        url: `actividades/${archivo.filename}`,
                        nombre_original: archivo.originalname
                    }))
                ]
            });

            return res.status(200).json({ ok: true, mensaje: "Actividad actualizada correctamente.", data: actualizada });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ ok: false, mensaje: "Error al actualizar la actividad." });
        }
    }

    // =====================================================
    // DELETE /actividades/:id
    // =====================================================
    async eliminar(req: Request, res: Response): Promise<Response> {

        try {

            const id = Number(req.params.id);
            const usuario = (req as any).usuario;

            if (!Number.isInteger(id)) {
                return res.status(400).json({ ok: false, mensaje: "ID inválido." });
            }

            if (usuario.rol === "docente") {
                const propietario = await RepositorioActividades.esDelDocente(id, usuario.id);

                if (!propietario) {
                    return res.status(403).json({ ok: false, mensaje: "No puedes eliminar esta actividad." });
                }
            }

            const eliminada = await RepositorioActividades.eliminar(id);

            if (!eliminada) {
                return res.status(404).json({ ok: false, mensaje: "Actividad no encontrada." });
            }

            return res.status(200).json({ ok: true, mensaje: "Actividad eliminada correctamente." });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ ok: false, mensaje: "No fue posible eliminar la actividad." });
        }
    }

    // =====================================================
    // POST /actividades/:id/entregar  (alumno, multipart/form-data)
    // =====================================================
    async entregar(req: Request, res: Response): Promise<Response> {

        try {

            const idActividad = Number(req.params.id);
            const usuario = (req as any).usuario;
            const archivo = (req as any).file as Express.Multer.File | undefined;
            const { comentario, url_entrega } = req.body;

            if (!Number.isInteger(idActividad)) {
                return res.status(400).json({ ok: false, mensaje: "ID inválido." });
            }

            const actividad = await RepositorioActividades.obtenerPorId(idActividad);

            if (!actividad) {
                return res.status(404).json({ ok: false, mensaje: "Actividad no encontrada." });
            }

            if (!archivo && !url_entrega) {
                return res.status(400).json({ ok: false, mensaje: "Debes adjuntar un archivo o una URL para entregar la actividad." });
            }

            const entrega = await RepositorioActividades.entregar({
                id_usuario: usuario.id,
                id_actividad: idActividad,
                archivo_url: archivo ? `entregas/${archivo.filename}` : undefined,
                nombre_original: archivo ? archivo.originalname : undefined,
                url_entrega,
                comentario_alumno: comentario
            });

            return res.status(201).json({ ok: true, mensaje: "Actividad entregada correctamente.", data: entrega });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ ok: false, mensaje: "No fue posible entregar la actividad." });
        }
    }

    // =====================================================
    // GET /actividades/:id/entregas  (docente/admin)
    // =====================================================
    async obtenerEntregas(req: Request, res: Response): Promise<Response> {

        try {

            const idActividad = Number(req.params.id);
            const usuario = (req as any).usuario;

            if (!Number.isInteger(idActividad)) {
                return res.status(400).json({ ok: false, mensaje: "ID inválido." });
            }

            if (usuario.rol === "docente") {
                const propietario = await RepositorioActividades.esDelDocente(idActividad, usuario.id);

                if (!propietario) {
                    return res.status(403).json({ ok: false, mensaje: "No puedes ver las entregas de esta actividad." });
                }
            }

            const entregas = await RepositorioActividades.obtenerEntregasDeActividad(idActividad);

            return res.status(200).json({ ok: true, total: entregas.length, data: entregas });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ ok: false, mensaje: "Error del servidor." });
        }
    }

    // =====================================================
    // GET /actividades/alumno/mis-entregas  (alumno)
    // =====================================================
    async misEntregas(req: Request, res: Response): Promise<Response> {

        try {

            const usuario = (req as any).usuario;

            const entregas = await RepositorioActividades.obtenerEntregasDeAlumno(usuario.id);

            return res.status(200).json({ ok: true, total: entregas.length, data: entregas });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ ok: false, mensaje: "Error del servidor." });
        }
    }

    // =====================================================
    // PUT /actividades/entregas/:idEntrega/calificar  (docente/admin)
    // =====================================================
    async calificar(req: Request, res: Response): Promise<Response> {

        try {

            const idEntrega = Number(req.params.idEntrega);
            const usuario = (req as any).usuario;
            const { calificacion, observaciones_docente } = req.body;

            if (!Number.isInteger(idEntrega)) {
                return res.status(400).json({ ok: false, mensaje: "ID inválido." });
            }

            if (calificacion === undefined || isNaN(Number(calificacion))) {
                return res.status(400).json({ ok: false, mensaje: "La calificación es obligatoria y debe ser numérica." });
            }

            const entrega = await RepositorioActividades.obtenerEntregaPorId(idEntrega);

            if (!entrega) {
                return res.status(404).json({ ok: false, mensaje: "Entrega no encontrada." });
            }

            if (usuario.rol === "docente") {
                const propietario = await RepositorioActividades.esDelDocente(entrega.id_actividad, usuario.id);

                if (!propietario) {
                    return res.status(403).json({ ok: false, mensaje: "No puedes calificar esta entrega." });
                }
            }

            const actualizada = await RepositorioActividades.calificar(idEntrega, Number(calificacion), observaciones_docente);

            return res.status(200).json({ ok: true, mensaje: "Entrega calificada correctamente.", data: actualizada });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ ok: false, mensaje: "No fue posible calificar la entrega." });
        }
    }

}

export default new ActividadController();
