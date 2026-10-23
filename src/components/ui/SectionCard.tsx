import { THEME } from '@/config/theme';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface SectionCardProps {
    title?: string;
    subtitle?: string;
    action?: React.ReactNode;
    children: React.ReactNode;
    style?: ViewStyle;
}

export const SectionCard: React.FC<SectionCardProps> = ({
    title,
    subtitle,
    action,
    children,
    style,
}) => {
    return (
        <View style={[styles.container, style]}>
            {(title || action) && (
                <View style={styles.header}>
                    <View style={styles.titleContainer}>
                        {title && <Text style={styles.title}>{title}</Text>}
                        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                    </View>
                    {action && <View style={styles.action}>{action}</View>}
                </View>
            )}
            <View style={styles.content}>{children}</View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: THEME.colors.surface,
        borderRadius: THEME.borderRadius.md,
        borderWidth: 1,
        borderColor: THEME.colors.surfaceBorder,
        padding: THEME.spacing.md,
        marginBottom: THEME.spacing.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: THEME.colors.surfaceBorder,
        paddingBottom: THEME.spacing.sm,
        marginBottom: THEME.spacing.sm,
    },
    titleContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: THEME.colors.text,
    },
    subtitle: {
        fontSize: 12,
        color: THEME.colors.textSecondary,
        marginTop: 2,
    },
    action: {
        marginLeft: THEME.spacing.sm,
    },
    content: {
        // aca van los hijos
    },
});