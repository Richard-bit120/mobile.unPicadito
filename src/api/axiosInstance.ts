import { ENV } from '@/config/env';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const axiosInstance = axios.create({
    baseURL: ENV.API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000,
});

axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = useAuthStore.getState().token;
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError<{ message?: string }>) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().logout();
        }

        if (error.response?.data?.message) {
            return Promise.reject(new Error(error.response.data.message));
        }

        if (error.response) {
            return Promise.reject(new Error(`Error del servidor (HTTP ${error.response.status}).`));
        }

        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
            return Promise.reject(new Error('El servidor tardó demasiado en responder. Intenta nuevamente.'));
        }

        return Promise.reject(
            new Error(
                'No se pudo conectar con el servidor. Verifica que el celular esté en la misma red Wi-Fi y que el servidor permita conexiones desde la red local.'
            )
        );
    }
);