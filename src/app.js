import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";

import authRoutes from "./routes/auth.routes.js";
import formulariosRoutes from "./routes/formularios.routes.js";
import tecnicosRoutes from "./routes/tecnicos.routes.js";
import { ORIGIN } from "./config.js";
import { pool } from "./db.js";

const app = express();

// Middlewares
app.use(
  cors({
    origin: ORIGIN,
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.get("/", (req, res) => res.json({ message: "bienvenido a mi API" }));
app.get("/api/ping", async (req, res) => {
  const result = await pool.query("SELECT NOW()");
  return res.json(result.rows[0]);
});
app.use("/api", authRoutes);
app.use("/api", formulariosRoutes);
app.use("/api", tecnicosRoutes);

// Error Hander
app.use((err, req, res, next) => {
  res.status(500).json({
    status: "error",
    message: err.message,
  });
});

export default app;