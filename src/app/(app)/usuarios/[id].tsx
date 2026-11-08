import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SectionCard } from '@/components/ui/SectionCard';
import { THEME } from '@/config/theme';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useFriends } from '@/features/friends/hooks/useFriends';
import { ProfileReviewsSection } from '@/features/profile/components/ProfileReviewsSection';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { UserReviewItem } from '@/features/profile/types/profile.types';
import { formatPlayerFullName, formatReputationLabel } from '@/utils/userFormatters';
import { useLocalSearchParams } from 'expo-router';
import { Star } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

export default function PublicUserProfileScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const currentUser = useAuthStore((s) => s.user);
    const { profile, loading, error } = useProfile(id);
    const {
        sendFriendRequest,
        loading: friendLoading,
        error: friendError,
        sentSuccess,
    } = useFriends();

    if (loading) return <LoadingSpinner label="Cargando perfil del jugador..." />;
    if (!profile) {
        return (
            <ScreenContainer>
                <ErrorMessage message={error || 'Jugador no encontrado'} />
            </ScreenContainer>
        );
    }

    const isOwnProfile = Number(id) === currentUser?.id;
    const fullName = formatPlayerFullName(profile, 'Jugador');
    const reviews: UserReviewItem[] = profile.resenasRecibidas || [];
    const reputationLabel = formatReputationLabel(profile.reputacion, reviews.length);

    return (
        <ScreenContainer>
            <ErrorMessage message={error || friendError} />

            <SectionCard>
                <View style={styles.headerRow}>
                    <Avatar
                        uri={profile.fotoPerfilUrl}
                        name={profile.nombre}
                        size={68}
                        borderWidth={2}
                        fallbackInitial="J"
                    />

                    <View style={styles.headerInfo}>
                        <Text style={styles.name}>{fullName}</Text>
                        <Text style={styles.username}>@{profile.nombreUsuario}</Text>
                        {!!profile.apodo && (
                            <Text style={styles.nickname}>“{profile.apodo}”</Text>
                        )}
                        <View style={{ marginTop: 6 }}>
                            <Badge
                                label={profile.posicionPrincipal || 'POLIFUNCIONAL'}
                                variant="info"
                            />
                        </View>
                    </View>
                </View>

                <View style={styles.statRow}>
                    <Text style={styles.label}>Reputación:</Text>
                    <View style={styles.ratingBox}>
                        <Star
                            size={16}
                            color={THEME.colors.warning}
                            fill={THEME.colors.warning}
                        />
                        <Text style={styles.value}>{reputationLabel}</Text>
                    </View>
                </View>

                {!isOwnProfile && (
                    <Button
                        title={
                            sentSuccess
                                ? 'Solicitud de Amistad Enviada ✓'
                                : 'Agregar a Amigos'
                        }
                        disabled={sentSuccess}
                        loading={friendLoading}
                        onPress={() => sendFriendRequest(profile.id)}
                        style={{ marginTop: THEME.spacing.md }}
                    />
                )}
            </SectionCard>

            <ProfileReviewsSection
                reviews={reviews}
                titlePrefix="Reseñas"
                emptyMessage="Este jugador aún no tiene reseñas registradas."
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: THEME.spacing.md,
    },
    headerInfo: {
        flex: 1,
        marginLeft: THEME.spacing.md,
    },
    name: { fontSize: 18, fontWeight: '700', color: THEME.colors.text },
    username: { fontSize: 13, color: THEME.colors.textSecondary, marginTop: 2 },
    nickname: {
        fontSize: 13,
        fontStyle: 'italic',
        color: THEME.colors.primaryLight,
        marginTop: 2,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: THEME.colors.surfaceBorder,
    },
    label: { color: THEME.colors.textSecondary, fontSize: 14 },
    value: { color: THEME.colors.text, fontSize: 14, fontWeight: '600' },
    ratingBox: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
