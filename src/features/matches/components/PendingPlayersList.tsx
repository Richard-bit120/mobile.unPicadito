import { Avatar } from '@/components/ui/Avatar';
import { THEME } from '@/config/theme';
import { formatPlayerFullName } from '@/utils/userFormatters';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PendienteCalificar } from '../types/match.types';

interface PendingPlayersListProps {
    players: PendienteCalificar[];
    selectedId: number | null;
    disabled?: boolean;
    onSelect: (userId: number) => void;
}

export const PendingPlayersList: React.FC<PendingPlayersListProps> = ({
    players,
    selectedId,
    disabled = false,
    onSelect,
}) => {
    return (
        <View style={styles.list}>
            {players.map((player) => {
                const isSelected = player.userId === selectedId;
                const isDisabled = !player.puedeCalificar || disabled;
                const fullName = formatPlayerFullName(player);
                const subtitle = player.puedeCalificar
                    ? player.posicionPrincipal || `@${player.nombreUsuario}`
                    : `Podrás calificarlo en ${player.diasRestantes} día${player.diasRestantes === 1 ? '' : 's'}`;

                return (
                    <TouchableOpacity
                        key={player.userId}
                        style={[
                            styles.playerRow,
                            isSelected && styles.playerRowSelected,
                            !player.puedeCalificar && styles.playerRowDisabled,
                        ]}
                        disabled={isDisabled}
                        onPress={() => onSelect(player.userId)}
                        accessibilityRole="button"
                        accessibilityLabel={fullName}
                        accessibilityState={{ selected: isSelected, disabled: isDisabled }}
                    >
                        <Avatar
                            uri={player.fotoPerfilUrl}
                            name={player.nombre}
                            size={42}
                            borderWidth={1}
                            fallbackInitial="J"
                        />
                        <View style={styles.info}>
                            <Text style={styles.playerName} numberOfLines={1}>
                                {fullName}
                            </Text>
                            <Text style={styles.playerSub} numberOfLines={1}>
                                {subtitle}
                            </Text>
                        </View>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    list: {
        gap: THEME.spacing.xs,
    },
    playerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: THEME.spacing.sm,
        paddingVertical: 10,
        paddingHorizontal: THEME.spacing.sm,
        borderWidth: 1,
        borderColor: 'transparent',
        borderBottomColor: THEME.colors.surfaceBorder,
        borderRadius: THEME.borderRadius.sm,
    },
    playerRowSelected: {
        backgroundColor: THEME.colors.surfaceLight,
        borderColor: THEME.colors.primary,
        borderBottomColor: THEME.colors.primary,
    },
    playerRowDisabled: {
        opacity: 0.5,
    },
    info: {
        flex: 1,
    },
    playerName: {
        color: THEME.colors.text,
        fontSize: 15,
        fontWeight: '600',
    },
    playerSub: {
        color: THEME.colors.textMuted,
        fontSize: 12,
        marginTop: 2,
    },
});
