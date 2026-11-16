import { Badge } from '@/components/ui/Badge';
import { THEME } from '@/config/theme';
import { ROOM_STATUS, ROOM_STATUS_BADGE } from '@/constants/match.constants';
import { Calendar, Lock, MapPin, Users } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RawSalaSearchItem } from '../types/match.types';

interface MatchCardProps {
    room: RawSalaSearchItem;
    onPress: () => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ room, onPress }) => {
    const formattedDate = room.fechaHoraPartido
        ? new Date(room.fechaHoraPartido).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        })
        : 'Sin fecha';

    const ocupados = Number(room.cuposOcupados ?? 1);
    const totales = Number(room.cuposTotales ?? 10);
    const isCancelled = room.estado === ROOM_STATUS.CANCELADA;
    const isFinished = room.estado === ROOM_STATUS.FINALIZADA;
    const isFull =
        !isCancelled &&
        !isFinished &&
        (room.estado === ROOM_STATUS.COMPLETA || ocupados >= totales);

    const statusKey = isCancelled
        ? ROOM_STATUS.CANCELADA
        : isFinished
          ? ROOM_STATUS.FINALIZADA
          : isFull
            ? ROOM_STATUS.COMPLETA
            : ROOM_STATUS.ABIERTA;
    const badge = ROOM_STATUS_BADGE[statusKey];

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        >
            <View style={styles.header}>
                <Text style={styles.title} numberOfLines={1}>
                    {room.nombre}
                </Text>
                <Badge label={badge.label} variant={badge.variant} />
            </View>

            <View style={styles.row}>
                <MapPin size={16} color={THEME.colors.textSecondary} />
                <Text style={styles.subtext} numberOfLines={1}>
                    {room.nombreCancha} {room.direccion ? `• ${room.direccion}` : ''}
                </Text>
            </View>

            <View style={styles.footer}>
                <View style={styles.metaItem}>
                    <Calendar size={16} color={THEME.colors.primary} />
                    <Text style={styles.metaText}>{formattedDate}</Text>
                </View>

                <View style={styles.metaGroup}>
                    {!room.esPublica && (
                        <Lock size={14} color={THEME.colors.warning} style={{ marginRight: 8 }} />
                    )}
                    <View style={styles.metaItem}>
                        <Users size={16} color={THEME.colors.primary} />
                        <Text style={styles.metaText}>
                            {ocupados} / {totales}
                        </Text>
                    </View>
                </View>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: THEME.colors.surface,
        borderRadius: THEME.borderRadius.md,
        borderWidth: 1,
        borderColor: THEME.colors.surfaceBorder,
        padding: THEME.spacing.md,
        marginBottom: THEME.spacing.md,
    },
    cardPressed: {
        opacity: 0.85,
        transform: [{ scale: 0.99 }],
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: THEME.spacing.xs,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: THEME.colors.text,
        flex: 1,
        marginRight: THEME.spacing.sm,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: THEME.spacing.sm,
    },
    subtext: {
        fontSize: 14,
        color: THEME.colors.textSecondary,
        marginLeft: 6,
        flex: 1,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: THEME.spacing.sm,
        borderTopWidth: 1,
        borderTopColor: THEME.colors.surfaceBorder,
    },
    metaGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 13,
        color: THEME.colors.textSecondary,
        marginLeft: 6,
    },
});