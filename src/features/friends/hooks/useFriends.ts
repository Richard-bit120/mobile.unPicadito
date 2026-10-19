import { useState } from 'react';
import { friendService } from '../services/friendService';

export const useFriends = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sentSuccess, setSentSuccess] = useState(false);

    const sendFriendRequest = async (receiverId: number | string) => {
        setLoading(true);
        setError(null);
        setSentSuccess(false);
        try {
            await friendService.sendRequest(receiverId);
            setSentSuccess(true);
        } catch (err: any) {
            setError(err.message || 'No se pudo enviar la solicitud.');
        } finally {
            setLoading(false);
        }
    };

    const respondToRequest = async (
        requestId: number | string,
        status: 'ACCEPTED' | 'REJECTED'
    ) => {
        setLoading(true);
        setError(null);
        try {
            await friendService.respondRequest(requestId, status);
            return true;
        } catch (err: any) {
            setError(err.message || 'No se pudo responder la solicitud.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        sentSuccess,
        sendFriendRequest,
        respondToRequest,
    };
};
