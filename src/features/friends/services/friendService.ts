import { axiosInstance } from '@/api/axiosInstance';

export const friendService = {
    sendRequest: async (receiverId: number | string) => {
        const response = await axiosInstance.post('/friendships', {
            receiverId: Number(receiverId),
        });
        return response.data;
    },

    respondRequest: async (
        requestId: number | string,
        status: 'ACCEPTED' | 'REJECTED' | 'ACEPTADA' | 'RECHAZADA'
    ) => {
        const response = await axiosInstance.patch(`/friendships/${requestId}/respond`, {
            status,
        });
        return response.data;
    },
};
