import { THEME } from '@/config/theme';
import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

interface TextareaProps extends TextInputProps {
    label?: string;
    error?: string;
    maxLength?: number;
    currentLength?: number;
}

export const Textarea: React.FC<TextareaProps> = ({
    label,
    error,
    maxLength,
    currentLength,
    style,
    ...props
}) => {
    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={[styles.input, !!error && styles.inputError, style]}
                placeholderTextColor={THEME.colors.textMuted}
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={maxLength}
                {...props}
            />
            <View style={styles.footer}>
                {error ? <Text style={styles.errorText}>{error}</Text> : <View />}
                {maxLength !== undefined && currentLength !== undefined && (
                    <Text style={styles.counterText}>
                        {currentLength} / {maxLength}
                    </Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: THEME.spacing.md,
    },
    label: {
        color: THEME.colors.textSecondary,
        fontSize: 14,
        marginBottom: THEME.spacing.xs,
    },
    input: {
        minHeight: 96,
        backgroundColor: THEME.colors.surface,
        borderWidth: 1,
        borderColor: THEME.colors.surfaceBorder,
        borderRadius: THEME.borderRadius.md,
        padding: THEME.spacing.sm,
        color: THEME.colors.text,
        fontSize: 15,
    },
    inputError: {
        borderColor: THEME.colors.danger,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    errorText: {
        color: THEME.colors.danger,
        fontSize: 12,
    },
    counterText: {
        color: THEME.colors.textMuted,
        fontSize: 12,
    },
});