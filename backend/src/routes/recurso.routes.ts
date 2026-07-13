import { Router } from "express";

import RecursoController from "../controllers/RecursoController";

import { authMiddleware } from "../middlewares/authMiddleware";
import { permitirRoles } from "../middlewares/rolesMiddleware";
import { uploadRecurso } from "../config/uploadAcademico";

const router = Router();

/*
==========================================
CONSULTAS (todos los roles autenticados)
==========================================
*/

router.get(
    "/tema/:idTema",
    authMiddleware,
    RecursoController.obtenerPorTema
);

router.get(
    "/:id",
    authMiddleware,
    RecursoController.obtenerPorId
);

router.get(
    "/:id/descargar",
    authMiddleware,
    RecursoController.descargar
);

/*
==========================================
DOCENTE Y ADMIN
==========================================
*/

router.post(
    "/",
    authMiddleware,
    permitirRoles("docente", "admin"),
    uploadRecurso.single("archivo"),
    RecursoController.crear
);

router.put(
    "/:id",
    authMiddleware,
    permitirRoles("docente", "admin"),
    RecursoController.actualizar
);

router.delete(
    "/:id",
    authMiddleware,
    permitirRoles("docente", "admin"),
    RecursoController.eliminar
);

export default router;
