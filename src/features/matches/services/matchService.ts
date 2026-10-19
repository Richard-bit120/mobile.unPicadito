import { axiosInstance } from '@/api/axiosInstance';
import { CreateSalaPayload, MappedRoom, MatchFilters } from '../types/match.types';
import { mapRoomFromApi } from './matchMapper';

export const matchService = {
    getAvailableRooms: async (filters: MatchFilters = {}) => {
        const params: Record<string, any> = {};
        if (filters.date) {
            const time = filters.time || '00:00';
            params.fechaInicio = `${filters.date}T${time}:00`;
        }
        if (filters.onlyAvailable) {
            params.estadoDisponibilidad = 'DISPONIBLES';
        }
        if (filters.search) params.nombre = filters.search;
        if (filters.nombreCancha) params.nombreCancha = filters.nombreCancha;
        if (filters.esPublica !== '' && filters.esPublica !== undefined) {
            params.esPublica = filters.esPublica;
        }
        if (filters.permiteSuplentes !== '' && filters.permiteSuplentes !== undefined) {
            params.permiteSuplentes = filters.permiteSuplentes;
        }

        const response = await axiosInstance.get('/salas/buscar', { params });
        return response.data?.data ?? [];
    },

    getRoomById: async (id: string): Promise<MappedRoom | null> => {
        const response = await axiosInstance.get(`/salas/${id}`);
        const rawData = response.data?.data || response.data;
        return mapRoomFromApi(rawData);
    },

    createRoom: async (payload: CreateSalaPayload): Promise<MappedRoom | null> => {
        const response = await axiosInstance.post('/salas', payload);
        const createdData = response.data?.data || response.data;
        return mapRoomFromApi(createdData);
    },

    updateRoom: async (id: string, data: Partial<CreateSalaPayload>): Promise<MappedRoom | null> => {
        const response = await axiosInstance.patch(`/salas/${id}`, data);
        const updatedData = response.data?.data || response.data;
        return mapRoomFromApi(updatedData);
    },

    joinRoom: async (id: string) => {
        const response = await axiosInstance.post(`/salas/${id}/unirse`);
        return response.data;
    },

    leaveRoom: async (id: string) => {
        const response = await axiosInstance.delete(`/salas/${id}/salir`);
        return response.data;
    },

    cancelRoom: async (id: string, motivoCancelacion: string) => {
        const response = await axiosInstance.patch(`/salas/${id}/cancelar`, {
            motivoCancelacion,
        });
        return response.data;
    },

    expelPlayer: async (matchId: string, userId: number | string) => {
        const response = await axiosInstance.delete(`/salas/${matchId}/expulsar/${userId}`);
        return response.data;
    },

    transferOrganizer: async (matchId: string, nuevoOrganizadorUserId: number | string) => {
        const response = await axiosInstance.patch(`/salas/${matchId}/transferir-organizador`, {
            nuevoOrganizadorUserId: Number(nuevoOrganizadorUserId),
        });
        return response.data;
    },

    acceptJoinRequest: async (matchId: string, participacionId: string) => {
        const response = await axiosInstance.patch(
            `/salas/${matchId}/solicitudes/${participacionId}/aceptar`
        );
        return response.data;
    },
};