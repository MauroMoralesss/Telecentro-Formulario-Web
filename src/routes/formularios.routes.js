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
import { isAuth } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

// Técnico
router.get("/formularios/mios", isAuth, listarDelTecnico);

// Admin
router.post("/formularios", isAuth, crear);
router.get("/formularios", isAuth, listarTodos);
router.get("/formularios/:id", isAuth, obtener);
router.put("/formularios/:id", isAuth, editar);
router.patch("/formularios/:id/estado", isAuth, cambiarEstado);

// Técnico
router.patch(
  "/formularios/:id/completar",
  isAuth,
  upload.single("archivo"),
  completar
);

export default router;
