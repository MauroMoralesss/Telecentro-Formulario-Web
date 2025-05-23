import Router from "express-promise-router";
import {
  crear,
  listarTodos,
  obtener,
  editar,
  cambiarEstado,
  listarDelTecnico,
  completar,
} from "../controllers/formularios.controller.js";
import { registerClient } from "../services/sse.service.js";
import { isAuth } from "../middlewares/auth.middleware.js";
import { uploadMultiple } from "../middlewares/upload.middleware.js";

const router = Router();

// Técnico
router.get("/formularios/mios", isAuth, listarDelTecnico);

// Admin
router.get("/formularios/events", (req, res) =>
  registerClient(req, res)
);
router.post("/formularios", isAuth, crear);
router.get("/formularios", isAuth, listarTodos);
router.get("/formularios/:id", isAuth, obtener);
router.put("/formularios/:id", isAuth, editar);
router.patch("/formularios/:id/estado", isAuth, cambiarEstado);

// Técnico
router.patch("/formularios/:id/completar", isAuth, uploadMultiple, completar);

export default router;
