export const validateSchema = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync(req.body);
    next();
  } catch (error) {
    if (Array.isArray(error.errors)) {
      const primerMensaje = error.errors[0]?.message || "Datos inválidos";
      return res.status(400).json({ message: primerMensaje });
    }

    return res.status(400).json({ message: error.message || "Error desconocido" });
  }
};
