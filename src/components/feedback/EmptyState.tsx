import { Button } from '@/components/ui/Button';
import { THEME } from '@/config/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    actionLabel?: string;
    onActionPress?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    actionLabel,
    onActionPress,
}) => {
    return (
        <View style={styles.container}>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text style={styles.title}>{title}</Text>
            {description && <Text style={styles.description}>{description}</Text>}
            {actionLabel && onActionPress && (
                <Button
                    title={actionLabel}
                    onPress={onActionPress}
                    variant="outline"
                    style={styles.button}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: THEME.spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        marginBottom: THEME.spacing.md,
    },
    title: {
        fontSize: 17,
        fontWeight: '600',
        color: THEME.colors.text,
        textAlign: 'center',
        marginBottom: THEME.spacing.xs,
    },
    description: {
        fontSize: 14,
        color: THEME.colors.textMuted,
        textAlign: 'center',
        marginBottom: THEME.spacing.md,
    },
    button: {
        marginTop: THEME.spacing.sm,
    },
});