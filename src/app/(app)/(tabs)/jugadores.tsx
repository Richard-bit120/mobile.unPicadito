import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { SearchInput } from '@/components/ui/SearchInput';
import { THEME } from '@/config/theme';
import { validatePlayerSearch } from '@/features/players/schemas/searchPlayerSchema';
import { PlayerItem, playerService } from '@/features/players/services/playerService';
import { useDebounce } from '@/hooks/useDebounce';
import { formatPlayerFullName } from '@/utils/userFormatters';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function JugadoresScreen() {
    const router = useRouter();
    const [searchInput, setSearchInput] = useState('');
    const [validationError, setValidationError] = useState<string | null>(null);
    const [players, setPlayers] = useState<PlayerItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const debouncedSearch = useDebounce(searchInput, 400);

    const fetchPlayers = useCallback(async (term: string) => {
        setApiError(null);
        try {
            const data = await playerService.searchPlayers(term);
            setPlayers(data);
        } catch (err: any) {
            setApiError(err.message || 'No se pudieron cargar los jugadores.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        const run = async () => {
            if (debouncedSearch.trim() === '') {
                setValidationError(null);
                setLoading(true);
                fetchPlayers('');
                return;
            }
            const res = await validatePlayerSearch(debouncedSearch);
            if (!res.valid) {
                setValidationError(res.error || 'Búsqueda inválida');
                return;
            }
            setValidationError(null);
            setLoading(true);
            fetchPlayers(debouncedSearch);
        };
        run();
    }, [debouncedSearch, fetchPlayers]);

    return (
        <View style={styles.container}>
            <View style={styles.searchBox}>
                <SearchInput
                    value={searchInput}
                    onChangeText={setSearchInput}
                    placeholder="Buscar jugadores por nombre o usuario..."
                />
                {!!validationError && (
                    <Text style={styles.validationText}>⚠️ {validationError}</Text>
                )}
            </View>

            {loading && !refreshing ? (
                <LoadingSpinner label="Buscando jugadores en la cancha..." />
            ) : (
                <FlatList
                    data={players}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={styles.list}
                    ListHeaderComponent={<ErrorMessage message={apiError} />}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => {
                                setRefreshing(true);
                                fetchPlayers(debouncedSearch);
                            }}
                            tintColor={THEME.colors.primary}
                            colors={[THEME.colors.primary]}
                        />
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.card}
                            onPress={() => router.push(`/usuarios/${item.id}`)}
                        >
                            <Avatar
                                uri={item.fotoPerfilUrl}
                                name={item.nombre}
                                size={46}
                                borderWidth={1}
                                fallbackInitial="J"
                            />
                            <View style={styles.cardBody}>
                                <Text style={styles.name}>{formatPlayerFullName(item)}</Text>
                                <Text style={styles.username}>@{item.nombreUsuario}</Text>
                                <View style={styles.badgeWrap}>
                                    <Badge
                                        label={item.posicionPrincipal || 'POLIFUNCIONAL'}
                                        variant="info"
                                    />
                                </View>
                            </View>
                            <ChevronRight size={20} color={THEME.colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <EmptyState
                            title={
                                searchInput
                                    ? 'No hay coincidencias'
                                    : 'Sin jugadores disponibles'
                            }
                            description={
                                searchInput
                                    ? `No encontramos a nadie que coincida con "${searchInput}".`
                                    : 'Aún no hay jugadores registrados.'
                            }
                        />
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.colors.background },
    searchBox: {
        paddingHorizontal: THEME.spacing.md,
        paddingTop: THEME.spacing.sm,
        paddingBottom: THEME.spacing.xs,
    },
    validationText: {
        color: THEME.colors.warning,
        fontSize: 12,
        marginTop: 6,
    },
    list: { padding: THEME.spacing.md, flexGrow: 1 },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.colors.surface,
        borderRadius: THEME.borderRadius.md,
        borderWidth: 1,
        borderColor: THEME.colors.surfaceBorder,
        padding: THEME.spacing.md,
        marginBottom: THEME.spacing.sm,
    },
    cardBody: {
        flex: 1,
        marginLeft: THEME.spacing.md,
    },
    name: { color: THEME.colors.text, fontSize: 16, fontWeight: '700' },
    username: { color: THEME.colors.textSecondary, fontSize: 13, marginTop: 2 },
    badgeWrap: { marginTop: 6 },
});
