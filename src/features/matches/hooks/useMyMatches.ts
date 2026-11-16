import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { matchService } from '../services/matchService';
import { RawSalaSearchItem } from '../types/match.types';

export const useMyMatches = () => {
    const [matches, setMatches] = useState<RawSalaSearchItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const hasLoadedRef = useRef(false);

    const fetchMyMatches = useCallback(async (isRefresh = false) => {
        if (!hasLoadedRef.current && !isRefresh) {
            setLoading(true);
        }
        setError(null);
        try {
            const data = await matchService.getMyRooms();
            setMatches(Array.isArray(data) ? data : []);
            hasLoadedRef.current = true;
        } catch (err: any) {
            setError(err.message || 'Error al cargar tus partidos.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchMyMatches(false);
        }, [fetchMyMatches])
    );

    const refresh = useCallback(() => {
        setRefreshing(true);
        fetchMyMatches(true);
    }, [fetchMyMatches]);

    return {
        matches,
        loading,
        refreshing,
        error,
        refresh,
    };
};

