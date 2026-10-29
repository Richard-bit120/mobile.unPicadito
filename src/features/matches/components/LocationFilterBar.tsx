import { THEME } from '@/config/theme';
import { LocalidadOpcion, OTRAS_LOCALIDADES, TIPO_UBICACION_FILTRO } from '@/constants/location.constants';
import { Building2, Check, ChevronDown, MapPin, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface LocationFilterBarProps {
    tipoUbicacion: string;
    nombreUbicacion: string;
    onGpsClick: () => void;
    onLocalidadClick: (loc: LocalidadOpcion) => void;
    isLoadingGps?: boolean;
    label?: string;
}

export const LocationFilterBar: React.FC<LocationFilterBarProps> = ({
    tipoUbicacion,
    nombreUbicacion,
    onGpsClick,
    onLocalidadClick,
    isLoadingGps = false,
    label = 'Cercanas a:',
}) => {
    const isGpsActive = tipoUbicacion === TIPO_UBICACION_FILTRO.MI_UBICACION;
    const isOtherActive = tipoUbicacion === TIPO_UBICACION_FILTRO.OTRAS_OPCIONES;
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <View style={styles.card}>
            <View style={styles.row}>
                {/* Texto de ubicación actual */}
                <View style={styles.infoGroup}>
                    <MapPin size={14} color={THEME.colors.primary} />
                    <Text style={styles.label}>{label}</Text>
                    <Text style={styles.currentLocation} numberOfLines={1}>
                        {nombreUbicacion || 'Posadas'}
                    </Text>
                </View>

                {/* Botones de acción compactos */}
                <View style={styles.pillsGroup}>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={[styles.pill, isGpsActive ? styles.pillActive : styles.pillOutline]}
                        onPress={onGpsClick}
                        disabled={isLoadingGps}
                    >
                        {isLoadingGps ? (
                            <ActivityIndicator
                                size="small"
                                color={isGpsActive ? '#fff' : THEME.colors.primary}
                                style={{ transform: [{ scale: 0.7 }] }}
                            />
                        ) : (
                            <MapPin size={12} color={isGpsActive ? '#fff' : THEME.colors.primary} />
                        )}
                        <Text style={[styles.pillText, isGpsActive ? styles.pillTextActive : styles.pillTextOutline]}>
                            Mi GPS
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={[styles.pill, isOtherActive ? styles.pillActive : styles.pillOutline]}
                        onPress={() => setModalVisible(true)}
                    >
                        <Building2 size={12} color={isOtherActive ? '#fff' : THEME.colors.primary} />
                        <Text style={[styles.pillText, isOtherActive ? styles.pillTextActive : styles.pillTextOutline]}>
                            Ciudad
                        </Text>
                        <ChevronDown size={12} color={isOtherActive ? '#fff' : THEME.colors.textMuted} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Modal selector de localidad */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable style={styles.backdrop} onPress={() => setModalVisible(false)}>
                    <View style={styles.sheet}>
                        <View style={styles.sheetHeader}>
                            <Text style={styles.sheetTitle}>Elegí tu localidad</Text>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <X size={18} color={THEME.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={OTRAS_LOCALIDADES}
                            keyExtractor={(item) => item.id}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => {
                                const isSelected = Boolean(nombreUbicacion?.includes(item.nombre));
                                return (
                                    <TouchableOpacity
                                        activeOpacity={0.7}
                                        style={[styles.cityItem, isSelected && styles.cityItemSelected]}
                                        onPress={() => {
                                            onLocalidadClick(item);
                                            setModalVisible(false);
                                        }}
                                    >
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.cityName, isSelected && styles.cityNameSelected]}>
                                                {item.nombre}
                                            </Text>
                                            <Text style={styles.cityProv}>{item.provincia}</Text>
                                        </View>
                                        {isSelected && (
                                            <Check size={16} color={THEME.colors.primary} />
                                        )}
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
    card: {
        backgroundColor: THEME.colors.surface,
        borderRadius: THEME.borderRadius.md,
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderWidth: 1,
        borderColor: THEME.colors.surfaceBorder,
        marginBottom: THEME.spacing.xs,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 6,
    },
    infoGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        flexShrink: 1,
    },
    label: {
        color: THEME.colors.textMuted,
        fontSize: 11,
    },
    currentLocation: {
        color: THEME.colors.text,
        fontSize: 12,
        fontWeight: '700',
        maxWidth: 130,
    },
    pillsGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 9,
        paddingVertical: 4,
        borderRadius: THEME.borderRadius.full,
        minHeight: 28,
    },
    pillActive: {
        backgroundColor: THEME.colors.primary,
    },
    pillOutline: {
        backgroundColor: THEME.colors.surfaceLight,
        borderWidth: 1,
        borderColor: THEME.colors.surfaceBorder,
    },
    pillText: {
        fontSize: 11,
        fontWeight: '600',
    },
    pillTextActive: {
        color: '#ffffff',
    },
    pillTextOutline: {
        color: THEME.colors.textSecondary,
    },
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: THEME.spacing.lg,
    },
    sheet: {
        width: '100%',
        maxHeight: 360,
        backgroundColor: THEME.colors.surface,
        borderRadius: THEME.borderRadius.lg,
        borderWidth: 1,
        borderColor: THEME.colors.surfaceBorder,
        padding: THEME.spacing.md,
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: THEME.colors.surfaceBorder,
        paddingBottom: 8,
        marginBottom: 8,
    },
    sheetTitle: {
        color: THEME.colors.text,
        fontSize: 15,
        fontWeight: '700',
    },
    cityItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: THEME.borderRadius.sm,
    },
    cityItemSelected: {
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
    },
    cityName: {
        color: THEME.colors.text,
        fontSize: 13,
        fontWeight: '600',
    },
    cityNameSelected: {
        color: THEME.colors.primaryLight,
    },
    cityProv: {
        color: THEME.colors.textMuted,
        fontSize: 11,
        marginTop: 1,
    },
});
