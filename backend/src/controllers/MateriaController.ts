import { Request, Response } from "express";
import RepositorioMaterias from "../repositories/RepositorioMateria";
import { RepositorioTemas } from "../repositories/RepositorioTemas";
import RepositorioExamenFinal from "../repositories/RepositorioExamenFinal";

const repoTemas = new RepositorioTemas();

class MateriaController {

    // =====================================================
    // GET /materias
    // =====================================================

    async obtenerTodas(req: Request, res: Response) {

        try {

            const materias = await RepositorioMaterias.obtenerTodas();

            return res.status(200).json({
                ok: true,
                total: materias.length,
                data: materias
            });

        } catch (error) {

            console.error(error);

            return res.status(500).json({
                ok: false,
                mensaje: "Error al obtener las materias."
            });

        }

    }

    // =====================================================
    // GET /materias/:id
    // =====================================================

    async obtenerPorId(req: Request, res: Response) {

        try {

            const id = Number(req.params.id);

            if (!Number.isFinite(id) || !Number.isInteger(id)) {

                return res.status(400).json({
                    ok: false,
                    mensaje: "ID inválido."
                });

            }

            const materia = await RepositorioMaterias.obtenerPorId(id);

            if (!materia) {

                return res.status(404).json({
                    ok: false,
                    mensaje: "Materia no encontrada."
                });

            }

            return res.json({
                ok: true,
                data: materia
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
    // GET /asignaturas/:id/materias
    // =====================================================

    async obtenerPorAsignatura(req: Request, res: Response) {

        try {

            const idAsignatura = Number(req.params.id);

            if (!Number.isFinite(idAsignatura) || !Number.isInteger(idAsignatura)) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "ID inválido."
                });
            }

            const materias = await RepositorioMaterias.obtenerPorAsignatura(idAsignatura);

            return res.json({

                ok: true,

                total: materias.length,

                data: materias

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
    // POST /materias
    // =====================================================

    async crear(req: any, res: Response) {

        try {

            const usuario = req.usuario;

            const {

                nombre,
                icono,
                color,
                orden,
                id_asignatura,
                id_docente

            } = req.body;

            if (!nombre || !id_asignatura) {

                return res.status(400).json({

                    ok: false,

                    mensaje: "Datos incompletos."

                });

            }

            // Docente solo puede crear para él mismo

            if (usuario.rol === "docente") {

                if (usuario.id != id_docente) {

                    return res.status(403).json({

                        ok: false,

                        mensaje: "No puedes crear materias para otro docente."

                    });

                }

            }

            const materia = await RepositorioMaterias.crear({

                nombre,

                icono,

                color,

                orden,

                id_asignatura,

                id_docente

            });

            return res.status(201).json({

                ok: true,

                mensaje: "Materia creada correctamente.",

                data: materia

            });

        } catch (error) {

            console.error(error);

            return res.status(500).json({

                ok: false,

                mensaje: "Error al crear la materia."

            });

        }

    }

    // =====================================================
    // PUT
    // =====================================================

    async actualizar(req: any, res: Response) {

        try {

            const id = Number(req.params.id);

            const usuario = req.usuario;

            const existe = await RepositorioMaterias.existe(id);

            if (!existe) {

                return res.status(404).json({

                    ok: false,

                    mensaje: "Materia inexistente."

                });

            }

            if (usuario.rol === "docente") {

                const propietario = await RepositorioMaterias.esDelDocente(
                    id,
                    usuario.id
                );

                if (!propietario) {

                    return res.status(403).json({

                        ok: false,

                        mensaje: "No puedes modificar esta materia."

                    });

                }

            }

            const materia = await RepositorioMaterias.actualizar(id, req.body);

            return res.json({

                ok: true,

                mensaje: "Materia actualizada.",

                data: materia

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
    // DELETE
    // =====================================================

    async eliminar(req: any, res: Response) {

        try {

            const id = Number(req.params.id);

            const usuario = req.usuario;

            if (usuario.rol === "docente") {

                const propietario = await RepositorioMaterias.esDelDocente(
                    id,
                    usuario.id
                );

                if (!propietario) {

                    return res.status(403).json({

                        ok: false,

                        mensaje: "No puedes eliminar esta materia."

                    });

                }

            }

            const eliminado = await RepositorioMaterias.eliminar(id);

            if (!eliminado) {

                return res.status(404).json({

                    ok: false,

                    mensaje: "Materia no encontrada."

                });

            }

            return res.json({

                ok: true,

                mensaje: "Materia eliminada."

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
    // GET /materias/:id/indice
    // Navegación de la materia: temas ordenados + examen final.
    // No almacena nada, solo compone lo que ya existe.
    // =====================================================

    async obtenerIndice(req: Request, res: Response) {

        try {

            const id = Number(req.params.id);

            if (!Number.isInteger(id)) {
                return res.status(400).json({ ok: false, mensaje: "ID inválido." });
            }

            const materia = await RepositorioMaterias.existe(id);

            if (!materia) {
                return res.status(404).json({ ok: false, mensaje: "Materia no encontrada." });
            }

            const temas = await repoTemas.buscarIndicePorMateria(id);
            const examenFinal = await RepositorioExamenFinal.obtenerPorMateria(id);

            return res.json({
                ok: true,
                data: { temas, examenFinal }
            });

        } catch (error) {

            console.error(error);

            return res.status(500).json({ ok: false, mensaje: "Error del servidor." });

        }

    }

}

export default new MateriaController();