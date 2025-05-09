export const PORT = process.env.PORT || 3000;

export const PG_PORT = process.env.PG_PORT || 5432;
export const PG_HOST = process.env.PG_HOST || "host.docker.internal"; // "host.docker.internal";
export const PG_USER = process.env.PG_USER || "postgres";
export const PG_PASSWORD = process.env.PG_PASSWORD || "root";
export const PG_DATABASE = process.env.PG_DATABASE || "formv1";

export const ORIGIN = process.env.ORIGIN || "http://localhost:5173"; // cambiar para produccion

