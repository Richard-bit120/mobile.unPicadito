import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LocationPickerMap } from '@/components/ui/LocationPickerMap';
import { SectionCard } from '@/components/ui/SectionCard';
import { Textarea } from '@/components/ui/Textarea';
import { THEME } from '@/config/theme';
import { CANCEL_ROOM_RULES } from '@/constants/match.constants';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { TacticalBoard } from '@/features/matches/components/TacticalBoard';
import { matchService } from '@/features/matches/services/matchService';
import { MappedParticipant, MappedRoom } from '@/features/matches/types/match.types';
import { getFinalizeAvailableAt, isWithin24Hours } from '@/features/matches/utils/dateUtils';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Check, Crown, UserMinus } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef useState } from 'react';
import { Alert, AppState, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const STATUS_BADGE: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
    ABIERTA: { label: 'Disponible', variant: 'success' },
    COMPLETA: { label: 'Completa', variant: 'warning' },
    FINALIZADA: { label: 'Finalizada', variant: 'neutral' },
    CANCELADA: { label: 'Cancelada', variant: 'danger' },
};

export default function RoomDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const user = useAuthStore((s) => s.user);

    const [room, setRoom] = useState<MappedRoom | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showCancelBox, setShowCancelBox] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [now, setNow] = useState(Date.now());
    const isFirstFocus = useRef(true);

    useFocusEffect(
        useCallback(() => {
            if (isFirstFocus.current) {
                isFirstFocus.current = false;
                return;
            }
            loadRoom();
        }, [loadRoom])
    );

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') loadRoom();
        });
        return () => subscription.remove();
    }, [loadRoom]);

    const roomStatus = room?.status;
    const matchIso = room?.raw?.fechaHoraPartido;
    useEffect(() => {
        if (!matchIso || !['ABIERTA', 'COMPLETA'].includes(roomStatus ?? '')) return;
        const availableAt = getFinalizeAvailableAt(matchIso);
        if (!availableAt || !id) return;

        const MAX_TIMEOUT_MS = 2147483647;
        const MAX_ATTEMPTS = 5;
        const RETRY_MS = 30000;
        const delay = Math.max(availableAt.getTime() - Date.now(), 0);
        if (delay > MAX_TIMEOUT_MS) return;

        let cancelled = false;
        let attempts = 0;
        let timeoutId: ReturnType<typeof setTimeout>;

        const refresh = async () => {
            setNow(Date.now());
            try {
                const fresh = await matchService.getRoomById(id);
                if (cancelled) return;
                setRoom(fresh);
                const stillOpen = ['ABIERTA', 'COMPLETA'].includes(fresh?.status ?? '');
                if (stillOpen && attempts < MAX_ATTEMPTS) {
                    attempts += 1;
                    timeoutId = setTimeout(refresh, RETRY_MS);
                }
            } catch {
            }
        };

        timeoutId = setTimeout(refresh, delay);
        return () => {
            cancelled = true;
            clearTimeout(timeoutId);
        };
    }, [id, matchIso, roomStatus]);


    const loadRoom = useCallback(async () => {
        if (!id) return;
        setError(null);
        try {
            const data = await matchService.getRoomById(id);
            setRoom(data);
        } catch (err: any) {
            setError(err.message || 'No se pudo cargar la sala.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadRoom();
    }, [loadRoom]);

    if (loading) return <LoadingSpinner label="Cargando detalle del partido..." />;
    if (!room) {
        return (
            <ScreenContainer>
                <ErrorMessage message={error || 'Sala no encontrada'} />
                <Button title="Volver" variant="secondary" onPress={() => router.back()} />
            </ScreenContainer>
        );
    }

    const isOrganizer = room.organizerId === user?.id || room.creatorId === user?.id;
    const isParticipant = room.participants.some(
        (p) => p.userId === user?.id && (p.status === 'CONFIRMED' || p.status === 'SUBSTITUTE')
    );
    const matchIso = room?.raw?.fechaHoraPartido;
    const finalizedAt = matchIso && !['ABIERTA', 'COMPLETA'].includes(roomStatus ?? '') ? new Date(matchIso).getTime() + 30 * 60 * 1000 : null;
    const lockedByTime = finalizedAt && finalizedAt > Date.now();

    const confirmedList = room.participants.filter((p) => p.status === 'CONFIRMED');
    const substituteList = room.participants.filter((p) => p.status === 'SUBSTITUTE');
    const pendingList = room.participants.filter((p) => p.status === 'PENDING');
    const availableSlots = Math.max(0, room.maxPlayers - confirmedList.length);
    const progressPct = room.maxPlayers > 0 ? Math.min(100, Math.round((confirmedList.length / room.maxPlayers) * 100)) : 0;
    const finalizeAvailableAt = getFinalizeAvailableAt(room.raw?.fechaHoraPartido);
    const isOpenForFinalize = room.status === 'ABIERTA' || room.status === 'COMPLETA';
    const isClosedRoom = room.status === 'CANCELADA' || room.status === 'FINALIZADA';
    const canFinalizeNow =
        finalizeAvailableAt !== null && now >= finalizeAvailableAt.getTime();
    const finalizeAvailableLabel = finalizeAvailableAt
        ? finalizeAvailableAt.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
        : '';

    const handleJoin = async () => {
        setActionLoading(true);
        setError(null);
        try {
            await matchService.joinRoom(room.id);
            await loadRoom();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleLeave = () => {
        Alert.alert('Salir de la sala', '¿Estás seguro de que quieres darte de baja?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Salir',
                style: 'destructive',
                onPress: async () => {
                    setActionLoading(true);
                    try {
                        await matchService.leaveRoom(room.id);
                        router.replace('/(app)/(tabs)');
                    } catch (err: any) {
                        setError(err.message);
                        setActionLoading(false);
                    }
                },
            },
        ]);
    };

    const handleExpelPlayer = (player: MappedParticipant) => {
        const name = player.firstName || player.username || 'este jugador';
        Alert.alert('¿Expulsar jugador?', `¿Deseas expulsar a ${name} de la sala?`, [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Expulsar',
                style: 'destructive',
                onPress: async () => {
                    setActionLoading(true);
                    try {
                        await matchService.expelPlayer(room.id, player.userId);
                        await loadRoom();
                    } catch (err: any) {
                        setError(err.message);
                    } finally {
                        setActionLoading(false);
                    }
                },
            },
        ]);
    };

    const handleTransferOrganizer = (player: MappedParticipant) => {
        const name = player.firstName || player.username || 'este jugador';
        Alert.alert(
            '¿Transferir organización?',
            `¿Deseas transferir la organización a ${name}? Dejarás de ser el organizador de este partido.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Transferir',
                    onPress: async () => {
                        setActionLoading(true);
                        try {
                            await matchService.transferOrganizer(room.id, player.userId);
                            await loadRoom();
                        } catch (err: any) {
                            setError(err.message);
                        } finally {
                            setActionLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const handleAcceptRequest = async (participationId: string) => {
        setActionLoading(true);
        try {
            await matchService.acceptJoinRequest(room.id, participationId);
            await loadRoom();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancelRoom = async () => {
        if (cancelReason.trim().length < CANCEL_ROOM_RULES.MIN_REASON_LENGTH) {
            setError(
                `El motivo debe tener al menos ${CANCEL_ROOM_RULES.MIN_REASON_LENGTH} caracteres.`
            );
            return;
        }
        setActionLoading(true);
        try {
            await matchService.cancelRoom(room.id, cancelReason.trim());
            router.replace('/(app)/(tabs)');
        } catch (err: any) {
            setError(err.message);
            setActionLoading(false);
        }
    };

    const handleFinalizeRoom = () => {
        Alert.alert(
            '¿Finalizar partido?',
            'La sala pasará a estado FINALIZADA y se habilitarán las calificaciones. Esta acción no se puede deshacer.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Finalizar',
                    onPress: async () => {
                        setActionLoading(true);
                        setError(null);
                        try {
                            await matchService.finalizeRoom(room.id);
                            await loadRoom();
                        } catch (err: any) {
                            setError(err.message);
                        } finally {
                            setActionLoading(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <ScreenContainer>
            <ErrorMessage message={error} />

            {/* Información y Mapa de la cancha */}
            <SectionCard
                action={
                    <Badge
                        label={STATUS_BADGE[room.status]?.label ?? room.status}
                        variant={STATUS_BADGE[room.status]?.variant ?? 'neutral'}
                    />
                }
                title={room.title}
                subtitle={`${room.date} a las ${room.time} hs`}
                action={
                    <Badge
                        label={room.status}
                        variant={room.status === 'ABIERTA' ? 'success' : 'warning'}
                    />
                }
            >
                <Text style={styles.infoLine}>
                    🏟️ Cancha: {room.raw?.nombreCancha || room.location}
                </Text>
                {!!room.raw?.direccion && (
                    <Text style={styles.infoLine}>📍 Dirección: {room.raw.direccion}</Text>
                )}
                <Text style={styles.infoLine}>🔒 Privacidad: {room.privacy}</Text>
                {!!room.description && (
                    <Text style={styles.description}>{room.description}</Text>
                )}

                {room.raw?.ubicacion && (
                    <View style={styles.mapBox}>
                        <LocationPickerMap
                            value={room.raw.ubicacion}
                            readOnly={true}
                            height={190}
                        />
                    </View>
                )}
            </SectionCard>

            {/* Resumen de Cupos (RoomSlotsSummary) */}
            <SectionCard title="Estado de Cupos">
                <View style={styles.slotsRow}>
                    <Text style={styles.slotsText}>
                        Confirmados: {confirmedList.length} / {room.maxPlayers}
                    </Text>
                    <Text style={styles.slotsHighlight}>
                        {availableSlots} lugares libres
                    </Text>
                </View>
                <View style={styles.progressBarBg}>
                    <View
                        style={[styles.progressBarFill, { width: `${progressPct}%` }]}
                    />
                </View>
            </SectionCard>

            {/* Pizarrón Táctico */}
            <SectionCard title="Pizarrón Táctico">
                <TacticalBoard
                    players={confirmedList}
                    maxPlayers={room.maxPlayers}
                    onPlayerPress={(p) => router.push(`/usuarios/${p.userId}`)}
                />
            </SectionCard>

            {/* Solicitudes pendientes (Salas privadas) */}
            {isOrganizer && !isClosedRoom && pendingList.length > 0 && (
                <SectionCard
                    title="Solicitudes de Ingreso"
                    action={
                        <Badge label={`${pendingList.length} pendientes`} variant="info" />
                    }
                >
                    {pendingList.map((req) => (
                        <View key={req.participationId} style={styles.playerRow}>
                            <TouchableOpacity
                                style={styles.playerInfo}
                                onPress={() => router.push(`/usuarios/${req.userId}`)}
                            >
                                <Text style={styles.playerName}>
                                    {req.firstName} {req.lastName}
                                </Text>
                                <Text style={styles.playerSub}>@{req.username}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.acceptBtn}
                                onPress={() => handleAcceptRequest(req.participationId)}
                            >
                                <Check size={16} color="#fff" />
                                <Text style={styles.acceptBtnText}>Aceptar</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </SectionCard>
            )}

            {/* Lista de Titulares */}
            <SectionCard title={`Titulares (${confirmedList.length}/${room.maxPlayers})`}>
                {confirmedList.map((p) => (
                    <View key={p.participationId} style={styles.playerRow}>
                        <TouchableOpacity
                            style={styles.playerInfo}
                            onPress={() => router.push(`/usuarios/${p.userId}`)}
                        >
                            <Text style={styles.playerName}>
                                {p.firstName} {p.lastName} (@{p.username})
                            </Text>
                            {!!p.mainPosition && (
                                <Text style={styles.playerSub}>{p.mainPosition}</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.rowActions}>
                            {p.isOrganizer && <Badge label="Organizador" variant="info" />}
                            {isOrganizer && !isClosedRoom && p.userId !== user?.id && (
                                <>
                                    <TouchableOpacity
                                        style={styles.iconActionBtn}
                                        onPress={() => handleTransferOrganizer(p)}
                                    >
                                        <Crown size={18} color={THEME.colors.warning} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.iconActionBtn}
                                        onPress={() => handleExpelPlayer(p)}
                                    >
                                        <UserMinus size={18} color={THEME.colors.danger} />
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </View>
                ))}
            </SectionCard>

            {/* Lista de Suplentes */}
            {room.allowsSubstitutes && (
                <SectionCard
                    title={`Suplentes (${substituteList.length}/${room.maxSubstitutes})`}
                >
                    {substituteList.length === 0 ? (
                        <Text style={styles.muted}>No hay suplentes anotados.</Text>
                    ) : (
                        substituteList.map((p) => (
                            <View key={p.participationId} style={styles.playerRow}>
                                <TouchableOpacity
                                    style={styles.playerInfo}
                                    onPress={() => router.push(`/usuarios/${p.userId}`)}
                                >
                                    <Text style={styles.playerName}>
                                        {p.firstName} {p.lastName} (@{p.username})
                                    </Text>
                                </TouchableOpacity>
                                {isOrganizer && !isClosedRoom && p.userId !== user?.id && (
                                    <View style={styles.rowActions}>
                                        <TouchableOpacity
                                            style={styles.iconActionBtn}
                                            onPress={() => handleExpelPlayer(p)}
                                        >
                                            <UserMinus size={18} color={THEME.colors.danger} />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        ))
                    )}
                </SectionCard>
            )}

            {/* Acciones de Participación / Administración */}
            <View style={styles.actionsBox}>
                {!isParticipant && room.status === 'ABIERTA' && (
                    <Button
                        title="Unirme al Partido"
                        onPress={handleJoin}
                        loading={actionLoading}
                    />
                     {isOrganizer && isOpenForFinalize && (
                    <>
                        <Button
                            title="Finalizar Partido"
                            disabled={!canFinalizeNow}
                            loading={actionLoading}
                            onPress={handleFinalizeRoom}
                            style={{ marginBottom: THEME.spacing.sm }}
                        />
                        {!canFinalizeNow && !!finalizeAvailableLabel && (
                            <Text style={[styles.muted, { marginBottom: THEME.spacing.sm }]}>
                                Se habilita el {finalizeAvailableLabel} hs (30 minutos después del inicio).
                            </Text>
                        )}
                    </>
                )}
                )}

                {isParticipant && !isOrganizer && !isClosedRoom && (
                    <Button
                        title={lockedByTime ? 'Bloqueado (< 24hs)' : 'Salir del Partido'}
                        variant="danger"
                        disabled={lockedByTime}
                        loading={actionLoading}
                        onPress={handleLeave}
                    />
                )}
                {isOrganizer && isOpenForFinalize && (
                    <>
                        <Button
                            title="Finalizar Partido"
                            disabled={!canFinalizeNow}
                            loading={actionLoading}
                            onPress={handleFinalizeRoom}
                            style={{ marginBottom: THEME.spacing.sm }}
                        />
                        {!canFinalizeNow && !!finalizeAvailableLabel && (
                            <Text style={[styles.muted, { marginBottom: THEME.spacing.sm }]}>
                                Se habilita el {finalizeAvailableLabel} hs (30 minutos después del inicio).
                            </Text>
                        )}
                    </>
                )}
                {isOrganizer && room.status === 'ABIERTA' && (
                    <>
                        <Button
                            title="Editar Sala"
                            variant="outline"
                            onPress={() => router.push(`/salas/${room.id}/editar`)}
                            style={{ marginBottom: THEME.spacing.sm }}
                        />
                        {!showCancelBox ? (
                            <Button
                                title="Cancelar Partido"
                                variant="danger"
                                disabled={lockedByTime}
                                onPress={() => setShowCancelBox(true)}
                            />
                        ) : (
                            <SectionCard title="Cancelar Sala">
                                <Textarea
                                    label="Motivo de cancelación (mínimo 10 caracteres)"
                                    value={cancelReason}
                                    onChangeText={setCancelReason}
                                    maxLength={CANCEL_ROOM_RULES.MAX_REASON_LENGTH}
                                    currentLength={cancelReason.length}
                                />
                                <Button
                                    title="Confirmar Cancelación"
                                    variant="danger"
                                    loading={actionLoading}
                                    onPress={handleCancelRoom}
                                />
                            </SectionCard>
                        )}
                    </>
                )}
            </View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    infoLine: { color: THEME.colors.textSecondary, fontSize: 14, marginBottom: 6 },
    description: { color: THEME.colors.text, fontSize: 14, marginTop: 8 },
    mapBox: {
        marginTop: THEME.spacing.sm,
        paddingTop: THEME.spacing.xs,
        borderTopWidth: 1,
        borderTopColor: THEME.colors.surfaceBorder,
    },
    slotsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    slotsText: { color: THEME.colors.textSecondary, fontSize: 14 },
    slotsHighlight: {
        color: THEME.colors.primaryLight,
        fontSize: 14,
        fontWeight: '700',
    },
    progressBarBg: {
        height: 10,
        backgroundColor: THEME.colors.surfaceLight,
        borderRadius: THEME.borderRadius.full,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: THEME.colors.primary,
    },
    playerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: THEME.colors.surfaceBorder,
    },
    playerInfo: { flex: 1 },
    playerName: { color: THEME.colors.text, fontSize: 15, fontWeight: '600' },
    playerSub: { color: THEME.colors.textMuted, fontSize: 12, marginTop: 2 },
    rowActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    iconActionBtn: {
        padding: 6,
        backgroundColor: THEME.colors.surfaceLight,
        borderRadius: THEME.borderRadius.sm,
    },
    acceptBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: THEME.borderRadius.sm,
        gap: 4,
    },
    acceptBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
    muted: { color: THEME.colors.textMuted, fontSize: 14 },
    actionsBox: { marginTop: THEME.spacing.sm, marginBottom: THEME.spacing.xl },
});