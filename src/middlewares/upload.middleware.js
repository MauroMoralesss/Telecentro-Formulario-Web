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
    // Asegurarse de que el nombre del archivo sea seguro
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

const fileFilter = (req, file, cb) => {
  // Aceptar solo archivos de video
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de video'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { 
    fileSize: 1024 * 1024 * 700, // 700MB máximo
    files: 3 // Máximo 3 archivos
  }
});

// Middleware para subir videos (interior, exterior y extra)
export const uploadMultiple = upload.fields([
  { name: "video_interior", maxCount: 1 },
  { name: "video_exterior", maxCount: 1 },
  { name: "video_extra", maxCount: 1 }
]);
