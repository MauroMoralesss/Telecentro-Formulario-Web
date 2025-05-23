import {
  crearFormulario,
  obtenerTodosFormularios,
  obtenerFormularioPorId,
  actualizarFormulario,
  obtenerFormulariosPorTecnico,
} from "../models/formularios.model.js";

import {
  borrarDispositivosPorFormulario,
  crearDispositivos,
  obtenerDispositivosPorFormulario,
} from "../models/dispositivo.model.js";

import { broadcast } from "../services/sse.service.js";
import { cloudinary } from "../libs/cloudinary.js";
import path from "path";
import fs from "fs/promises";
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
  try {
    const formulario = await obtenerFormularioPorId(req.params.id);
    if (!formulario)
      return res.status(404).json({ message: "Formulario no encontrado" });

    const dispositivos = await obtenerDispositivosPorFormulario(
      formulario.id_formulario
    );

    return res.json({ ...formulario, dispositivos });
  } catch (err) {
    console.error("Error al obtener el formulario:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
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

  if (!["Aprobado", "Rechazado", "Visto sin validar"].includes(estado)) {
    return res.status(400).json({ message: "Estado inválido" });
  }

  const formulario = await actualizarFormulario(id, {
    estado,
    ...(estado === "Rechazado" && motivo_rechazo ? { motivo_rechazo } : {}),
  });

  // Notifico a todos los clientes SSE conectados
/*   broadcast("formulario-actualizado", {
    id: formulario.id_formulario,
    nro_orden: formulario.nro_orden,
    nuevoEstado: formulario.estado,
  }); */

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

    const files = req.files;
    let url_interior = null;
    let url_exterior = null;
    let url_extra = null;

    const procesarVideo = async (archivo, tipo) => {
      const inputPath = archivo.path;
      const { name } = path.parse(inputPath);
      const outputPath = path.join(
        path.dirname(inputPath),
        `${name}-${tipo}-compressed.mp4`
      );

      console.log(`🎬 ${tipo}: Ruta original:`, inputPath);

      try {
        await execAsync(
          `ffmpeg -i "${inputPath}" -vf "scale=-2:720" -c:v libx264 -crf 28 -preset veryfast -c:a aac -b:a 128k "${outputPath}"`
        );
      } catch (error) {
        console.error(`❌ Error en compresión FFmpeg: ${error.message}`);
        throw new Error("Error al procesar el video.");
      }

      console.log(`✅ ${tipo}: Comprimido:`, outputPath);

      const result = await cloudinary.uploader.upload(outputPath, {
        resource_type: "video",
        folder: "formularios",
      });

      // 🧹 Limpieza
      await fs.unlink(inputPath);
      await fs.unlink(outputPath);

      return result.secure_url;
    };

    try {
      if (files?.video_interior) {
        url_interior = await procesarVideo(files.video_interior[0], "interior");
      }

      if (files?.video_exterior) {
        url_exterior = await procesarVideo(files.video_exterior[0], "exterior");
      }
      if (files?.video_extra) {
        url_extra = await procesarVideo(files.video_extra[0], "extra");
      }
    } catch (err) {
      console.error("🔥 Error en compresión/subida:", err);
      return res.status(500).json({ message: "Error al procesar los videos" });
    }

    const dispositivosPayload = req.body.dispositivos
      ? JSON.parse(req.body.dispositivos)
      : [];

    await borrarDispositivosPorFormulario(formulario.id_formulario);

    await crearDispositivos(formulario.id_formulario, dispositivosPayload);

    const { motivo_cierre, checklist, observaciones, latitud, longitud } =
      req.body;

    const actualizado = await actualizarFormulario(req.params.id, {
      motivo_cierre,
      checklist,
      observaciones,
      url_video_interior: url_interior,
      url_video_exterior: url_exterior,
      url_video_extra: url_extra,
      estado: "En revision",
      motivo_rechazo: null,
      ...(latitud != null && longitud != null ? { latitud, longitud } : {}),
    });

    const dispositivos = await obtenerDispositivosPorFormulario(
      formulario.id_formulario
    );

    // —— BROADCAST DE NOTIFICACION ——
    broadcast("formulario-actualizado", {
      id: actualizado.id_formulario,
      nro_orden: actualizado.nro_orden,
      nuevoEstado: actualizado.estado,
    });

    return res.json({ ...actualizado, dispositivos });
  } catch (error) {
    console.error("🔥 Error al completar:", error);
    res.status(500).json({ message: "Error al completar el formulario" });
  }
};
