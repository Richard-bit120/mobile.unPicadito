import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SectionCard } from '@/components/ui/SectionCard';
import { THEME } from '@/config/theme';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useFriends } from '@/features/friends/hooks/useFriends';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { useLocalSearchParams } from 'expo-router';
import { Star } from 'lucide-react-native';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

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
    const apellido =
        profile.apellido?.toLowerCase() === 'sin apellido' ? '' : profile.apellido || '';
    const fullName = `${profile.nombre || ''} ${apellido}`.trim();
    const initials = (profile.nombre?.[0] || 'J').toUpperCase();
    const reviews: any[] = profile.resenasRecibidas || [];

    return (
        <ScreenContainer>
            <ErrorMessage message={error || friendError} />

            <SectionCard>
                <View style={styles.headerRow}>
                    {profile.fotoPerfilUrl ? (
                        <Image
                            source={{ uri: profile.fotoPerfilUrl }}
                            style={styles.avatar}
                        />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarInitials}>{initials}</Text>
                        </View>
                    )}

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
                        <Text style={styles.value}>
                            {profile.reputacion ?? 'Sin calificaciones'}
                        </Text>
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

            <SectionCard title={`Reseñas (${reviews.length})`}>
                {reviews.length === 0 ? (
                    <Text style={styles.muted}>
                        Este jugador aún no tiene reseñas registradas.
                    </Text>
                ) : (
                    reviews.map((rev: any) => (
                        <View key={rev.id} style={styles.reviewItem}>
                            <View style={styles.reviewHeader}>
                                <Text style={styles.reviewerName}>
                                    {rev.calificador?.nombre || 'Jugador'}
                                </Text>
                                <Text style={styles.reviewStars}>⭐ {rev.estrellas}/5</Text>
                            </View>
                            {!!rev.comentario && (
                                <Text style={styles.reviewComment}>{rev.comentario}</Text>
                            )}
                        </View>
                    ))
                )}
            </SectionCard>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: THEME.spacing.md,
    },
    avatar: {
        width: 68,
        height: 68,
        borderRadius: 34,
        borderWidth: 2,
        borderColor: THEME.colors.primary,
    },
    avatarPlaceholder: {
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: THEME.colors.surfaceLight,
        borderWidth: 2,
        borderColor: THEME.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitials: {
        fontSize: 26,
        fontWeight: '800',
        color: THEME.colors.primary,
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
    reviewItem: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: THEME.colors.surfaceBorder,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    reviewerName: { color: THEME.colors.text, fontSize: 14, fontWeight: '600' },
    reviewStars: { color: THEME.colors.warning, fontSize: 13, fontWeight: '700' },
    reviewComment: { color: THEME.colors.textSecondary, fontSize: 13, marginTop: 4 },
    muted: { color: THEME.colors.textMuted, fontSize: 14 },
});
