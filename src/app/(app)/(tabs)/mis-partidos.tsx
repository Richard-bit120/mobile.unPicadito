import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { THEME } from '@/config/theme';
import { MatchCard } from '@/features/matches/components/MatchCard';
import { useMyMatches } from '@/features/matches/hooks/useMyMatches';
import { useRouter } from 'expo-router';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

export default function MisPartidosScreen() {
    const router = useRouter();
    const { matches, loading, refreshing, error, refresh } = useMyMatches();

    if (loading && !refreshing) {
        return <LoadingSpinner label="Cargando tus partidos..." />;
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={matches}
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
                        title="Aún no participás en ningún partido"
                        description="Explorá las salas abiertas o creá un nuevo picadito."
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
