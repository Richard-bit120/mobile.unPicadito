import { THEME } from "@/config/theme";
import React from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableOpacityProps,
} from "react-native";

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: "primary" | "secondary" | "danger" | "outline";
    loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    variant = "primary",
    loading = false,
    disabled,
    style,
    ...props
}) => {
    const isActionDisabled = disabled || loading;

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            disabled={isActionDisabled}
            style={[
                styles.base,
                styles[variant],
                isActionDisabled && styles.disabled,
                style,
            ]}
            {...props}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === "outline" ? THEME.colors.primary : "#fff"}
                />
            ) : (
                <Text
                    style={[styles.text, variant === "outline" && styles.textOutline]}
                >
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    base: {
        height: 48,
        borderRadius: THEME.borderRadius.md,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: THEME.spacing.md,
    },
    primary: {
        backgroundColor: THEME.colors.primary,
    },
    secondary: {
        backgroundColor: THEME.colors.surfaceLight,
    },
    danger: {
        backgroundColor: THEME.colors.danger,
    },
    outline: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: THEME.colors.primary,
    },
    disabled: {
        opacity: 0.5,
    },
    text: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },
    textOutline: {
        color: THEME.colors.primary,
    },
});
