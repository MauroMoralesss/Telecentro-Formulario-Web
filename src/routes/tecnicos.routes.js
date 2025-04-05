import Router from "express-promise-router";
import { listarTecnicos } from "../controllers/tecnicos.controller.js";
import { obtenerTecnico } from "../controllers/tecnicos.controller.js";
import { cambiarEstado } from "../controllers/tecnicos.controller.js";
import { isAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/tecnicos", isAuth, listarTecnicos);
router.get("/tecnico/:id", isAuth, obtenerTecnico);
router.patch("/tecnicos/:id/estado", isAuth, cambiarEstado);

export default router;
