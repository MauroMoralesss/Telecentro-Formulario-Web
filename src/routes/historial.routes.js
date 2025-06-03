import Router from "express-promise-router";
import {
  obtenerHistorial,
  obtenerEstadisticas,
  registrarHistorial
} from "../controllers/historial.controller.js";
import { isAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/historial/:id_formulario", isAuth, obtenerHistorial);
router.get("/historial/:id_formulario/estadisticas", isAuth, obtenerEstadisticas);
router.post("/historial/:id_formulario", isAuth, registrarHistorial);

export default router; 