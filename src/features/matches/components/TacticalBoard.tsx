import { THEME } from '@/config/theme';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { inferModalityByMaxPlayers, TACTICAL_FORMATIONS } from '../constants/formations';
import { MappedParticipant } from '../types/match.types';

interface TacticalBoardProps {
    players: MappedParticipant[];
    maxPlayers?: number;
    onPlayerPress?: (player: MappedParticipant) => void;
}

export const TacticalBoard: React.FC<TacticalBoardProps> = ({
    players = [],
    maxPlayers = 10,
    onPlayerPress,
}) => {
    const modality = inferModalityByMaxPlayers(maxPlayers);
    const defaultPositions = useMemo(() => {
        return TACTICAL_FORMATIONS[modality] || TACTICAL_FORMATIONS['Fútbol 5'];
    }, [modality]);

    return (
        <View style={styles.wrapper}>
            <View style={styles.metaRow}>
                <Text style={styles.metaText}>Formación Visual ({modality})</Text>
                <Text style={styles.metaText}>{players.length} Jugadores</Text>
            </View>

            <View style={styles.pitch}>
                {/* Línea central y círculo */}
                <View style={styles.halfwayLine} />
                <View style={styles.centerCircle} />
                <View style={styles.centerSpot} />
                {/* Áreas */}
                <View style={styles.topPenaltyBox} />
                <View style={styles.bottomPenaltyBox} />

                {players.map((player, index) => {
                    const pos = defaultPositions[index] || {
                        top: `${20 + ((index * 12) % 60)}%` as `${number}%`,
                        left: `${20 + ((index * 25) % 70)}%` as `${number}%`,
                        team: 'home' as const,
                    };
                    const isAway = pos.team === 'away';
                    const displayName =
                        player.firstName || player.username || `J${index + 1}`;

                    return (
                        <TouchableOpacity
                            key={player.participationId || `p-${index}`}
                            activeOpacity={0.8}
                            onPress={() => onPlayerPress?.(player)}
                            style={[
                                styles.playerPin,
                                { top: pos.top, left: pos.left },
                            ]}
                        >
                            <View
                                style={[
                                    styles.jersey,
                                    isAway ? styles.jerseyAway : styles.jerseyHome,
                                ]}
                            >
                                <Text style={styles.jerseyNumber}>{index + 1}</Text>
                            </View>
                            <View style={styles.nameTag}>
                                <Text style={styles.nameText} numberOfLines={1}>
                                    {displayName}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}

                {players.length === 0 && (
                    <View style={styles.emptyOverlay}>
                        <Text style={styles.emptyText}>Sin jugadores posicionados</Text>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    metaText: {
        color: THEME.colors.textSecondary,
        fontSize: 12,
        fontWeight: '600',
    },
    pitch: {
        width: '100%',
        height: 320,
        backgroundColor: '#059669',
        borderRadius: THEME.borderRadius.lg,
        borderWidth: 3,
        borderColor: '#1e293b',
        overflow: 'hidden',
        position: 'relative',
    },
    halfwayLine: {
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.4)',
    },
    centerCircle: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 76,
        height: 76,
        marginLeft: -38,
        marginTop: -38,
        borderRadius: 38,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    centerSpot: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 8,
        height: 8,
        marginLeft: -4,
        marginTop: -4,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.6)',
    },
    topPenaltyBox: {
        position: 'absolute',
        top: 0,
        left: '25%',
        width: '50%',
        height: 48,
        borderBottomWidth: 2,
        borderLeftWidth: 2,
        borderRightWidth: 2,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    bottomPenaltyBox: {
        position: 'absolute',
        bottom: 0,
        left: '25%',
        width: '50%',
        height: 48,
        borderTopWidth: 2,
        borderLeftWidth: 2,
        borderRightWidth: 2,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    playerPin: {
        position: 'absolute',
        transform: [{ translateX: -22 }, { translateY: -22 }],
        alignItems: 'center',
        width: 56,
    },
    jersey: {
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    jerseyHome: {
        backgroundColor: '#0f172a',
        borderColor: '#fbbf24',
    },
    jerseyAway: {
        backgroundColor: '#be123c',
        borderColor: '#fda4af',
    },
    jerseyNumber: {
        color: '#ffffff',
        fontSize: 11,
        fontWeight: '800',
    },
    nameTag: {
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        paddingHorizontal: 5,
        paddingVertical: 1,
        borderRadius: 8,
        marginTop: 2,
    },
    nameText: {
        color: '#ffffff',
        fontSize: 9,
        fontWeight: '600',
    },
    emptyOverlay: {
        ...StyleSheet.absoluteFill,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    emptyText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '600',
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
});
