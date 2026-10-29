import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { SearchInput } from '@/components/ui/SearchInput';
import { THEME } from '@/config/theme';
import { LocationFilterBar } from '@/features/matches/components/LocationFilterBar';
import { MatchCard } from '@/features/matches/components/MatchCard';
import { MatchFilterModal } from '@/features/matches/components/MatchFilterModal';
import { useMatches } from '@/features/matches/hooks/useMatches';
import { useUserLocation } from '@/features/matches/hooks/useUserLocation';
import { useDebounce } from '@/hooks/useDebounce';
import { useRouter } from 'expo-router';
import { SlidersHorizontal } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function FeedScreen() {
    const router = useRouter();
    const {
        filters,
        setFilter,
        resetFilters,
        matches,
        loading,
        refreshing,
        error,
        refresh,
    } = useMatches();

    const { location, isLoadingGps, solicitarGps, seleccionarLocalidad } = useUserLocation();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const debouncedSearch = useDebounce(searchTerm, 400);

    useEffect(() => {
        setFilter('search', debouncedSearch);
    }, [debouncedSearch, setFilter]);

    useEffect(() => {
        if (location.lat !== undefined && location.lng !== undefined) {
            setFilter('lat', location.lat);
            setFilter('lng', location.lng);
            if (!filters.radioKm) {
                setFilter('radioKm', 20);
            }
        }
    }, [location.lat, location.lng, setFilter]);

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.lat !== undefined && filters.lng !== undefined) count++;
        if (filters.nombreCancha) count++;
        if (filters.esPublica !== '' && filters.esPublica !== undefined) count++;
        if (filters.permiteSuplentes !== '' && filters.permiteSuplentes !== undefined) count++;
        if (filters.date) count++;
        if (filters.time) count++;
        if (filters.onlyAvailable) count++;
        return count;
    }, [filters]);

    return (
        <View style={styles.container}>
            <View style={styles.headerArea}>
                <View style={styles.searchHeader}>
                    <SearchInput
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                        onClear={() => setFilter('search', '')}
                        placeholder="Buscar partidos o canchas..."
                        style={styles.searchInput}
                    />
                    <TouchableOpacity
                        style={[
                            styles.filterBtn,
                            activeFilterCount > 0 && styles.filterBtnActive,
                        ]}
                        onPress={() => setFilterModalVisible(true)}
                    >
                        <SlidersHorizontal
                            size={20}
                            color={activeFilterCount > 0 ? '#fff' : THEME.colors.text}
                        />
                        {activeFilterCount > 0 && (
                            <View style={styles.filterBadge}>
                                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                <LocationFilterBar
                    tipoUbicacion={location.tipo}
                    nombreUbicacion={location.nombre}
                    onGpsClick={() => solicitarGps()}
                    onLocalidadClick={(loc) => seleccionarLocalidad(loc)}
                    isLoadingGps={isLoadingGps}
                    label="Partidos cerca de:"
                />
            </View>

            {loading && !refreshing ? (
                <LoadingSpinner label="Buscando partidos cercanos..." />
            ) : (
                <FlatList
                    data={matches}
                    keyExtractor={(item) => String(item.id)}
                    ListHeaderComponent={<ErrorMessage message={error} />}
                    renderItem={({ item }) => (
                        <MatchCard
                            room={item}
                            onPress={() => router.push(`/salas/${item.id}`)}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={refresh}
                            tintColor={THEME.colors.primary}
                            colors={[THEME.colors.primary]}
                        />
                    }
                    ListEmptyComponent={
                        <EmptyState
                            title="No se encontraron partidos"
                            description="Prueba cambiando la ubicación o el radio de distancia."
                            actionLabel={activeFilterCount > 0 ? 'Limpiar Filtros' : undefined}
                            onActionPress={resetFilters}
                        />
                    }
                />
            )}

            <MatchFilterModal
                visible={filterModalVisible}
                filters={filters}
                onFilterChange={setFilter}
                onReset={resetFilters}
                onClose={() => setFilterModalVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.colors.background,
    },
    headerArea: {
        paddingHorizontal: THEME.spacing.md,
        paddingTop: THEME.spacing.sm,
    },
    searchHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: THEME.spacing.sm,
        marginBottom: THEME.spacing.xs,
    },
    searchInput: {
        flex: 1,
    },
    filterBtn: {
        width: 48,
        height: 48,
        backgroundColor: THEME.colors.surface,
        borderRadius: THEME.borderRadius.md,
        borderWidth: 1,
        borderColor: THEME.colors.surfaceBorder,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    filterBtnActive: {
        backgroundColor: THEME.colors.primary,
        borderColor: THEME.colors.primary,
    },
    filterBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: THEME.colors.danger,
        borderRadius: THEME.borderRadius.full,
        width: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
    listContent: {
        paddingHorizontal: THEME.spacing.md,
        paddingBottom: THEME.spacing.xl,
    },
});
