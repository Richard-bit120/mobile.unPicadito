import { useCallback, useEffect, useState } from 'react';
import { matchService } from '../services/matchService';
import { MatchFilters, RawSalaSearchItem } from '../types/match.types';

const INITIAL_FILTERS: MatchFilters = {
    search: '',
    date: '',
    time: '',
    onlyAvailable: false,
    nombreCancha: '',
    esPublica: '',
    permiteSuplentes: '',
};

export const useMatches = () => {
    const [filters, setFilters] = useState<MatchFilters>(INITIAL_FILTERS);
    const [matches, setMatches] = useState<RawSalaSearchItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMatches = useCallback(async () => {
        setError(null);
        try {
            const data = await matchService.getAvailableRooms(filters);
            setMatches(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError(err.message || 'Error al cargar los partidos');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [filters]);

    useEffect(() => {
        setLoading(true);
        fetchMatches();
    }, [fetchMatches]);

    const setFilter = useCallback((key: keyof MatchFilters, value: any) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    }, []);

    const resetFilters = useCallback(() => {
        setFilters(INITIAL_FILTERS);
    }, []);

    const refresh = useCallback(() => {
        setRefreshing(true);
        fetchMatches();
    }, [fetchMatches]);

    return {
        filters,
        setFilter,
        resetFilters,
        matches,
        loading,
        refreshing,
        error,
        refresh,
    };
};