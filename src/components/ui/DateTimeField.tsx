import { THEME } from '@/config/theme';
import DateTimePicker, { DateTimePickerChangeEvent } from '@react-native-community/datetimepicker';
import { Calendar, Clock } from 'lucide-react-native';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DateTimeFieldProps {
    label: string;
    mode: 'date' | 'time';
    value: string; // 'YYYY-MM-DD' o 'HH:mm'
    onChange: (formattedValue: string) => void;
    error?: string;
    disabled?: boolean;
}

const parseStringToDate = (value: string, mode: 'date' | 'time'): Date => {
    const now = new Date();
    if (!value) return now;
    if (mode === 'date') {
        const [y, m, d] = value.split('-').map(Number);
        if (y && m && d) return new Date(y, m - 1, d);
    } else {
        const [h, min] = value.split(':').map(Number);
        if (h !== undefined && min !== undefined) {
            now.setHours(h, min, 0, 0);
            return now;
        }
    }
    return now;
};

const formatDateToString = (date: Date, mode: 'date' | 'time'): string => {
    const pad = (n: number) => String(n).padStart(2, '0');
    if (mode === 'date') {
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    }
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const DateTimeField: React.FC<DateTimeFieldProps> = ({
    label,
    mode,
    value,
    onChange,
    error,
    disabled = false,
}) => {
    const [show, setShow] = useState(false);

    const handleValueChange = (_event: DateTimePickerChangeEvent, selectedDate: Date) => {
        setShow(Platform.OS === 'ios');
        onChange(formatDateToString(selectedDate, mode));
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity
                disabled={disabled}
                style={[
                    styles.button,
                    !!error && styles.buttonError,
                    disabled && styles.buttonDisabled,
                ]}
                onPress={() => setShow(true)}
            >
                <Text style={[styles.valueText, !value && styles.placeholderText]}>
                    {value || (mode === 'date' ? 'Seleccionar fecha' : 'Seleccionar hora')}
                </Text>
                {mode === 'date' ? (
                    <Calendar size={20} color={THEME.colors.textSecondary} />
                ) : (
                    <Clock size={20} color={THEME.colors.textSecondary} />
                )}
            </TouchableOpacity>
            {!!error && <Text style={styles.errorText}>{error}</Text>}

            {show && (
                <DateTimePicker
                    value={parseStringToDate(value, mode)}
                    mode={mode}
                    is24Hour={true}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onValueChange={handleValueChange}
                    onDismiss={() => setShow(false)}
                    onNeutralButtonPress={() => setShow(false)}
                />
            )}
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
    button: {
        height: 48,
        backgroundColor: THEME.colors.surface,
        borderWidth: 1,
        borderColor: THEME.colors.surfaceBorder,
        borderRadius: THEME.borderRadius.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: THEME.spacing.md,
    },
    buttonError: {
        borderColor: THEME.colors.danger,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    valueText: {
        color: THEME.colors.text,
        fontSize: 15,
    },
    placeholderText: {
        color: THEME.colors.textMuted,
    },
    errorText: {
        color: THEME.colors.danger,
        fontSize: 12,
        marginTop: 4,
    },
});