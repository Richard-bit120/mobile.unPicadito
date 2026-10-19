import { axiosInstance } from '@/api/axiosInstance';

export const profileService = {
    getMyProfile: async () => {
        const response = await axiosInstance.get('/users/me');
        return response.data;
    },

    updateMyProfile: async (profileData: Record<string, any>) => {
        const response = await axiosInstance.patch('/users/me', profileData);
        return response.data;
    },

    getPublicProfileById: async (userId: number | string) => {
        const response = await axiosInstance.get(`/users/${userId}`);
        return response.data;
    },
};