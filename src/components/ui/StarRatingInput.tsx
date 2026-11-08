import { THEME } from '@/config/theme';
import { REVIEW_RULES } from '@/constants/match.constants';
import { Star } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface StarRatingInputProps {
    value: number;
    onChange: (value: number) => void;
    disabled?: boolean;
    showLabel?: boolean;
}

const STAR_VALUES = Array.from(
    { length: REVIEW_RULES.MAX_STARS - REVIEW_RULES.MIN_STARS + 1 },
    (_, i) => REVIEW_RULES.MIN_STARS + i
);

export const StarRatingInput: React.FC<StarRatingInputProps> = ({
    value,
    onChange,
    disabled = false,
    showLabel = true,
}) => {
    return (
        <View style={styles.row} accessibilityRole="radiogroup">
            {STAR_VALUES.map((n) => (
                <TouchableOpacity
                    key={n}
                    disabled={disabled}
                    onPress={() => onChange(n)}
                    accessibilityRole="radio"
                    accessibilityLabel={`${n} ${n === 1 ? 'estrella' : 'estrellas'}`}
                    accessibilityState={{ selected: value === n, disabled }}
                    style={[styles.star, disabled && styles.disabled]}
                    hitSlop={{ top: 6, bottom: 6, left: 2, right: 2 }}
                >
                    <Star
                        size={34}
                        color={THEME.colors.warning}
                        fill={n <= value ? THEME.colors.warning : 'transparent'}
                    />
                </TouchableOpacity>
            ))}
            {showLabel && (
                <Text style={styles.label}>
                    {value > 0 ? `${value}/${REVIEW_RULES.MAX_STARS}` : 'Sin puntuar'}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: THEME.spacing.md },
    star: { padding: 2 },
    disabled: { opacity: 0.5 },
    label: { color: THEME.colors.textSecondary, fontSize: 14, marginLeft: THEME.spacing.sm },
});

