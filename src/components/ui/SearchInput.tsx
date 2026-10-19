import { THEME } from '@/config/theme';
import { Search, X } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, ViewStyle } from 'react-native';

interface SearchInputProps {
    value: string;
    onChangeText: (text: string) => void;
    onClear?: () => void;
    placeholder?: string;
    style?: ViewStyle;
}

export const SearchInput: React.FC<SearchInputProps> = ({
    value,
    onChangeText,
    onClear,
    placeholder = 'Buscar...',
    style,
}) => {
    const handleClear = () => {
        onChangeText('');
        onClear?.();
    };

    return (
        <View style={[styles.container, style]}>
            <Search size={18} color={THEME.colors.textSecondary} style={styles.icon} />
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={THEME.colors.textMuted}
                autoCapitalize="none"
                returnKeyType="search"
            />
            {value.length > 0 && (
                <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
                    <X size={18} color={THEME.colors.textSecondary} />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 46,
        backgroundColor: THEME.colors.surface,
        borderWidth: 1,
        borderColor: THEME.colors.surfaceBorder,
        borderRadius: THEME.borderRadius.md,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: THEME.spacing.sm,
    },
    icon: {
        marginRight: THEME.spacing.xs,
    },
    input: {
        flex: 1,
        color: THEME.colors.text,
        fontSize: 15,
        height: '100%',
    },
    clearBtn: {
        padding: 4,
    },
});
