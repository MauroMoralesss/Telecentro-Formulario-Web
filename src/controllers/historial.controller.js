import {
  registrarAccion,
  obtenerHistorialFormulario,
  obtenerEstadisticasHistorial
} from "../models/historial.model.js";
import { obtenerFormularioPorId } from "../models/formularios.model.js";

export const obtenerHistorial = async (req, res) => {
  try {
    const { id_formulario } = req.params;
    if (!id_formulario) {
      return res.status(400).json({ 
        message: "ID de formulario requerido"
      });
    }
    
    const historial = await obtenerHistorialFormulario(id_formulario, req.id_contratista);
    res.json(historial);
  } catch (error) {
    console.error("Error al obtener historial:", error);
    res.status(500).json({ 
      message: "Error al obtener el historial",
      error: error.message 
    });
  }
};

export const obtenerEstadisticas = async (req, res) => {
  try {
    const { id_formulario } = req.params;
    if (!id_formulario) {
      return res.status(400).json({ 
        message: "ID de formulario requerido"
      });
    }
    
    const estadisticas = await obtenerEstadisticasHistorial(id_formulario, req.id_contratista);
    res.json(estadisticas);
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({ 
      message: "Error al obtener las estadísticas",
      error: error.message 
    });
  }
};

// Middleware para registrar acciones automáticamente
export const registrarHistorial = async (req, res, next) => {
  try {
    console.log('Iniciando registro de historial...');
    console.log('Datos recibidos:', {
      params: req.params,
      body: req.body,
      user: req.user,
      userId: req.userId
    });

    const id_formulario = req.params.id;
    const tecnico_id = req.userId;
    
    if (!tecnico_id) {
      console.error('No se encontró el ID del técnico en la request');
      return res.status(401).json({
        message: "Usuario no autorizado"
      });
    }

    // Si no hay id_formulario y estamos en una ruta POST, es una creación
    if (!id_formulario && req.method === 'POST') {
      // Esperar a que se cree el formulario
      await next();
      
      // Registrar la creación en el historial
      await registrarAccion({
        formulario_id: res.locals.nuevoFormularioId,
        tecnico_id,
        accion: "Creación",
        detalles: "Formulario creado",
        estado_anterior: null,
        estado_nuevo: req.body.estado || "Pendiente",
        campos_modificados: req.body
      });
      
      return;
    }

    if (!id_formulario) {
      console.error('No se encontró el ID del formulario en los parámetros');
      return res.status(400).json({
        message: "ID de formulario requerido"
      });
    }

    // Obtener estado anterior
    const formularioAnterior = await obtenerFormularioPorId(id_formulario, req.id_contratista);
    if (!formularioAnterior) {
      console.error(`No se encontró el formulario con ID ${id_formulario}`);
      return res.status(404).json({
        message: "Formulario no encontrado"
      });
    }

    const estado_anterior = formularioAnterior.estado;
    const estado_nuevo = req.body.estado;
    
    // Determinar el tipo de acción y los campos modificados
    let accion = "Edición";
    let campos_modificados = {};
    
    if (estado_nuevo && estado_nuevo !== estado_anterior) {
      accion = "Cambio de estado";
      campos_modificados.estado = {
        anterior: estado_anterior,
        nuevo: estado_nuevo
      };
    } else if (req.body.motivo_cierre) {
      accion = "Completar formulario";
      
      const camposARegistrar = ['motivo_cierre', 'checklist', 'observaciones'];
      camposARegistrar.forEach(campo => {
        if (req.body[campo] !== undefined) {
          campos_modificados[campo] = {
            anterior: formularioAnterior[campo],
            nuevo: req.body[campo]
          };
        }
      });
    } else {
      const cambios = { ...req.body };
      delete cambios.estado;
      delete cambios.dispositivos;
      delete cambios.files;
      
      Object.keys(cambios).forEach(campo => {
        if (formularioAnterior[campo] !== cambios[campo]) {
          campos_modificados[campo] = {
            anterior: formularioAnterior[campo],
            nuevo: cambios[campo]
          };
        }
      });
    }

    console.log('Registrando acción en historial:', {
      accion,
      estado_anterior,
      estado_nuevo,
      campos_modificados
    });

    await registrarAccion({
      formulario_id: id_formulario,
      tecnico_id,
      accion,
      detalles: `${accion} realizada por técnico ID: ${tecnico_id}`,
      estado_anterior,
      estado_nuevo,
      campos_modificados: Object.keys(campos_modificados).length > 0 ? campos_modificados : null
    });

    console.log('Historial registrado exitosamente');
    next();
  } catch (error) {
    console.error('Error al registrar historial:', error);
    res.status(500).json({
      message: "Error al registrar el historial",
      error: error.message
    });
  }
}; 