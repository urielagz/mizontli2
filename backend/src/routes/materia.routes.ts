import { Router } from "express";

import MateriaController from "../controllers/MateriaController";

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
INSCRIPCIÓN (alumno se inscribe con el token que recibió el docente)
==================================
*/

router.post(
    "/inscribirse",
    authMiddleware,
    permitirRoles("alumno"),
    MateriaController.inscribirse
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

router.post(
    "/:id/aviso",
    authMiddleware,
    permitirRoles("docente", "admin"),
    MateriaController.avisoImportante
);

export default router;
