import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { profileService } from '../services/profileService';

export const useProfile = (userId?: number | string) => {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const hasLoadedRef = useRef(false);
    const prevUserIdRef = useRef(userId);

    const fetchProfile = useCallback(
        async (silent = false) => {
            if (!silent) setLoading(true);
            setError(null);
            try {
                const data = userId
                    ? await profileService.getPublicProfileById(userId)
                    : await profileService.getMyProfile();
                setProfile(data);
                hasLoadedRef.current = true;
            } catch (err: any) {
                setError(err.message || 'No se pudo cargar el perfil.');
            } finally {
                setLoading(false);
            }
        },
        [userId]
    );

    useFocusEffect(
        useCallback(() => {
            if (prevUserIdRef.current !== userId) {
                prevUserIdRef.current = userId;
                hasLoadedRef.current = false;
            }
            fetchProfile(hasLoadedRef.current);
        }, [fetchProfile, userId])
    );

    const refresh = useCallback(() => {
        return fetchProfile(hasLoadedRef.current);
    }, [fetchProfile]);

    return { profile, loading, error, refresh };
};
