import { axiosInstance } from '@/api/axiosInstance';

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    nombre: string;
    apellido: string;
    nombreUsuario: string;
    email: string;
    password: string;
    passwordConfirm: string;
}

export const authService = {
    login: async (credentials: LoginPayload) => {
        const response = await axiosInstance.post('/users/login', credentials);
        return response.data;
    },

    register: async (payload: RegisterPayload) => {
        const response = await axiosInstance.post('/users/register', payload);
        return response.data;
    },
};