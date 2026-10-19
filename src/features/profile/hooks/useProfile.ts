import { useCallback, useEffect, useState } from 'react';
import { profileService } from '../services/profileService';

export const useProfile = (userId?: number | string) => {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = userId
                ? await profileService.getPublicProfileById(userId)
                : await profileService.getMyProfile();
            setProfile(data);
        } catch (err: any) {
            setError(err.message || 'No se pudo cargar el perfil.');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    return { profile, loading, error, refresh: fetchProfile };
};