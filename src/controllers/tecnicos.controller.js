import { obtenerTodosLosTecnicos } from "../models/tecnicos.model.js";
import { cambiarEstadoTecnico } from "../models/tecnicos.model.js";
import { obtenerTecnicoPorId } from "../models/tecnicos.model.js";

export const listarTecnicos = async (req, res) => {
  try {
    const tecnicos = await obtenerTodosLosTecnicos(req.id_contratista);
    res.json(tecnicos);
  } catch (error) {
    console.error("Error al obtener técnicos:", error);
    res.status(500).json({ error: "Error al obtener técnicos" });
  }
};

export const obtenerTecnico = async (req, res) => {
  try {
    const tecnico = await obtenerTecnicoPorId(req.params.id, req.id_contratista);
    if (!tecnico) {
      return res.status(404).json({ message: "Técnico no encontrado" });
    }
    res.json(tecnico);
  } catch (error) {
    console.error("Error al obtener técnico:", error);
    res.status(500).json({ error: "Error al obtener técnico" });
  }
};

export const cambiarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;
    
    const tecnico = await cambiarEstadoTecnico(id, activo, req.id_contratista);
    if (!tecnico) {
      return res.status(404).json({ message: "Técnico no encontrado" });
    }
    
    res.json(tecnico);
  } catch (error) {
    console.error("Error al cambiar estado del técnico:", error);
    res.status(500).json({ error: "Error al cambiar estado del técnico" });
  }
};

