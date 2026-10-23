import { THEME } from '@/config/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ErrorMessageProps {
    message?: string | null;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
    if (!message) return null;
    return (
        <View style={styles.box}>
            <Text style={styles.text}>{message}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    box: {
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        borderWidth: 1,
        borderColor: THEME.colors.danger,
        borderRadius: THEME.borderRadius.md,
        padding: THEME.spacing.sm,
        marginBottom: THEME.spacing.md,
    },
    text: {
        color: THEME.colors.danger,
        fontSize: 14,
    },
});