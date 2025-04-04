import Router from "express-promise-router";
import { listarTecnicos } from "../controllers/tecnicos.controller.js";
import { isAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/tecnicos", isAuth, listarTecnicos);

export default router;
