import { THEME } from '@/config/theme';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface LoadingSpinnerProps {
    label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ label }) => {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={THEME.colors.primary} />
            {label && <Text style={styles.text}>{label}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: THEME.colors.background,
        padding: THEME.spacing.xl,
    },
    text: {
        color: THEME.colors.textSecondary,
        marginTop: THEME.spacing.sm,
        fontSize: 14,
    },
});