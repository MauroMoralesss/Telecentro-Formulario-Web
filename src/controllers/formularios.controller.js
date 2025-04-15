import {
  crearFormulario,
  obtenerTodosFormularios,
  obtenerFormularioPorId,
  actualizarFormulario,
  obtenerFormulariosPorTecnico,
} from "../models/formularios.model.js";

import { cloudinary } from "../libs/cloudinary.js"; // asegurate de importar 'cloudinary', no 'uploader'
import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);

// Crear formulario (admin)
export const crear = async (req, res) => {
  try {
    const formulario = await crearFormulario(req.body);
    res.status(201).json(formulario);
  } catch (error) {
    console.error("Error al crear formulario:", error.message);
    res.status(500).json({ error: "Error al crear formulario" });
  }
};

// Ver todos los formularios (admin)
export const listarTodos = async (req, res) => {
  const formularios = await obtenerTodosFormularios();
  res.json(formularios);
};

// Ver formulario por ID
export const obtener = async (req, res) => {
  const formulario = await obtenerFormularioPorId(req.params.id);
  if (!formulario)
    return res.status(404).json({ message: "Formulario no encontrado" });
  res.json(formulario);
};

// Actualizar campos generales (admin)
export const editar = async (req, res) => {
  const formulario = await actualizarFormulario(req.params.id, req.body);
  res.json(formulario);
};

// Cambiar estado (admin)
export const cambiarEstado = async (req, res) => {
  const { id } = req.params;
  const { estado, motivo_rechazo } = req.body;

  if (!["Aprobado", "Rechazado"].includes(estado)) {
    return res.status(400).json({ message: "Estado inválido" });
  }

  const formulario = await actualizarFormulario(id, {
    estado,
    ...(estado === "Rechazado" && motivo_rechazo ? { motivo_rechazo } : {}),
  });

  res.json(formulario);
};

// Obtener formularios propios (técnico)
export const listarDelTecnico = async (req, res) => {
  const formularios = await obtenerFormulariosPorTecnico(req.userId);
  res.json(formularios);
};

// Completar formulario (técnico) con compresión previa con FFmpeg
export const completar = async (req, res) => {
  try {
    const formulario = await obtenerFormularioPorId(req.params.id);

    if (!formulario) {
      return res.status(404).json({ message: "Formulario no encontrado" });
    }

    if (!["Iniciado", "Rechazado"].includes(formulario.estado)) {
      return res.status(403).json({
        message: "Este formulario no puede ser completado en su estado actual",
      });
    }

    let videoUrl = null;

    if (req.file) {
      const inputPath = req.file.path;
      const outputPath = inputPath.replace(/\.mp4$/, "-compressed.mp4");

      console.log("🎬 Ruta del video original:", inputPath);

      try {
        const start = Date.now();
        await execAsync(
          `ffmpeg -i "${inputPath}" -vf "scale=-2:720" -c:v libx264 -crf 28 -preset veryfast -c:a aac -b:a 128k "${outputPath}"`
        );
        const end = Date.now();
        console.log(`⏱️ Tiempo de compresión: ${(end - start) / 1000}s`);
        console.log("✅ Video comprimido:", outputPath);

        const result = await cloudinary.uploader.upload(outputPath, {
          resource_type: "video",
          folder: "formularios",
        });

        videoUrl = result.secure_url;

        // 🧹 Limpieza
        await fs.unlink(inputPath);
        await fs.unlink(outputPath);
      } catch (err) {
        console.error("🔥 Error en compresión/subida:", err);
        return res.status(500).json({ message: "Error al procesar el video" });
      }
    }

    const { motivo_cierre, checklist, observaciones } = req.body;

    const actualizado = await actualizarFormulario(req.params.id, {
      motivo_cierre,
      checklist,
      observaciones,
      url_archivo: videoUrl,
      estado: "En revision",
    });

    res.json(actualizado);
  } catch (error) {
    console.error("🔥 Error al completar:", error);
    res.status(500).json({ message: "Error al completar el formulario" });
  }
};
