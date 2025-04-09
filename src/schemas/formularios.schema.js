import { z } from "zod";

export const crearFormularioSchema = z.object({
  tecnico_id: z.number(),
  nro_orden: z
    .string()
    .min(1, { message: "El número de orden es obligatorio" }),
  nro_cliente: z
    .string()
    .min(1, { message: "El número de cliente es obligatorio" }),
  nombre: z.string().min(1, { message: "El nombre es obligatorio" }),
  domicilio: z.string().min(1, { message: "El domicilio es obligatorio" }),
  telefono: z.string().regex(/^\d{8,20}$/, {
    message:
      "El teléfono debe contener solo números y tener entre 8 y 20 dígitos",
  }),
});
