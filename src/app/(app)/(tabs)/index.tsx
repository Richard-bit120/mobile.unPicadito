import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { SearchInput } from '@/components/ui/SearchInput';
import { THEME } from '@/config/theme';
import { MatchCard } from '@/features/matches/components/MatchCard';
import { MatchFilterModal } from '@/features/matches/components/MatchFilterModal';
import { useMatches } from '@/features/matches/hooks/useMatches';
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

    const [searchTerm, setSearchTerm] = useState('');
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const debouncedSearch = useDebounce(searchTerm, 400);

    useEffect(() => {
        setFilter('search', debouncedSearch);
    }, [debouncedSearch, setFilter]);

    const activeFilterCount = useMemo(() => {
        let count = 0;
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
            <View style={styles.searchHeader}>
                <SearchInput
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    onClear={() => setFilter('search', '')}
                    placeholder="Buscar partidos..."
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

            {loading && !refreshing ? (
                <LoadingSpinner label="Buscando partidos..." />
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
                            description="Prueba cambiando los filtros o crea una nueva sala."
                            actionLabel={activeFilterCount > 0 ? 'Limpiar Filtros' : undefined}
                            onActionPress={
                                activeFilterCount > 0
                                    ? () => {
                                          setSearchTerm('');
                                          resetFilters();
                                      }
                                    : undefined
                            }
                        />
                    }
                />
            )}

            <MatchFilterModal
                visible={filterModalVisible}
                filters={filters}
                onFilterChange={setFilter}
                onReset={() => {
                    setSearchTerm('');
                    resetFilters();
                }}
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
    searchHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: THEME.spacing.md,
        paddingTop: THEME.spacing.sm,
        paddingBottom: THEME.spacing.xs,
        gap: THEME.spacing.sm,
    },
    searchInput: {
        flex: 1,
    },
    filterBtn: {
        width: 46,
        height: 46,
        backgroundColor: THEME.colors.surface,
        borderWidth: 1,
        borderColor: THEME.colors.surfaceBorder,
        borderRadius: THEME.borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterBtnActive: {
        backgroundColor: THEME.colors.primary,
        borderColor: THEME.colors.primary,
    },
    filterBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: THEME.colors.warning,
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    filterBadgeText: {
        color: '#000',
        fontSize: 10,
        fontWeight: '800',
    },
    listContent: {
        padding: THEME.spacing.md,
        flexGrow: 1,
    },
});