import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { THEME } from '@/config/theme';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { MatchCard } from '@/features/matches/components/MatchCard';
import { useMatches } from '@/features/matches/hooks/useMatches';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

export default function MisPartidosScreen() {
    const router = useRouter();
    const user = useAuthStore((s) => s.user);
    const { matches, loading, refreshing, error, refresh } = useMatches();

    const myMatches = useMemo(() => {
        return matches.filter(
            (m) => Boolean(Number(m.unidoPorUsuarioActual)) || m.creador?.id === user?.id
        );
    }, [matches, user?.id]);

    if (loading && !refreshing) {
        return <LoadingSpinner label="Cargando tus partidos..." />;
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={myMatches}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={styles.list}
                ListHeaderComponent={<ErrorMessage message={error} />}
                renderItem={({ item }) => (
                    <MatchCard room={item} onPress={() => router.push(`/salas/${item.id}`)} />
                )}
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
                        title="Aún no participas en ningún partido"
                        description="Explora las salas abiertas o crea un nuevo picadito."
                        actionLabel="Explorar Partidos"
                        onActionPress={() => router.push('/(app)/(tabs)')}
                    />
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.colors.background },
    list: { padding: THEME.spacing.md, flexGrow: 1 },
});