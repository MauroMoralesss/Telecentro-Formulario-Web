import { z } from "zod";

export const crearFormularioSchema = z.object({
  tecnico_id: z.number(),
  nro_orden: z.string().min(1),
  nro_cliente: z.string().min(1),
  abonado: z.string().min(1),
  vt: z.string().min(1),
});