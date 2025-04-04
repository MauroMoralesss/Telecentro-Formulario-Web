import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../libs/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "formularios", // Carpeta donde se guarda en Cloudinary
    resource_type: "auto", // Acepta imagen o video
  },
});

export const upload = multer({ storage });
