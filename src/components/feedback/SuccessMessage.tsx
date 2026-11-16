import { THEME } from '@/config/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface SuccessMessageProps {
    message?: string | null;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({ message }) => {
    if (!message) return null;
    return (
        <View style={styles.box} accessibilityRole="alert">
            <Text style={styles.text}>{message}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    box: {
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        borderWidth: 1,
        borderColor: THEME.colors.primary,
        borderRadius: THEME.borderRadius.md,
        padding: THEME.spacing.sm,
        marginBottom: THEME.spacing.md,
    },
    text: {
        color: THEME.colors.primaryLight,
        fontSize: 14,
        fontWeight: '600',
    },
});

