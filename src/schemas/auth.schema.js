import {z} from 'zod'

export const signupSchema = z.object({
    id_tecnico: z.number({
        required_error: 'El ID TECNICO es requerido',
        invalid_type_error: 'El ID TECNICO debe ser un numero'
    }),
    nombre: z.string({
        required_error: 'El nombre es requerido',
        invalid_type_error: 'El nombre debe ser un texto'
    }).min(1).max(255),
    email: z.string({
        required_error: 'El email es requerido',
        invalid_type_error: 'El email debe ser un texto'
    }).email({
        message: 'El email debe ser un email valido'
    }),
    password: z.string({
        required_error: 'La contraseña es requerida',
        invalid_type_error: 'La contraseña debe ser un texto'
    }).min(2, {
        message: 'La contraseña debe tener al menos 2 caracteres'
    }).max(255),
    rol: z.enum(["admin", "tecnico"]).optional(),
    telefono: z.string({
        required_error: 'El teléfono es requerido',
        invalid_type_error: 'El teléfono debe ser un texto'
      })
      .regex(/^\d{8,20}$/, {
        message: 'El teléfono debe contener solo números y tener entre 8 y 20 dígitos'
      }),
      
})

export const signinSchema = z.object({
    id_tecnico: z.number({
        required_error: 'El ID TECNICO es requerido',
        invalid_type_error: 'El ID TECNICO debe ser un numero'
    }),
    password: z.string({
        required_error: 'La contraseña es requerida',
        invalid_type_error: 'La contraseña debe ser un texto'
    }).min(2, {
        message: 'La contraseña debe tener al menos 2 caracteres'
    }).max(255, {
        message: 'La contraseña debe tener como maximo 255 caracteres'
    }),
    slug_contratista: z.string({
        required_error: 'El contratista es requerido',
        invalid_type_error: 'El contratista debe ser un texto'
    })
})