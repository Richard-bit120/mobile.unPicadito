import * as yup from 'yup';

export const roomSchema = yup.object().shape({
    nombre: yup
        .string()
        .required('El nombre del partido es obligatorio')
        .min(3, 'Mínimo 3 caracteres')
        .max(50, 'Máximo 50 caracteres'),
    canchaId: yup
        .number()
        .typeError('Debe ser un número válido')
        .optional(),
    nombreCancha: yup
        .string()
        .max(50, 'Máximo 50 caracteres')
        .optional(),
    direccion: yup
        .string()
        .max(100, 'Máximo 100 caracteres')
        .optional(),
    fecha: yup.string().required('La fecha es obligatoria'),
    hora: yup.string().required('La hora es obligatoria'),
    cuposTotales: yup
        .number()
        .typeError('Debe ser un número entero')
        .required('Define el límite de jugadores')
        .min(2, 'Mínimo 2 jugadores'),
    permiteSuplentes: yup.boolean().default(true),
    esPublica: yup.boolean().default(true),
    descripcion: yup
        .string()
        .max(200, 'Máximo 200 caracteres')
        .optional(),
});

export const createRoomSchema = roomSchema.shape({
    canchaId: yup
        .number()
        .typeError('Debe seleccionar una cancha')
        .required('Debe seleccionar una cancha')
        .positive('Debe seleccionar una cancha válida'),
}).test(
    'fecha-futura-hora-en-punto',
    'La fecha debe ser futura y la hora en punto',
    function ({ fecha, hora }) {
        if (!fecha || !hora) return true;
        const targetDate = new Date(`${fecha}T${hora}:00`);
        if (isNaN(targetDate.getTime())) return true;

        if (targetDate <= new Date()) {
            return this.createError({
                path: 'fecha',
                message: 'La fecha y hora del partido deben ser futuras',
            });
        }

        if (targetDate.getMinutes() !== 0) {
            return this.createError({
                path: 'hora',
                message: 'La hora debe ser en punto (ej: 18:00, 19:00)',
            });
        }

        return true;
    }
);
