import { Router } from "express";

import MateriaController from "../controllers/MateriaController";
import ExamenFinalController from "../controllers/ExamenFinalController";

import { authMiddleware } from "../middlewares/authMiddleware";
import { permitirRoles } from "../middlewares/rolesMiddleware";

const router = Router();

/*
==================================
CONSULTAS
==================================
*/

router.get(
    "/",
    authMiddleware,
    MateriaController.obtenerTodas
);

router.get(
    "/asignatura/:id",
    authMiddleware,
    MateriaController.obtenerPorAsignatura
);

router.get(
    "/:id",
    authMiddleware,
    MateriaController.obtenerPorId
);

router.get(
    "/:id/indice",
    authMiddleware,
    MateriaController.obtenerIndice
);

/*
==================================
EXAMEN FINAL (uno por materia, solo un link a Google Forms)
==================================
*/

router.get(
    "/:id/examen",
    authMiddleware,
    ExamenFinalController.obtenerPorMateria
);

router.post(
    "/:id/examen",
    authMiddleware,
    permitirRoles("docente", "admin"),
    ExamenFinalController.guardar
);

router.delete(
    "/:id/examen",
    authMiddleware,
    permitirRoles("docente", "admin"),
    ExamenFinalController.eliminar
);

/*
==================================
DOCENTE Y ADMIN
==================================
*/

router.post(
    "/",
    authMiddleware,
    permitirRoles("docente", "admin"),
    MateriaController.crear
);

router.put(
    "/:id",
    authMiddleware,
    permitirRoles("docente", "admin"),
    MateriaController.actualizar
);

router.delete(
    "/:id",
    authMiddleware,
    permitirRoles("docente", "admin"),
    MateriaController.eliminar
);

export default router;