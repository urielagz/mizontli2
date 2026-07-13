import { Router } from "express";

import AsignaturaController from "../controllers/AsignaturaController";

import { authMiddleware } from "../middlewares/authMiddleware";

import { adminMiddleware } from "../middlewares/adminMiddleware";

const router = Router();

/*
==========================================
CONSULTAS
==========================================
*/

router.get(
    "/",
    authMiddleware,
    AsignaturaController.obtenerTodas
);

router.get(
    "/:id",
    authMiddleware,
    AsignaturaController.obtenerPorId
);

/*
==========================================
ADMIN
==========================================
*/

router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    AsignaturaController.crear
);

router.put(
    "/:id",
    authMiddleware,
    adminMiddleware,
    AsignaturaController.actualizar
);

router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    AsignaturaController.eliminar
);

export default router;