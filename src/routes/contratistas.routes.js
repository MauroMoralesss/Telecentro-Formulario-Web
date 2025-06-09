import Router from "express-promise-router";
import { isAuth } from "../middlewares/auth.middleware.js";
import { contratistasActivos } from "../controllers/contratistas.controller.js";

const router = Router();

router.get("/contratistas/activos", contratistasActivos);

export default router;
