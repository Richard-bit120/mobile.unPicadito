import { axiosInstance } from '@/api/axiosInstance';

export interface PredioItem {
    id: number;
    nombre: string;
    direccion: string;
    localidad: string;
    distanciaKm?: number;
    ubicacion?: string | { x: number; y: number };
    telefono?: string;
}

export interface CanchaItem {
    id: number;
    predioId?: number;
    nombre: string;
    tipo: string;
    precioPorHora: number;
    superficie?: string;
    activo?: boolean;
}

export const predioService = {
    buscarCercanos: async (filtros: { lat?: number; lng?: number; radioKm?: number; busqueda?: string } = {}) => {
        const params: Record<string, any> = {};
        if (filtros.lat !== undefined) params.lat = filtros.lat;
        if (filtros.lng !== undefined) params.lng = filtros.lng;
        if (filtros.radioKm !== undefined) params.radioKm = filtros.radioKm;
        if (filtros.busqueda) params.busqueda = filtros.busqueda;

        const response = await axiosInstance.get('/predios/cercanos', { params });
        return (response.data?.data ?? []) as PredioItem[];
    },

    getCanchasPorPredio: async (predioId: number) => {
        const response = await axiosInstance.get(`/predios/${predioId}/canchas`);
        return (response.data?.data ?? []) as CanchaItem[];
    },
};
