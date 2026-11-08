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
import { useRouter } from 'expo-router';
import { Check, Pencil, Star, X } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PerfilScreen() {
    const router = useRouter();
    const logout = useAuthStore((s) => s.logout);
    const authUser = useAuthStore((s) => s.user);
    const { profile, loading, error, refresh } = useProfile();
    const { respondToRequest, loading: friendLoading } = useFriends();

    if (loading) return <LoadingSpinner label="Cargando perfil..." />;

    const displayUser = profile || authUser;
    const fullName = formatPlayerFullName(displayUser, 'Mi Perfil');
    const reviews: UserReviewItem[] = displayUser?.resenasRecibidas || [];
    const reputationLabel = formatReputationLabel(displayUser?.reputacion, reviews.length);
    const pendingFriends: any[] = (displayUser?.solicitudesAmistadRecibidas || []).filter(
        (r: any) => r.estado === 'PENDIENTE' || r.status === 'PENDING'
    );

    const handleFriendAction = async (id: number, status: 'ACCEPTED' | 'REJECTED') => {
        const ok = await respondToRequest(id, status);
        if (ok) refresh();
    };

    return (
        <ScreenContainer>
            <ErrorMessage message={error} />

            {/* Cabecera del Perfil */}
            <SectionCard>
                <View style={styles.headerRow}>
                    <Avatar
                        uri={displayUser?.fotoPerfilUrl}
                        name={displayUser?.nombre}
                        size={68}
                        borderWidth={2}
                        fallbackInitial="U"
                    />

                    <View style={styles.headerInfo}>
                        <Text style={styles.name}>{fullName}</Text>
                        <Text style={styles.username}>
                            @{displayUser?.nombreUsuario || 'usuario'}
                        </Text>
                        {!!displayUser?.apodo && (
                            <Text style={styles.nickname}>“{displayUser.apodo}”</Text>
                        )}
                        <View style={styles.badgeRow}>
                            <Badge
                                label={displayUser?.posicionPrincipal || 'POLIFUNCIONAL'}
                                variant="info"
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.editIconBtn}
                        onPress={() => router.push('/perfil/editar')}
                    >
                        <Pencil size={18} color={THEME.colors.primary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.statRow}>
                    <Text style={styles.label}>Correo:</Text>
                    <Text style={styles.value}>{displayUser?.email || '-'}</Text>
                </View>
                <View style={styles.statRow}>
                    <Text style={styles.label}>Reputación promedio:</Text>
                    <View style={styles.ratingBox}>
                        <Star size={16} color={THEME.colors.warning} fill={THEME.colors.warning} />
                        <Text style={styles.value}>{reputationLabel}</Text>
                    </View>
                </View>

                <Button
                    title="Editar Perfil"
                    variant="outline"
                    onPress={() => router.push('/perfil/editar')}
                    style={{ marginTop: THEME.spacing.md }}
                />
            </SectionCard>

            {/* Solicitudes de amistad pendientes */}
            {pendingFriends.length > 0 && (
                <SectionCard
                    title="Solicitudes de Amistad"
                    action={<Badge label={`${pendingFriends.length}`} variant="warning" />}
                >
                    {pendingFriends.map((req: any) => (
                        <View key={req.id} style={styles.friendRow}>
                            <Text style={styles.friendName}>
                                {req.solicitante?.nombre || req.sender?.nombre || 'Jugador'} (@
                                {req.solicitante?.nombreUsuario || req.sender?.nombreUsuario || ''})
                            </Text>
                            <View style={styles.friendActions}>
                                <TouchableOpacity
                                    disabled={friendLoading}
                                    style={[styles.smallBtn, styles.acceptBg]}
                                    onPress={() => handleFriendAction(req.id, 'ACCEPTED')}
                                >
                                    <Check size={16} color="#fff" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    disabled={friendLoading}
                                    style={[styles.smallBtn, styles.rejectBg]}
                                    onPress={() => handleFriendAction(req.id, 'REJECTED')}
                                >
                                    <X size={16} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </SectionCard>
            )}

            {/* Reseñas Recibidas */}
            <ProfileReviewsSection
                reviews={reviews}
                titlePrefix="Reseñas Recibidas"
                emptyMessage="Aún no has recibido reseñas."
            />

            <Button
                title="Cerrar Sesión"
                variant="danger"
                onPress={logout}
                style={{ marginBottom: THEME.spacing.xl }}
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
    name: {
        fontSize: 18,
        fontWeight: '700',
        color: THEME.colors.text,
    },
    username: {
        fontSize: 13,
        color: THEME.colors.textSecondary,
        marginTop: 2,
    },
    nickname: {
        fontSize: 13,
        fontStyle: 'italic',
        color: THEME.colors.primaryLight,
        marginTop: 2,
    },
    badgeRow: {
        marginTop: 6,
    },
    editIconBtn: {
        padding: 8,
        backgroundColor: THEME.colors.surfaceLight,
        borderRadius: THEME.borderRadius.sm,
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
    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    friendRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: THEME.colors.surfaceBorder,
    },
    friendName: { color: THEME.colors.text, fontSize: 14, flex: 1 },
    friendActions: { flexDirection: 'row', gap: 8 },
    smallBtn: {
        padding: 8,
        borderRadius: THEME.borderRadius.sm,
    },
    acceptBg: { backgroundColor: THEME.colors.primary },
    rejectBg: { backgroundColor: THEME.colors.danger },
});
