import { Badge } from '@/components/ui/Badge';
import { THEME } from '@/config/theme';
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
    const isFull = ocupados >= totales;

    const venueName = room.cancha?.predio?.nombre || '';
    const pitchName = room.cancha?.nombre || room.nombreCancha || '';
    const venueAddress = room.cancha?.predio?.direccion || room.direccion || '';

    let locationText = '';
    if (venueName && pitchName) {
        locationText = `${venueName} (${pitchName})`;
    } else {
        locationText = venueName || pitchName || 'Cancha a confirmar';
    }
    if (venueAddress) {
        locationText += ` • ${venueAddress}`;
    }

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        >
            <View style={styles.header}>
                <Text style={styles.title} numberOfLines={1}>
                    {room.nombre}
                </Text>
                <View style={styles.headerRight}>
                    {room.distanciaKm !== undefined && (
                        <Badge
                            label={`${room.distanciaKm} km`}
                            variant="info"
                            style={styles.distBadge}
                        />
                    )}
                    <View style={[styles.badge, isFull ? styles.badgeFull : styles.badgeOpen]}>
                        <Text style={styles.badgeText}>{isFull ? 'Completa' : 'Abierta'}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.row}>
                <MapPin size={16} color={THEME.colors.textSecondary} />
                <Text style={styles.subtext} numberOfLines={1}>
                    {locationText}
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
        borderRadius: THEME.borderRadius.lg,
        padding: THEME.spacing.md,
        marginBottom: THEME.spacing.sm,
        borderWidth: 1,
        borderColor: THEME.colors.surfaceBorder,
    },
    cardPressed: {
        opacity: 0.85,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    distBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    title: {
        color: THEME.colors.text,
        fontSize: 16,
        fontWeight: '700',
        flex: 1,
        marginRight: 8,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: THEME.borderRadius.full,
    },
    badgeOpen: {
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
    },
    badgeFull: {
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: THEME.colors.text,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
    },
    subtext: {
        color: THEME.colors.textSecondary,
        fontSize: 13,
        flex: 1,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: THEME.colors.surfaceBorder,
        paddingTop: 10,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        color: THEME.colors.textSecondary,
        fontSize: 13,
    },
});
