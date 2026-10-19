import * as yup from 'yup';

export const searchPlayerSchema = yup.object({
    search: yup
        .string()
        .trim()
        .min(2, 'Escriba al menos 2 caracteres')
        .max(50, 'Búsqueda demasiado larga'),
});

export const validatePlayerSearch = async (
    search: string
): Promise<{ valid: boolean; error?: string }> => {
    try {
        await searchPlayerSchema.validate({ search });
        return { valid: true };
    } catch (err: any) {
        return { valid: false, error: err.message };
    }
};
