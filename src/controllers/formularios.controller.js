import {
  crearFormulario,
  obtenerTodosFormularios,
  obtenerFormularioPorId,
  actualizarFormulario,
  obtenerFormulariosPorTecnico,
  editarCamposBasicos as editarCamposBasicosDB
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
import {
  crearFormularioSchema,
  editarCamposBasicosSchema
} from "../schemas/formularios.schema.js";
const execAsync = promisify(exec);

// Crear formulario (admin)
export const crear = async (req, res) => {
  try {
    const formulario = await crearFormulario({
      ...req.body,
      id_contratista: req.id_contratista
    });
    
    // Registrar historial de creación
    const { registrarAccion } = await import("../models/historial.model.js");
    const camposModificados = {};
    Object.entries(req.body).forEach(([key, value]) => {
      camposModificados[key] = { anterior: null, nuevo: value };
    });
    
    await registrarAccion({
      formulario_id: formulario.id_formulario,
      tecnico_id: req.userId,
      accion: "Creación",
      detalles: "Formulario creado",
      estado_anterior: null,
      estado_nuevo: formulario.estado || "Iniciado",
      campos_modificados: camposModificados
    });
    
    res.locals.nuevoFormularioId = formulario.id_formulario;
    res.status(201).json(formulario);
  } catch (error) {
    console.error("Error al crear formulario:", error.message);
    res.status(500).json({ error: "Error al crear formulario" });
  }
};

// Ver todos los formularios (admin)
export const listarTodos = async (req, res) => {
  try {
    const formularios = await obtenerTodosFormularios(req.id_contratista);
    res.json(formularios);
  } catch (error) {
    console.error("Error al obtener formularios:", error);
    res.status(500).json({ error: "Error al obtener formularios" });
  }
};

// Ver formulario por ID
export const obtener = async (req, res) => {
  try {
    const formulario = await obtenerFormularioPorId(req.params.id, req.id_contratista);
    if (!formulario) {
      return res.status(404).json({ message: "Formulario no encontrado" });
    }

    // Obtener dispositivos del formulario
    const dispositivos = await obtenerDispositivosPorFormulario(req.params.id);
    console.log('Dispositivos encontrados:', dispositivos);

    res.json({ ...formulario, dispositivos });
  } catch (error) {
    console.error("Error al obtener formulario:", error);
    res.status(500).json({ message: "Error al obtener el formulario" });
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
  // broadcast("formulario-actualizado", {
  //   id: formulario.id_formulario,
  //   nro_orden: formulario.nro_orden,
  //   nuevoEstado: formulario.estado,
  // });

  res.json(formulario);
};

// Obtener formularios propios (técnico)
export const listarDelTecnico = async (req, res) => {
  try {
    const formularios = await obtenerFormulariosPorTecnico(req.userId, req.id_contratista);
    res.json(formularios);
  } catch (error) {
    console.error("Error al obtener formularios del técnico:", error);
    res.status(500).json({ error: "Error al obtener formularios" });
  }
};

// Completar formulario (técnico) con compresión previa con FFmpeg
export const completar = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el formulario existe y pertenece al contratista
    const formularioExistente = await obtenerFormularioPorId(id, req.id_contratista);
    if (!formularioExistente) {
      return res.status(404).json({ message: "Formulario no encontrado" });
    }

    // Procesar videos
    const procesarVideo = async (file, tipo) => {
      if (!file) return null;
      
      try {
        const inputPath = file.path;
        const outputPath = inputPath.replace(/\.[^/.]+$/, `-${tipo}-compressed.mp4`);
        
        console.log(`🎬 Procesando video ${tipo}:`, inputPath);
        
        // Comprimir video con FFmpeg
        await execAsync(
          `ffmpeg -i "${inputPath}" -vf "scale=-2:720" -c:v libx264 -crf 28 -preset veryfast -c:a aac -b:a 128k "${outputPath}"`
        );
        
        console.log(`✅ Video ${tipo} comprimido:`, outputPath);
        
        // Subir a Cloudinary
        const result = await cloudinary.uploader.upload(outputPath, {
          resource_type: "video",
          folder: "formularios",
        });
        
        // Limpiar archivos temporales
        await fs.unlink(inputPath);
        await fs.unlink(outputPath);
        
        return result.secure_url;
      } catch (error) {
        console.error(`Error procesando video ${tipo}:`, error);
        throw error;
      }
    };

    // Procesar todos los videos
    const [url_video_interior, url_video_exterior, url_video_extra] = await Promise.all([
      procesarVideo(req.files?.video_interior?.[0], 'interior'),
      procesarVideo(req.files?.video_exterior?.[0], 'exterior'),
      procesarVideo(req.files?.video_extra?.[0], 'extra')
    ]);

    // Extraer y validar dispositivos
    let dispositivos = [];
    if (req.body.dispositivos) {
      try {
        dispositivos = JSON.parse(req.body.dispositivos);
      } catch (error) {
        console.error('Error al parsear dispositivos:', error);
        return res.status(400).json({ 
          message: "Formato inválido de dispositivos",
          error: error.message 
        });
      }
    }

    // Actualizar el formulario con todos los datos
    const datosActualizacion = {
      motivo_cierre: req.body.motivo_cierre,
      checklist: req.body.checklist,
      observaciones: req.body.observaciones,
      estado: "En revision",
      url_video_interior,
      url_video_exterior,
      url_video_extra: url_video_extra || null,
      latitud: req.body.latitud || null,
      longitud: req.body.longitud || null
    };

    // Actualizar el formulario
    const formularioActualizado = await actualizarFormulario(id, datosActualizacion);

    // Actualizar dispositivos
    if (dispositivos.length > 0) {
      await borrarDispositivosPorFormulario(id);
      await crearDispositivos(id, dispositivos);
    }

    // Obtener dispositivos actualizados
    const dispositivosActualizados = await obtenerDispositivosPorFormulario(id);

    // Registrar en el historial
    const { registrarAccion } = await import("../models/historial.model.js");
    const camposModificados = {
      estado: {
        anterior: formularioExistente.estado,
        nuevo: "En revision"
      },
      motivo_cierre: {
        anterior: formularioExistente.motivo_cierre,
        nuevo: req.body.motivo_cierre
      },
      checklist: {
        anterior: formularioExistente.checklist,
        nuevo: req.body.checklist
      },
      observaciones: {
        anterior: formularioExistente.observaciones,
        nuevo: req.body.observaciones
      },
      videos: {
        anterior: {
          interior: formularioExistente.url_video_interior,
          exterior: formularioExistente.url_video_exterior,
          extra: formularioExistente.url_video_extra
        },
        nuevo: {
          interior: url_video_interior,
          exterior: url_video_exterior,
          extra: url_video_extra
        }
      },
      dispositivos: {
        anterior: formularioExistente.dispositivos || [],
        nuevo: dispositivos
      }
    };

    await registrarAccion({
      formulario_id: id,
      tecnico_id: req.userId,
      accion: "Completado",
      detalles: "Formulario completado por técnico",
      estado_anterior: formularioExistente.estado,
      estado_nuevo: "En revision",
      campos_modificados: camposModificados
    });

    // —— BROADCAST DE NOTIFICACION ——
    broadcast("formulario-actualizado", {
      id: formularioActualizado.id_formulario,
      nro_orden: formularioActualizado.nro_orden,
      nuevoEstado: formularioActualizado.estado,
    });

    // Devolver respuesta
    res.json({ ...formularioActualizado, dispositivos: dispositivosActualizados });

  } catch (error) {
    console.error('Error al completar formulario:', error);
    res.status(500).json({ 
      message: "Error al completar el formulario",
      error: error.message 
    });
  }
};

// Editar campos básicos del formulario
export const editarCamposBasicos = async (req, res) => {
  if (!req.params.id) {
    return res.status(400).json({ message: "ID de formulario no proporcionado" });
  }

  try {
    // Validar datos con Zod
    const validatedData = editarCamposBasicosSchema.safeParse(req.body);
    if (!validatedData.success) {
      return res.status(400).json({
        message: "Datos inválidos",
        errors: validatedData.error.errors
      });
    }

    // Verificar si el formulario existe
    const formularioExistente = await obtenerFormularioPorId(req.params.id, req.id_contratista);
    if (!formularioExistente) {
      return res.status(404).json({ message: "Formulario no encontrado" });
    }

    // Verificar el estado del formulario
    if (formularioExistente.estado !== "Iniciado") {
      return res.status(403).json({
        message: "Solo se pueden editar formularios en estado 'Iniciado'"
      });
    }

    // Preparar datos para actualización
    const datosActualizacion = {
      tecnico_id: req.body.tecnico_id,
      nro_orden: req.body.nro_orden,
      nro_cliente: req.body.nro_cliente,
      nombre: req.body.nombre,
      domicilio: req.body.domicilio,
      telefono: req.body.telefono,
      servicios_instalar: req.body.servicios_instalar,
      id_contratista: req.id_contratista
    };

    // Actualizar formulario usando la función del modelo renombrada
    const formularioActualizado = await editarCamposBasicosDB(req.params.id, datosActualizacion);

    // Enviar respuesta
    return res.status(200).json(formularioActualizado);
  } catch (error) {
    console.error("Error al editar formulario:", error);
    return res.status(500).json({ 
      message: "Error al editar formulario",
      error: error.message 
    });
  }
};
