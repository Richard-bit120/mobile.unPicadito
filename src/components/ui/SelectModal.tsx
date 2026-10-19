import { THEME } from '@/config/theme';
import { Check, ChevronDown } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export interface SelectOption {
    label: string;
    value: string;
}

interface SelectModalProps {
    label?: string;
    value: string;
    options: SelectOption[];
    onChange: (value: string) => void;
    placeholder?: string;
}

export const SelectModal: React.FC<SelectModalProps> = ({
    label,
    value,
    options,
    onChange,
    placeholder = 'Seleccionar...',
}) => {
    const [visible, setVisible] = useState(false);
    const selectedOption = options.find((opt) => opt.value === value);

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TouchableOpacity style={styles.trigger} onPress={() => setVisible(true)}>
                <Text style={styles.triggerText}>
                    {selectedOption ? selectedOption.label : placeholder}
                </Text>
                <ChevronDown size={20} color={THEME.colors.textSecondary} />
            </TouchableOpacity>

            <Modal visible={visible} transparent animationType="fade">
                <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
                    <View style={styles.sheet}>
                        <Text style={styles.sheetTitle}>{label || 'Selecciona una opción'}</Text>
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => {
                                const isSelected = item.value === value;
                                return (
                                    <TouchableOpacity
                                        style={[styles.option, isSelected && styles.optionSelected]}
                                        onPress={() => {
                                            onChange(item.value);
                                            setVisible(false);
                                        }}
                                    >
                                        <Text
                                            style={[
                                                styles.optionText,
                                                isSelected && styles.optionTextSelected,
                                            ]}
                                        >
                                            {item.label}
                                        </Text>
                                        {isSelected && <Check size={18} color={THEME.colors.primary} />}
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginBottom: THEME.spacing.md },
    label: {
        color: THEME.colors.textSecondary,
        fontSize: 14,
        marginBottom: THEME.spacing.xs,
    },
    trigger: {
        height: 48,
        backgroundColor: THEME.colors.surface,
        borderWidth: 1,
        borderColor: THEME.colors.surfaceBorder,
        borderRadius: THEME.borderRadius.md,
        paddingHorizontal: THEME.spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    triggerText: { color: THEME.colors.text, fontSize: 15 },
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.65)',
        justifyContent: 'center',
        padding: THEME.spacing.lg,
    },
    sheet: {
        backgroundColor: THEME.colors.surface,
        borderRadius: THEME.borderRadius.lg,
        borderWidth: 1,
        borderColor: THEME.colors.surfaceBorder,
        padding: THEME.spacing.md,
        maxHeight: '60%',
    },
    sheetTitle: {
        color: THEME.colors.text,
        fontSize: 16,
        fontWeight: '700',
        marginBottom: THEME.spacing.sm,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: THEME.spacing.sm,
        borderRadius: THEME.borderRadius.sm,
    },
    optionSelected: { backgroundColor: THEME.colors.surfaceLight },
    optionText: { color: THEME.colors.textSecondary, fontSize: 15 },
    optionTextSelected: { color: THEME.colors.primary, fontWeight: '600' },
});