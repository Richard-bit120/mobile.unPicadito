import { axiosInstance } from '@/api/axiosInstance';

export interface PlayerItem {
    id: number;
    nombre: string;
    apellido: string;
    nombreUsuario: string;
    apodo?: string | null;
    fotoPerfilUrl?: string | null;
    posicionPrincipal?: string;
    reputacion?: number;
}

export const playerService = {
    searchPlayers: async (search = ''): Promise<PlayerItem[]> => {
        const clean = search.trim();
        const response = await axiosInstance.get('/users', {
            params: clean ? { q: clean, nombre: clean } : {},
        });
        const data = response.data?.data ?? response.data;
        return Array.isArray(data) ? data : [];
    },
};
