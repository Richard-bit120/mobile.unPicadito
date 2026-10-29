import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DateTimeField } from '@/components/ui/DateTimeField';
import { Input } from '@/components/ui/Input';
import { LocationPickerMap } from '@/components/ui/LocationPickerMap';
import { SectionCard } from '@/components/ui/SectionCard';
import { Textarea } from '@/components/ui/Textarea';
import { THEME } from '@/config/theme';
import { INITIAL_ROOM_FORM_VALUES } from '@/constants/match.constants';
import { LocationFilterBar } from '@/features/matches/components/LocationFilterBar';
import { useUserLocation } from '@/features/matches/hooks/useUserLocation';
import { createRoomSchema } from '@/features/matches/schemas/roomSchema';
import { parseLocationCoords } from '@/features/matches/services/matchMapper';
import { matchService } from '@/features/matches/services/matchService';
import { CanchaItem, PredioItem, predioService } from '@/features/matches/services/predioService';
import { createIsoFromLocal } from '@/features/matches/utils/dateUtils';
import { useDebounce } from '@/hooks/useDebounce';
import { useRouter } from 'expo-router';
import { Building2, Check } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import * as yup from 'yup';

export default function CrearPartidoScreen() {
    const router = useRouter();
    const [formData, setFormData] = useState(INITIAL_ROOM_FORM_VALUES);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [apiError, setApiError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const { location, isLoadingGps, solicitarGps, seleccionarLocalidad } = useUserLocation();

    const [predioQuery, setPredioQuery] = useState('');
    const debouncedPredioQuery = useDebounce(predioQuery, 350);
    const [predios, setPredios] = useState<PredioItem[]>([]);
    const [loadingPredios, setLoadingPredios] = useState(false);
    const [selectedPredio, setSelectedPredio] = useState<PredioItem | null>(null);

    const [canchas, setCanchas] = useState<CanchaItem[]>([]);
    const [loadingCanchas, setLoadingCanchas] = useState(false);
    const [selectedCancha, setSelectedCancha] = useState<CanchaItem | null>(null);

    useEffect(() => {
        if (!selectedPredio && location.lat && location.lng) {
            setFormData((prev) => ({
                ...prev,
                ubicacion: { x: location.lng, y: location.lat },
            }));
        }
    }, [location.lat, location.lng, selectedPredio]);

    useEffect(() => {
        let active = true;
        const fetchPredios = async () => {
            setLoadingPredios(true);
            try {
                const results = await predioService.buscarCercanos({
                    busqueda: debouncedPredioQuery.trim() || undefined,
                    lat: location.lat,
                    lng: location.lng,
                });
                if (active) setPredios(results);
            } catch {
                if (active) setPredios([]);
            } finally {
                if (active) setLoadingPredios(false);
            }
        };

        fetchPredios();
        return () => {
            active = false;
        };
    }, [debouncedPredioQuery, location.lat, location.lng]);

    const handleSelectPredio = async (predio: PredioItem) => {
        setSelectedPredio(predio);
        setSelectedCancha(null);
        setFormData((prev) => ({
            ...prev,
            canchaId: 0,
            direccion: predio.direccion,
            nombreCancha: '',
        }));
        setErrors((prev) => ({ ...prev, canchaId: '' }));

        const coords = parseLocationCoords(predio.ubicacion);
        if (coords) {
            setFormData((prev) => ({ ...prev, ubicacion: coords }));
        }

        setLoadingCanchas(true);
        try {
            const list = await predioService.getCanchasPorPredio(predio.id);
            setCanchas(list);
        } catch {
            setCanchas([]);
        } finally {
            setLoadingCanchas(false);
        }
    };

    const handleSelectCancha = (cancha: CanchaItem) => {
        setSelectedCancha(cancha);

        let defaultCupos = formData.cuposTotales;
        const tipoLower = (cancha.tipo || '').toLowerCase();
        if (tipoLower.includes('5')) defaultCupos = 10;
        else if (tipoLower.includes('7')) defaultCupos = 14;
        else if (tipoLower.includes('11')) defaultCupos = 22;

        setFormData((prev) => ({
            ...prev,
            canchaId: cancha.id,
            nombreCancha: cancha.nombre,
            cuposTotales: defaultCupos,
        }));
        setErrors((prev) => ({ ...prev, canchaId: '' }));
    };

    const handleChange = (name: string, value: any) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
        setApiError(null);
    };

    const handleSubmit = async () => {
        setErrors({});
        setApiError(null);

        let validData: any;
        try {
            validData = await createRoomSchema.validate(formData, { abortEarly: false });
        } catch (err: any) {
            if (err instanceof yup.ValidationError) {
                const fieldErrs: Record<string, string> = {};
                err.inner.forEach((e) => {
                    if (e.path && !fieldErrs[e.path]) fieldErrs[e.path] = e.message;
                });
                setErrors(fieldErrs);
                return;
            }
            throw err;
        }

        setSubmitting(true);
        try {
            const created = await matchService.createRoom({
                canchaId: Number(validData.canchaId),
                nombre: validData.nombre.trim(),
                descripcion: validData.descripcion?.trim() || undefined,
                nombreCancha: validData.nombreCancha?.trim() || undefined,
                direccion: validData.direccion?.trim() || undefined,
                fechaHoraPartido: createIsoFromLocal(validData.fecha, validData.hora),
                cuposTotales: Number(validData.cuposTotales),
                permiteSuplentes: Boolean(validData.permiteSuplentes),
                esPublica: Boolean(validData.esPublica),
                ubicacion: formData.ubicacion,
            });

            setFormData(INITIAL_ROOM_FORM_VALUES);
            setSelectedPredio(null);
            setSelectedCancha(null);

            if (created?.id) {
                router.push(`/salas/${created.id}`);
            } else {
                router.push('/(app)/(tabs)');
            }
        } catch (err: any) {
            setApiError(err.message || 'No se pudo crear la sala.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ScreenContainer>
            <ErrorMessage message={apiError} />

            <SectionCard title="1. Selección de Complejo y Cancha">
                <Text style={styles.helperText}>
                    Las canchas se ordenan automáticamente por cercanía a tu ubicación real:
                </Text>

                <LocationFilterBar
                    tipoUbicacion={location.tipo}
                    nombreUbicacion={location.nombre}
                    onGpsClick={() => solicitarGps()}
                    onLocalidadClick={(loc) => seleccionarLocalidad(loc)}
                    isLoadingGps={isLoadingGps}
                    label="Buscar cerca de:"
                />

                <Input
                    label="Buscar complejo o predio"
                    placeholder="Ej: Posadas Fútbol, La Redonda..."
                    value={predioQuery}
                    onChangeText={setPredioQuery}
                />

                {loadingPredios && (
                    <View style={styles.loadingRow}>
                        <ActivityIndicator size="small" color={THEME.colors.primary} />
                        <Text style={styles.loadingText}>Buscando predios cercanos...</Text>
                    </View>
                )}

                {!selectedPredio && predios.length > 0 && (
                    <View style={styles.prediosContainer}>
                        {predios.slice(0, 5).map((predio) => (
                            <TouchableOpacity
                                key={predio.id}
                                style={styles.predioItem}
                                onPress={() => handleSelectPredio(predio)}
                            >
                                <View style={styles.predioIcon}>
                                    <Building2 size={18} color={THEME.colors.primary} />
                                </View>
                                <View style={styles.predioInfo}>
                                    <Text style={styles.predioNombre}>{predio.nombre}</Text>
                                    <Text style={styles.predioDir}>
                                        {predio.direccion} - {predio.localidad}
                                    </Text>
                                </View>
                                {predio.distanciaKm !== undefined && (
                                    <Badge
                                        label={`${predio.distanciaKm} km`}
                                        variant="info"
                                    />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {selectedPredio && (
                    <View style={styles.selectedPredioCard}>
                        <View style={styles.selectedPredioHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.selectedPredioLabel}>Complejo seleccionado:</Text>
                                <Text style={styles.selectedPredioName}>{selectedPredio.nombre}</Text>
                                <Text style={styles.selectedPredioDir}>{selectedPredio.direccion}</Text>
                            </View>
                            <Button
                                title="Cambiar"
                                variant="outline"
                                onPress={() => {
                                    setSelectedPredio(null);
                                    setSelectedCancha(null);
                                    setFormData((prev) => ({ ...prev, canchaId: 0 }));
                                }}
                            />
                        </View>

                        <Text style={styles.canchasSectionTitle}>Canchas del complejo:</Text>
                        {loadingCanchas && (
                            <ActivityIndicator size="small" color={THEME.colors.primary} />
                        )}

                        {!loadingCanchas && canchas.length === 0 && (
                            <Text style={styles.mutedText}>
                                Este complejo no tiene canchas registradas activas.
                            </Text>
                        )}

                        <View style={styles.canchasGrid}>
                            {canchas.map((c) => {
                                const isSelected = selectedCancha?.id === c.id;
                                return (
                                    <TouchableOpacity
                                        key={c.id}
                                        style={[
                                            styles.canchaCard,
                                            isSelected && styles.canchaCardSelected,
                                        ]}
                                        onPress={() => handleSelectCancha(c)}
                                    >
                                        <View style={styles.canchaTopRow}>
                                            <Text style={[styles.canchaName, isSelected && styles.canchaNameSelected]}>
                                                {c.nombre}
                                            </Text>
                                            {isSelected && <Check size={16} color="#fff" />}
                                        </View>
                                        <View style={styles.canchaBadgeRow}>
                                            <Badge label={c.tipo || 'Fútbol'} variant={isSelected ? 'success' : 'neutral'} />
                                            {!!c.superficie && (
                                                <Text style={styles.canchaSuperficie}>{c.superficie}</Text>
                                            )}
                                        </View>
                                        {c.precioPorHora > 0 && (
                                            <Text style={styles.canchaPrecio}>
                                                ${c.precioPorHora.toLocaleString()} / hs
                                            </Text>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                )}

                {!!errors.canchaId && (
                    <Text style={styles.errorText}>{errors.canchaId}</Text>
                )}
            </SectionCard>

            <SectionCard title="2. Datos del Partido">
                <Input
                    label="Nombre de la sala"
                    placeholder="Ej: Picadito de los jueves"
                    value={formData.nombre}
                    onChangeText={(v) => handleChange('nombre', v)}
                    error={errors.nombre}
                />
                <DateTimeField
                    label="Fecha del partido"
                    mode="date"
                    value={formData.fecha}
                    onChange={(v) => handleChange('fecha', v)}
                    error={errors.fecha}
                />
                <DateTimeField
                    label="Hora del partido (en punto, ej: 19:00)"
                    mode="time"
                    value={formData.hora}
                    onChange={(v) => handleChange('hora', v)}
                    error={errors.hora}
                />
                <Input
                    label="Cupos totales (jugadores)"
                    keyboardType="numeric"
                    value={String(formData.cuposTotales)}
                    onChangeText={(v) => handleChange('cuposTotales', v)}
                    error={errors.cuposTotales}
                />
                <Textarea
                    label="Descripción (opcional)"
                    placeholder="Indicaciones adicionales, calzado permitido, etc."
                    value={formData.descripcion}
                    onChangeText={(v) => handleChange('descripcion', v)}
                    maxLength={200}
                    currentLength={formData.descripcion.length}
                    error={errors.descripcion}
                />
            </SectionCard>

            <SectionCard title="3. Configuración y Ubicación">
                <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>Sala Pública</Text>
                    <Switch
                        value={formData.esPublica}
                        onValueChange={(v) => handleChange('esPublica', v)}
                        trackColor={{ false: THEME.colors.surfaceBorder, true: THEME.colors.primary }}
                    />
                </View>
                <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>Permitir Suplentes</Text>
                    <Switch
                        value={formData.permiteSuplentes}
                        onValueChange={(v) => handleChange('permiteSuplentes', v)}
                        trackColor={{ false: THEME.colors.surfaceBorder, true: THEME.colors.primary }}
                    />
                </View>

                <LocationPickerMap
                    value={formData.ubicacion}
                    onChange={(coords) => handleChange('ubicacion', coords)}
                />
            </SectionCard>

            <Button
                title="Crear Sala"
                onPress={handleSubmit}
                loading={submitting}
                disabled={submitting}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    helperText: {
        color: THEME.colors.textSecondary,
        fontSize: 14,
        marginBottom: THEME.spacing.sm,
    },
    loadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginVertical: THEME.spacing.xs,
    },
    loadingText: {
        color: THEME.colors.textMuted,
        fontSize: 13,
    },
    prediosContainer: {
        backgroundColor: THEME.colors.surfaceLight,
        borderRadius: THEME.borderRadius.md,
        padding: THEME.spacing.xs,
        marginBottom: THEME.spacing.md,
    },
    predioItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: THEME.colors.surfaceBorder,
    },
    predioIcon: {
        marginRight: 10,
        backgroundColor: THEME.colors.surface,
        padding: 6,
        borderRadius: THEME.borderRadius.sm,
    },
    predioInfo: {
        flex: 1,
    },
    predioNombre: {
        color: THEME.colors.text,
        fontSize: 14,
        fontWeight: '600',
    },
    predioDir: {
        color: THEME.colors.textSecondary,
        fontSize: 12,
        marginTop: 2,
    },
    selectedPredioCard: {
        backgroundColor: THEME.colors.surfaceLight,
        borderRadius: THEME.borderRadius.md,
        padding: THEME.spacing.md,
        marginBottom: THEME.spacing.md,
        borderWidth: 1,
        borderColor: THEME.colors.primary,
    },
    selectedPredioHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: THEME.spacing.sm,
    },
    selectedPredioLabel: {
        color: THEME.colors.primaryLight,
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    selectedPredioName: {
        color: THEME.colors.text,
        fontSize: 16,
        fontWeight: '700',
        marginTop: 2,
    },
    selectedPredioDir: {
        color: THEME.colors.textSecondary,
        fontSize: 13,
        marginTop: 2,
    },
    canchasSectionTitle: {
        color: THEME.colors.text,
        fontSize: 14,
        fontWeight: '600',
        marginVertical: THEME.spacing.xs,
    },
    canchasGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 6,
    },
    canchaCard: {
        width: '48%',
        backgroundColor: THEME.colors.surface,
        borderRadius: THEME.borderRadius.sm,
        padding: 10,
        borderWidth: 1,
        borderColor: THEME.colors.surfaceBorder,
    },
    canchaCardSelected: {
        borderColor: THEME.colors.primary,
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
    },
    canchaTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    canchaName: {
        color: THEME.colors.text,
        fontSize: 14,
        fontWeight: '600',
    },
    canchaNameSelected: {
        color: THEME.colors.primaryLight,
    },
    canchaBadgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 6,
    },
    canchaSuperficie: {
        color: THEME.colors.textMuted,
        fontSize: 11,
    },
    canchaPrecio: {
        color: THEME.colors.textSecondary,
        fontSize: 12,
        fontWeight: '600',
        marginTop: 6,
    },
    mutedText: {
        color: THEME.colors.textMuted,
        fontSize: 13,
        marginVertical: 4,
    },
    errorText: {
        color: THEME.colors.danger,
        fontSize: 12,
        marginTop: 4,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: THEME.spacing.md,
    },
    switchLabel: {
        color: THEME.colors.text,
        fontSize: 15,
    },
});
