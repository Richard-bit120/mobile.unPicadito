import { THEME } from '@/config/theme';
import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, style, ...props }) => {
    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={[
                    styles.input,
                    !!error && styles.inputError,
                    props.editable === false && styles.inputDisabled,
                    style,
                ]}
                placeholderTextColor={THEME.colors.textMuted}
                {...props}
            />
            {!!error && <Text style={styles.errorText}>{error}</Text>}
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
        height: 48,
        backgroundColor: THEME.colors.surface,
        borderWidth: 1,
        borderColor: THEME.colors.surfaceBorder,
        borderRadius: THEME.borderRadius.md,
        paddingHorizontal: THEME.spacing.md,
        color: THEME.colors.text,
        fontSize: 15,
    },
    inputError: {
        borderColor: THEME.colors.danger,
    },
    inputDisabled: {
        opacity: 0.5,
    },
    errorText: {
        color: THEME.colors.danger,
        fontSize: 12,
        marginTop: 4,
    },
});