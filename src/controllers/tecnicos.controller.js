import { obtenerTodosLosTecnicos } from "../models/tecnicos.model.js";

export const listarTecnicos = async (req, res) => {
  const tecnicos = await obtenerTodosLosTecnicos();
  res.json(tecnicos);
};
