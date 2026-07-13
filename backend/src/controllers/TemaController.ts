import { Request, Response } from "express";
import { RepositorioTemas } from "../repositories/RepositorioTemas";
import RepositorioMaterias from "../repositories/RepositorioMateria";

const repo = new RepositorioTemas();

export class TemaController {

    listar = async (_req: Request, res: Response) => {
        try {
            const temas = await repo.listar();
            res.json({ ok: true, total: temas.length, data: temas });
        } catch (error) {
            console.error(error);
            res.status(500).json({ ok: false, mensaje: "Error al obtener los temas." });
        }
    };

    obtenerPorId = async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id);

            if (!Number.isInteger(id)) {
                return res.status(400).json({ ok: false, mensaje: "ID inválido." });
            }

            const tema = await repo.buscarPorId(id);

            if (!tema) {
                return res.status(404).json({ ok: false, mensaje: "Tema no encontrado." });
            }

            res.json({ ok: true, data: tema });
        } catch (error) {
            console.error(error);
            res.status(500).json({ ok: false, mensaje: "Error del servidor." });
        }
    };

    agregar = async (req: Request, res: Response) => {
        try {
            const usuario = (req as any).usuario;
            const { nombre, descripcion, orden, id_materia } = req.body;

            if (!nombre || !descripcion || orden === undefined || !id_materia) {
                return res.status(400).json({ ok: false, mensaje: "Datos incompletos" });
            }

            if (usuario.rol === "docente") {
                const propietario = await RepositorioMaterias.esDelDocente(Number(id_materia), usuario.id);

                if (!propietario) {
                    return res.status(403).json({ ok: false, mensaje: "No puedes agregar temas a una materia que no es tuya." });
                }
            }

            const tema = await repo.agregar(nombre, descripcion, Number(orden), Number(id_materia));

            res.status(201).json({ ok: true, mensaje: "Tema creado correctamente.", data: tema });
        } catch (error) {
            console.error(error);
            res.status(500).json({ ok: false, mensaje: "No fue posible crear el tema." });
        }
    };

    actualizar = async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id);
            const usuario = (req as any).usuario;

            if (!Number.isInteger(id)) {
                return res.status(400).json({ ok: false, mensaje: "ID inválido." });
            }

            const existe = await repo.existe(id);

            if (!existe) {
                return res.status(404).json({ ok: false, mensaje: "Tema no encontrado." });
            }

            if (usuario.rol === "docente") {
                const propietario = await repo.esDelDocente(id, usuario.id);

                if (!propietario) {
                    return res.status(403).json({ ok: false, mensaje: "No puedes modificar este tema." });
                }
            }

            const { nombre, descripcion, orden } = req.body;

            if (!nombre || !descripcion || orden === undefined) {
                return res.status(400).json({ ok: false, mensaje: "Datos incompletos" });
            }

            const tema = await repo.actualizar(id, nombre, descripcion, Number(orden));

            res.json({ ok: true, mensaje: "Tema actualizado correctamente.", data: tema });
        } catch (error) {
            console.error(error);
            res.status(500).json({ ok: false, mensaje: "Error al actualizar el tema." });
        }
    };

    // =====================================================
    // PUT /temas/:id/contenido  (docente/admin)
    // Edita el cuerpo del capítulo: introducción, contenido e imágenes.
    // =====================================================
    actualizarContenido = async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id);
            const usuario = (req as any).usuario;

            if (!Number.isInteger(id)) {
                return res.status(400).json({ ok: false, mensaje: "ID inválido." });
            }

            const existe = await repo.existe(id);

            if (!existe) {
                return res.status(404).json({ ok: false, mensaje: "Tema no encontrado." });
            }

            if (usuario.rol === "docente") {
                const propietario = await repo.esDelDocente(id, usuario.id);

                if (!propietario) {
                    return res.status(403).json({ ok: false, mensaje: "No puedes modificar este tema." });
                }
            }

            const { introduccion, contenido, imagen1, imagen2 } = req.body;

            const tema = await repo.actualizarContenido(id, { introduccion, contenido, imagen1, imagen2 });

            res.json({ ok: true, mensaje: "Contenido del tema actualizado correctamente.", data: tema });
        } catch (error) {
            console.error(error);
            res.status(500).json({ ok: false, mensaje: "Error al actualizar el contenido del tema." });
        }
    };

    buscarPorMateria = async (req: Request, res: Response) => {
        try {
            const idMateria = Number(req.params.idMateria);

            if (!Number.isInteger(idMateria)) {
                return res.status(400).json({ ok: false, mensaje: "ID inválido." });
            }

            const data = await repo.buscarPorMateria(idMateria);
            res.json({ ok: true, total: data.length, data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ ok: false, mensaje: "Error del servidor." });
        }
    };

    eliminar = async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id);
            const usuario = (req as any).usuario;

            if (!Number.isInteger(id)) {
                return res.status(400).json({ ok: false, mensaje: "ID inválido." });
            }

            if (usuario.rol === "docente") {
                const propietario = await repo.esDelDocente(id, usuario.id);

                if (!propietario) {
                    return res.status(403).json({ ok: false, mensaje: "No puedes eliminar este tema." });
                }
            }

            const ok = await repo.eliminar(id);

            if (!ok) {
                return res.status(404).json({ ok: false, mensaje: "Tema no encontrado." });
            }

            res.json({ ok: true, mensaje: "Tema eliminado." });
        } catch (error) {
            console.error(error);
            res.status(500).json({ ok: false, mensaje: "Error del servidor." });
        }
    };
}
