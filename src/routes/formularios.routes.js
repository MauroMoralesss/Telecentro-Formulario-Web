import Router from "express-promise-router";
import {
  crear,
  listarTodos,
  obtener,
  editar,
  cambiarEstado,
  listarDelTecnico,
  completar,
  editarCamposBasicos,
} from "../controllers/formularios.controller.js";
import { registerClient } from "../services/sse.service.js";
import { isAuth } from "../middlewares/auth.middleware.js";
import { uploadMultiple } from "../middlewares/upload.middleware.js";
import { registrarHistorial } from "../controllers/historial.controller.js";

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
router.patch("/formularios/:id/estado", isAuth, registrarHistorial, cambiarEstado);
router.put("/formularios/:id/campos-basicos", isAuth, registrarHistorial, editarCamposBasicos);

// Técnico
router.patch("/formularios/:id/completar", isAuth, uploadMultiple, registrarHistorial, completar);

export default router;
