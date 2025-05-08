// upload.middleware.js
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Ruta actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear carpeta temporal si no existe en la carpeta `src/temp`
const tempFolder = path.join(__dirname, "../temp");
if (!fs.existsSync(tempFolder)) {
  fs.mkdirSync(tempFolder);
}

// Limite de tamaño y configuración base
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempFolder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 700 }, // 700MB
});

// Subir dos archivos (interior y exterior)
export const uploadMultiple = upload.fields([
  { name: "video_interior", maxCount: 1 },
  { name: "video_exterior", maxCount: 1 },
  { name: "video_extra", maxCount: 1 },
]);
