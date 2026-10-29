import { axiosInstance } from '@/api/axiosInstance';

export interface CreateReviewPayload {
    calificadoId: number;
    salaId?: string;
    estrellas: number;
    comentario?: string;
}

export const reviewService = {
    crearReview: async (payload: CreateReviewPayload) => {
        const response = await axiosInstance.post('/reviews', payload);
        return response.data?.data || response.data;
    },

    getRanking: async (userId: number) => {
        const response = await axiosInstance.get(`/reviews/ranking/${userId}`);
        return response.data?.data || response.data;
    },
};
