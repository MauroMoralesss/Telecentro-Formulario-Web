import {
    crearFormulario,
    obtenerTodosFormularios,
    obtenerFormularioPorId,
    actualizarFormulario,
    obtenerFormulariosPorTecnico,
  } from "../models/formularios.model.js";
  
  // Crear formulario (admin)
  export const crear = async (req, res) => {
    const formulario = await crearFormulario(req.body);
    res.status(201).json(formulario);
  };
  
  // Ver todos los formularios (admin)
  export const listarTodos = async (req, res) => {
    const formularios = await obtenerTodosFormularios();
    res.json(formularios);
  };
  
  // Ver formulario por ID
  export const obtener = async (req, res) => {
    const formulario = await obtenerFormularioPorId(req.params.id);
    if (!formulario) return res.status(404).json({ message: "Formulario no encontrado" });
    res.json(formulario);
  };
  
  // Actualizar campos generales (admin)
  export const editar = async (req, res) => {
    const formulario = await actualizarFormulario(req.params.id, req.body);
    res.json(formulario);
  };
  
  // Cambiar estado (admin)
  export const cambiarEstado = async (req, res) => {
    const { estado } = req.body;
  
    if (!["Aprobado", "Rechazado"].includes(estado)) {
      return res.status(400).json({ message: "Estado inválido" });
    }
  
    const formulario = await actualizarFormulario(req.params.id, { estado });
    res.json(formulario);
  };
  
  // Obtener formularios propios (técnico)
  export const listarDelTecnico = async (req, res) => {
    const formularios = await obtenerFormulariosPorTecnico(req.userId);
    res.json(formularios);
  };
  
  // Completar formulario (técnico)
  export const completar = async (req, res) => {
    const formulario = await obtenerFormularioPorId(req.params.id);
  
    if (!formulario) {
      return res.status(404).json({ message: "Formulario no encontrado" });
    }
  
    if (!["Iniciado", "Rechazado"].includes(formulario.estado)) {
      return res.status(403).json({
        message: "Este formulario no puede ser completado en su estado actual",
      });
    }
  
    const { motivo_cierre, checklist, observaciones } = req.body;
    const url_archivo = req.file?.path || null;
  
    const actualizado = await actualizarFormulario(req.params.id, {
      motivo_cierre,
      checklist,
      observaciones,
      url_archivo,
      estado: "En revision",
    });
  
    res.json(actualizado);
  };
  