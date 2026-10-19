import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { DateTimeField } from '@/components/ui/DateTimeField';
import { Input } from '@/components/ui/Input';
import { LocationPickerMap } from '@/components/ui/LocationPickerMap';
import { SectionCard } from '@/components/ui/SectionCard';
import { Textarea } from '@/components/ui/Textarea';
import { THEME } from '@/config/theme';
import { INITIAL_ROOM_FORM_VALUES } from '@/constants/match.constants';
import { roomSchema } from '@/features/matches/schemas/roomSchema';
import { matchService } from '@/features/matches/services/matchService';
import { MappedRoom } from '@/features/matches/types/match.types';
import { createIsoFromLocal, isWithin24Hours } from '@/features/matches/utils/dateUtils';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import * as yup from 'yup';

export default function EditRoomScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();

    const [room, setRoom] = useState<MappedRoom | null>(null);
    const [formData, setFormData] = useState(INITIAL_ROOM_FORM_VALUES);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [apiError, setApiError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!id) return;
        matchService
            .getRoomById(id)
            .then((data) => {
                if (!data) return;
                setRoom(data);
                setFormData({
                    nombre: data.title,
                    nombreCancha: data.raw?.nombreCancha || data.location,
                    direccion: data.raw?.direccion || data.location,
                    fecha: data.date,
                    hora: data.time,
                    cuposTotales: data.maxPlayers,
                    permiteSuplentes: data.allowsSubstitutes,
                    esPublica: data.isPublic,
                    descripcion: data.description || '',
                    ubicacion: data.raw?.ubicacion || INITIAL_ROOM_FORM_VALUES.ubicacion,
                });
            })
            .catch(() => setApiError('No se pudieron cargar los datos de la sala.'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <LoadingSpinner label="Cargando datos..." />;

    const isTimeLocked = isWithin24Hours(room?.raw?.fechaHoraPartido);

    const handleChange = (name: string, value: any) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
        setApiError(null);
    };

    const handleSave = async () => {
        if (!room || !id) return;
        setErrors({});
        setApiError(null);

        try {
            const valid = await roomSchema.validate(formData, { abortEarly: false });
            const patch: Record<string, any> = {};
            const raw = room.raw || {};

            if (valid.nombre !== room.title) patch.nombre = valid.nombre.trim();
            if ((valid.descripcion || '') !== room.description) {
                patch.descripcion = valid.descripcion?.trim() || '';
            }
            if (Number(valid.cuposTotales) !== room.maxPlayers) {
                patch.cuposTotales = Number(valid.cuposTotales);
            }
            if (Boolean(valid.permiteSuplentes) !== raw.permiteSuplentes) {
                patch.permiteSuplentes = Boolean(valid.permiteSuplentes);
            }
            if (Boolean(valid.esPublica) !== raw.esPublica) {
                patch.esPublica = Boolean(valid.esPublica);
            }

            if (!isTimeLocked) {
                if (valid.nombreCancha !== raw.nombreCancha) {
                    patch.nombreCancha = valid.nombreCancha.trim();
                }
                if (valid.direccion !== raw.direccion) {
                    patch.direccion = valid.direccion.trim();
                }
                if (valid.fecha !== room.date || valid.hora !== room.time) {
                    patch.fechaHoraPartido = createIsoFromLocal(valid.fecha, valid.hora);
                }
                if (
                    formData.ubicacion &&
                    (formData.ubicacion.x !== raw.ubicacion?.x ||
                        formData.ubicacion.y !== raw.ubicacion?.y)
                ) {
                    patch.ubicacion = formData.ubicacion;
                }
            }

            if (Object.keys(patch).length === 0) {
                setApiError('No has realizado ningún cambio.');
                return;
            }

            setSubmitting(true);
            await matchService.updateRoom(id, patch);
            router.replace(`/salas/${id}`);
        } catch (err: any) {
            if (err instanceof yup.ValidationError) {
                const fieldErrs: Record<string, string> = {};
                err.inner.forEach((e) => {
                    if (e.path && !fieldErrs[e.path]) fieldErrs[e.path] = e.message;
                });
                setErrors(fieldErrs);
            } else {
                setApiError(err.message || 'Error al guardar los cambios.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ScreenContainer>
            <ErrorMessage message={apiError} />
            <SectionCard title="Editar Sala">
                <Input
                    label="Nombre de la sala"
                    value={formData.nombre}
                    onChangeText={(v) => handleChange('nombre', v)}
                    error={errors.nombre}
                />
                <Input
                    label="Nombre de la cancha"
                    editable={!isTimeLocked}
                    value={formData.nombreCancha}
                    onChangeText={(v) => handleChange('nombreCancha', v)}
                    error={errors.nombreCancha}
                />
                <Input
                    label="Dirección"
                    editable={!isTimeLocked}
                    value={formData.direccion}
                    onChangeText={(v) => handleChange('direccion', v)}
                    error={errors.direccion}
                />
                <DateTimeField
                    label="Fecha"
                    mode="date"
                    disabled={isTimeLocked}
                    value={formData.fecha}
                    onChange={(v) => handleChange('fecha', v)}
                    error={errors.fecha}
                />
                <DateTimeField
                    label="Hora"
                    mode="time"
                    disabled={isTimeLocked}
                    value={formData.hora}
                    onChange={(v) => handleChange('hora', v)}
                    error={errors.hora}
                />
                <Input
                    label="Cupos totales"
                    keyboardType="numeric"
                    value={String(formData.cuposTotales)}
                    onChangeText={(v) => handleChange('cuposTotales', v)}
                    error={errors.cuposTotales}
                />
                <Textarea
                    label="Descripción"
                    value={formData.descripcion}
                    onChangeText={(v) => handleChange('descripcion', v)}
                    maxLength={200}
                    currentLength={formData.descripcion.length}
                />
                <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>Sala Pública</Text>
                    <Switch
                        value={formData.esPublica}
                        onValueChange={(v) => handleChange('esPublica', v)}
                    />
                </View>
                <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>Permitir Suplentes</Text>
                    <Switch
                        value={formData.permiteSuplentes}
                        onValueChange={(v) => handleChange('permiteSuplentes', v)}
                    />
                </View>

                <LocationPickerMap
                    value={formData.ubicacion}
                    onChange={(coords) => handleChange('ubicacion', coords)}
                    readOnly={isTimeLocked}
                />
            </SectionCard>

            <Button title="Guardar Cambios" onPress={handleSave} loading={submitting} />
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
    switchLabel: { color: THEME.colors.text, fontSize: 15 },
});