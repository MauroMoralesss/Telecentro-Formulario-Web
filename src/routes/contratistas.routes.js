import Router from "express-promise-router";
import { isAuth } from "../middlewares/auth.middleware.js";
import { contratistasActivos, validarContratista } from "../controllers/contratistas.controller.js";

const router = Router();

router.get("/contratistas/activos", contratistasActivos);
router.get("/contratistas/validar/:slug", validarContratista);

export default router;
