import { Button } from '@/components/ui/Button';
import { DateTimeField } from '@/components/ui/DateTimeField';
import { Input } from '@/components/ui/Input';
import { SelectModal } from '@/components/ui/SelectModal';
import { THEME } from '@/config/theme';
import { OTRAS_LOCALIDADES, RADIO_DISTANCIA_OPCIONES } from '@/constants/location.constants';
import { X } from 'lucide-react-native';
import React from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { MatchFilters } from '../types/match.types';

interface MatchFilterModalProps {
    visible: boolean;
    filters: MatchFilters;
    onFilterChange: (key: keyof MatchFilters, value: any) => void;
    onReset: () => void;
    onClose: () => void;
}

const PRIVACY_OPTIONS = [
    { value: '', label: 'Todas' },
    { value: 'true', label: 'Solo Públicas' },
    { value: 'false', label: 'Solo Privadas' },
];

const SUBSTITUTES_OPTIONS = [
    { value: '', label: 'Todos' },
    { value: 'true', label: 'Permite suplentes' },
    { value: 'false', label: 'Sin suplentes' },
];

const LOCALIDAD_OPTIONS = [
    { value: '', label: 'Todas las localidades' },
    ...OTRAS_LOCALIDADES.map((loc) => ({
        value: loc.id,
        label: `${loc.nombre} (${loc.provincia})`,
    })),
];

export const MatchFilterModal: React.FC<MatchFilterModalProps> = ({
    visible,
    filters,
    onFilterChange,
    onReset,
    onClose,
}) => {
    const selectedLocalidadId = OTRAS_LOCALIDADES.find(
        (l) => filters.lat !== undefined && filters.lng !== undefined &&
            Math.abs(l.lat - filters.lat) < 0.01 &&
            Math.abs(l.lng - filters.lng) < 0.01
    )?.id || '';

    const handleLocalidadChange = (locId: string) => {
        if (!locId) {
            onFilterChange('lat', undefined);
            onFilterChange('lng', undefined);
            return;
        }
        const found = OTRAS_LOCALIDADES.find((l) => l.id === locId);
        if (found) {
            onFilterChange('lat', found.lat);
            onFilterChange('lng', found.lng);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.backdrop}>
                <View style={styles.sheet}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Filtrar Partidos</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <X size={22} color={THEME.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        style={styles.body}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <SelectModal
                            label="Ubicación / Ciudad"
                            value={selectedLocalidadId}
                            options={LOCALIDAD_OPTIONS}
                            onChange={handleLocalidadChange}
                        />

                        {filters.lat !== undefined && (
                            <SelectModal
                                label="Radio de distancia"
                                value={String(filters.radioKm ?? '10')}
                                options={RADIO_DISTANCIA_OPCIONES}
                                onChange={(v) => onFilterChange('radioKm', Number(v))}
                            />
                        )}

                        <Input
                            label="Lugar / Cancha"
                            placeholder="Ej. La Bombonerita"
                            value={filters.nombreCancha || ''}
                            onChangeText={(v) => onFilterChange('nombreCancha', v)}
                        />

                        <SelectModal
                            label="Privacidad"
                            value={String(filters.esPublica ?? '')}
                            options={PRIVACY_OPTIONS}
                            onChange={(v) => onFilterChange('esPublica', v)}
                        />

                        <SelectModal
                            label="Suplentes"
                            value={String(filters.permiteSuplentes ?? '')}
                            options={SUBSTITUTES_OPTIONS}
                            onChange={(v) => onFilterChange('permiteSuplentes', v)}
                        />

                        <DateTimeField
                            label="Fecha"
                            mode="date"
                            value={filters.date || ''}
                            onChange={(v) => onFilterChange('date', v)}
                        />

                        <DateTimeField
                            label="Hora (A partir de)"
                            mode="time"
                            value={filters.time || ''}
                            onChange={(v) => onFilterChange('time', v)}
                        />

                        <View style={styles.switchRow}>
                            <Text style={styles.switchLabel}>Solo con lugares disponibles</Text>
                            <Switch
                                value={Boolean(filters.onlyAvailable)}
                                onValueChange={(v) => onFilterChange('onlyAvailable', v)}
                                trackColor={{
                                    false: THEME.colors.surfaceBorder,
                                    true: THEME.colors.primary,
                                }}
                            />
                        </View>
                    </ScrollView>

                    <View style={styles.footer}>
                        <Button
                            title="Limpiar"
                            variant="outline"
                            onPress={() => {
                                onReset();
                                onClose();
                            }}
                            style={styles.footerBtn}
                        />
                        <Button
                            title="Ver Resultados"
                            onPress={onClose}
                            style={styles.footerBtn}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.65)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: THEME.colors.surface,
        borderTopLeftRadius: THEME.borderRadius.lg,
        borderTopRightRadius: THEME.borderRadius.lg,
        borderWidth: 1,
        borderColor: THEME.colors.surfaceBorder,
        maxHeight: '85%',
        padding: THEME.spacing.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: THEME.colors.surfaceBorder,
        paddingBottom: THEME.spacing.sm,
        marginBottom: THEME.spacing.md,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: THEME.colors.text,
    },
    closeBtn: {
        padding: 4,
    },
    body: {
        marginBottom: THEME.spacing.md,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: THEME.spacing.sm,
        marginBottom: THEME.spacing.md,
    },
    switchLabel: {
        color: THEME.colors.text,
        fontSize: 15,
        flex: 1,
    },
    footer: {
        flexDirection: 'row',
        gap: THEME.spacing.sm,
        borderTopWidth: 1,
        borderTopColor: THEME.colors.surfaceBorder,
        paddingTop: THEME.spacing.sm,
    },
    footerBtn: {
        flex: 1,
    },
});
