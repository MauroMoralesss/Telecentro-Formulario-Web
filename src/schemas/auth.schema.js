import {z} from 'zod'

export const signupSchema = z.object({
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
    rol: z.enum(["admin", "tecnico"]).optional()
})

export const signinSchema = z.object({
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
    }).max(255, {
        message: 'La contraseña debe tener como maximo 255 caracteres'
    })
})