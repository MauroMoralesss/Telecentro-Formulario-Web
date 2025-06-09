import express from "express";
import timeout from "connect-timeout";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";

import authRoutes from "./routes/auth.routes.js";
import formulariosRoutes from "./routes/formularios.routes.js";
import tecnicosRoutes from "./routes/tecnicos.routes.js";
import historialRoutes from "./routes/historial.routes.js";
import contratistasRoutes from "./routes/contratistas.routes.js";
import { ORIGIN } from "./config.js";
import { pool } from "./db.js";

const app = express();

// ⏱ Timeout + límites de payload
app.use(timeout("10m")); // Hasta 10 minutos de espera para requests lentos
// Si la solicitud se canceló por timeout, no continuar
app.use((req, res, next) => {
  if (!req.timedout) next();
});
app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ extended: true, limit: "500mb" }));

const allowedOrigins = [
  "https://magoo.solutions",
  "https://www.magoo.solutions",
  "http://localhost:5173",
];

// Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(cookieParser());

// Routes
app.get("/", (req, res) => res.json({ message: "bienvenido a mi API" }));
app.get("/api/ping", async (req, res) => {
  const result = await pool.query("SELECT NOW()");
  return res.json(result.rows[0]);
});
app.use("/api", authRoutes);
app.use("/api", formulariosRoutes);
app.use("/api", tecnicosRoutes);
app.use("/api", historialRoutes);
app.use("/api", contratistasRoutes);


// Error Handler
app.use((err, req, res, next) => {
  res.status(500).json({
    status: "error",
    message: err.message,
  });
});

export default app;
