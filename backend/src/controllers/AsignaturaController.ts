import { Request, Response } from "express";
import RepositorioAsignaturas from "../repositories/RepositorioAsignaturas";

class AsignaturaController {

    // =====================================================
    // GET /asignaturas
    // =====================================================
    async obtenerTodas(req: Request, res: Response): Promise<Response> {

        try {

            const asignaturas = await RepositorioAsignaturas.obtenerTodas();

            return res.status(200).json({
                ok: true,
                total: asignaturas.length,
                data: asignaturas
            });

        } catch (error) {

            console.error(error);

            return res.status(500).json({
                ok: false,
                mensaje: "Error al obtener las asignaturas."
            });

        }

    }

    // =====================================================
    // GET /asignaturas/:id
    // =====================================================
    async obtenerPorId(req: Request, res: Response): Promise<Response> {

        try {

            const id = Number(req.params.id);

            if (isNaN(id)) {

                return res.status(400).json({
                    ok: false,
                    mensaje: "ID inválido."
                });

            }

            const asignatura = await RepositorioAsignaturas.obtenerPorId(id);

            if (!asignatura) {

                return res.status(404).json({
                    ok: false,
                    mensaje: "Asignatura no encontrada."
                });

            }

            return res.status(200).json({
                ok: true,
                data: asignatura
            });

        } catch (error) {

            console.error(error);

            return res.status(500).json({
                ok: false,
                mensaje: "Error del servidor."
            });

        }

    }

    // =====================================================
    // POST /asignaturas
    // =====================================================
    async crear(req: Request, res: Response): Promise<Response> {

        try {

            const {

                nombre,

                imagen,

                color

            } = req.body;

            if (!nombre || nombre.trim() === "") {

                return res.status(400).json({
                    ok: false,
                    mensaje: "El nombre es obligatorio."
                });

            }

            const existe = await RepositorioAsignaturas.buscarPorNombre(nombre);

            if (existe) {

                return res.status(409).json({
                    ok: false,
                    mensaje: "Ya existe una asignatura con ese nombre."
                });

            }

            const nueva = await RepositorioAsignaturas.crear({

                nombre,

                imagen,

                color

            });

            return res.status(201).json({
                ok: true,
                mensaje: "Asignatura creada correctamente.",
                data: nueva
            });

        } catch (error) {

            console.error(error);

            return res.status(500).json({
                ok: false,
                mensaje: "No fue posible crear la asignatura."
            });

        }

    }

    // =====================================================
    // PUT /asignaturas/:id
    // =====================================================
    async actualizar(req: Request, res: Response): Promise<Response> {

        try {

            const id = Number(req.params.id);

            if (isNaN(id)) {

                return res.status(400).json({
                    ok: false,
                    mensaje: "ID inválido."
                });

            }

            const existe = await RepositorioAsignaturas.existe(id);

            if (!existe) {

                return res.status(404).json({
                    ok: false,
                    mensaje: "La asignatura no existe."
                });

            }

            const {

                nombre,

                imagen,

                color

            } = req.body;

            const actualizada = await RepositorioAsignaturas.actualizar(id, {

                nombre,

                imagen,

                color

            });

            return res.status(200).json({

                ok: true,

                mensaje: "Asignatura actualizada correctamente.",

                data: actualizada

            });

        } catch (error) {

            console.error(error);

            return res.status(500).json({

                ok: false,

                mensaje: "Error al actualizar."

            });

        }

    }

    // =====================================================
    // DELETE /asignaturas/:id
    // =====================================================
    async eliminar(req: Request, res: Response): Promise<Response> {

        try {

            const id = Number(req.params.id);

            if (isNaN(id)) {

                return res.status(400).json({

                    ok: false,

                    mensaje: "ID inválido."

                });

            }

            const eliminado = await RepositorioAsignaturas.eliminar(id);

            if (!eliminado) {

                return res.status(404).json({

                    ok: false,

                    mensaje: "Asignatura no encontrada."

                });

            }

            return res.status(200).json({

                ok: true,

                mensaje: "Asignatura eliminada correctamente."

            });

        } catch (error) {

            console.error(error);

            return res.status(500).json({

                ok: false,

                mensaje: "No fue posible eliminar."

            });

        }

    }

}

export default new AsignaturaController();