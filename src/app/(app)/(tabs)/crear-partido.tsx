import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { DateTimeField } from '@/components/ui/DateTimeField';
import { Input } from '@/components/ui/Input';
import { LocationPickerMap } from '@/components/ui/LocationPickerMap';
import { SectionCard } from '@/components/ui/SectionCard';
import { Textarea } from '@/components/ui/Textarea';
import { THEME } from '@/config/theme';
import { INITIAL_ROOM_FORM_VALUES } from '@/constants/match.constants';
import { createRoomSchema } from '@/features/matches/schemas/roomSchema';
import { matchService } from '@/features/matches/services/matchService';
import { createIsoFromLocal } from '@/features/matches/utils/dateUtils';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import * as yup from 'yup';

export default function CrearPartidoScreen() {
    const router = useRouter();
    const [formData, setFormData] = useState(INITIAL_ROOM_FORM_VALUES);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [apiError, setApiError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

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
                nombre: validData.nombre.trim(),
                descripcion: validData.descripcion?.trim() || undefined,
                nombreCancha: validData.nombreCancha.trim(),
                direccion: validData.direccion.trim(),
                fechaHoraPartido: createIsoFromLocal(validData.fecha, validData.hora),
                cuposTotales: Number(validData.cuposTotales),
                permiteSuplentes: Boolean(validData.permiteSuplentes),
                esPublica: Boolean(validData.esPublica),
                ubicacion: formData.ubicacion,
            });

            setFormData(INITIAL_ROOM_FORM_VALUES);
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

            <SectionCard title="Datos del Partido">
                <Input
                    label="Nombre de la sala"
                    placeholder="Ej: Picadito de los jueves"
                    value={formData.nombre}
                    onChangeText={(v) => handleChange('nombre', v)}
                    error={errors.nombre}
                />
                <Input
                    label="Nombre de la cancha / complejo"
                    placeholder="Ej: Complejo La Redonda"
                    value={formData.nombreCancha}
                    onChangeText={(v) => handleChange('nombreCancha', v)}
                    error={errors.nombreCancha}
                />
                <Input
                    label="Dirección"
                    placeholder="Ej: Av. Mitre 1234"
                    value={formData.direccion}
                    onChangeText={(v) => handleChange('direccion', v)}
                    error={errors.direccion}
                />
                <DateTimeField
                    label="Fecha del partido"
                    mode="date"
                    value={formData.fecha}
                    onChange={(v) => handleChange('fecha', v)}
                    error={errors.fecha}
                />
                <DateTimeField
                    label="Hora del partido"
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
                    placeholder="Indicaciones adicionales, tipo de calzado, etc."
                    value={formData.descripcion}
                    onChangeText={(v) => handleChange('descripcion', v)}
                    maxLength={200}
                    currentLength={formData.descripcion.length}
                    error={errors.descripcion}
                />
            </SectionCard>

            <SectionCard title="Configuración y Ubicación">
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

            <Button title="Crear Sala" onPress={handleSubmit} loading={submitting} />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
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