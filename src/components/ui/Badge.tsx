import { THEME } from '@/config/theme';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface BadgeProps {
    label: string;
    variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
    style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'neutral', style }) => {
    return (
        <View style={[styles.base, styles[variant], style]}>
            <Text style={[styles.text, styles[`${variant}Text`]]}>{label}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    base: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: THEME.borderRadius.full,
        alignSelf: 'flex-start',
    },
    text: {
        fontSize: 12,
        fontWeight: '600',
    },
    success: { backgroundColor: 'rgba(16, 185, 129, 0.2)' },
    successText: { color: THEME.colors.primaryLight },
    warning: { backgroundColor: 'rgba(245, 158, 11, 0.2)' },
    warningText: { color: THEME.colors.warning },
    danger: { backgroundColor: 'rgba(239, 68, 68, 0.2)' },
    dangerText: { color: THEME.colors.danger },
    info: { backgroundColor: 'rgba(59, 130, 246, 0.2)' },
    infoText: { color: THEME.colors.info },
    neutral: { backgroundColor: THEME.colors.surfaceLight },
    neutralText: { color: THEME.colors.textSecondary },
});