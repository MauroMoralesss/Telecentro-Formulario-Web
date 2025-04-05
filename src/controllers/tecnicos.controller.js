import { obtenerTodosLosTecnicos } from "../models/tecnicos.model.js";
import { cambiarEstadoTecnico } from "../models/tecnicos.model.js";
import { obtenerTecnicoPorId } from "../models/tecnicos.model.js";

export const listarTecnicos = async (req, res) => {
  const tecnicos = await obtenerTodosLosTecnicos();
  res.json(tecnicos);
};

export const obtenerTecnico = async (req, res) => {
  const { id } = req.params;
  const tecnico = await obtenerTecnicoPorId(id);

  if (!tecnico) {
    return res.status(404).json({ message: "Técnico no encontrado" });
  }

  res.json(tecnico);
};

export const cambiarEstado = async (req, res) => {
  const { id } = req.params;
  const { activo } = req.body;

  const tecnicoActualizado = await cambiarEstadoTecnico(id, activo);
  res.json(tecnicoActualizado);
};

