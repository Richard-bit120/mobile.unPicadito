import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SectionCard } from '@/components/ui/SectionCard';
import { SelectModal } from '@/components/ui/SelectModal';
import { THEME } from '@/config/theme';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { PLAYER_POSITIONS } from '@/features/profile/constants/profile.constants';
import { profileService } from '@/features/profile/services/profileService';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

export default function EditProfileScreen() {
    const router = useRouter();
    const setUser = useAuthStore((s) => s.setUser);
    const currentUser = useAuthStore((s) => s.user);

    const [formData, setFormData] = useState({
        nombreUsuario: '',
        nombre: '',
        apellido: '',
        apodo: '',
        fotoPerfilUrl: '',
        posicionPrincipal: 'POLIFUNCIONAL',
        currentPassword: '',
        password: '',
        passwordConfirm: '',
    });
    const [changePassword, setChangePassword] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        profileService
            .getMyProfile()
            .then((user) => {
                setFormData((prev) => ({
                    ...prev,
                    nombreUsuario: user.nombreUsuario ?? '',
                    nombre: user.nombre ?? '',
                    apellido: user.apellido ?? '',
                    apodo: user.apodo ?? '',
                    fotoPerfilUrl: user.fotoPerfilUrl ?? '',
                    posicionPrincipal: user.posicionPrincipal ?? 'POLIFUNCIONAL',
                }));
            })
            .catch((err: any) => setError(err.message || 'No se pudo cargar el perfil.'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <LoadingSpinner label="Cargando tus datos..." />;

    const updateField = (key: string, value: string) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
        setError(null);
    };

    const handleSave = async () => {
        setError(null);

        if (changePassword) {
            if (
                !formData.currentPassword ||
                !formData.password ||
                !formData.passwordConfirm
            ) {
                setError('Completa la contraseña actual, la nueva y su confirmación.');
                return;
            }
            if (formData.password.length < 6) {
                setError('La nueva contraseña debe tener al menos 6 caracteres.');
                return;
            }
            if (formData.password !== formData.passwordConfirm) {
                setError('La nueva contraseña y su confirmación no coinciden.');
                return;
            }
        }

        const payload: Record<string, any> = {
            nombreUsuario: formData.nombreUsuario.trim(),
            nombre: formData.nombre.trim(),
            apellido: formData.apellido.trim(),
            apodo: formData.apodo.trim(),
            fotoPerfilUrl: formData.fotoPerfilUrl.trim() || null,
            posicionPrincipal: formData.posicionPrincipal,
        };

        if (changePassword) {
            payload.currentPassword = formData.currentPassword;
            payload.password = formData.password;
            payload.passwordConfirm = formData.passwordConfirm;
        }

        setSaving(true);
        try {
            const res = await profileService.updateMyProfile(payload);
            const updatedUser = res.user ?? res.data ?? res;
            if (currentUser) {
                setUser({ ...currentUser, ...payload, ...updatedUser });
            }
            router.back();
        } catch (err: any) {
            setError(err.message || 'No se pudo actualizar el perfil.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <ScreenContainer>
            <ErrorMessage message={error} />

            <SectionCard title="Datos Personales">
                <Input
                    label="Nombre de usuario"
                    value={formData.nombreUsuario}
                    onChangeText={(v) => updateField('nombreUsuario', v)}
                    autoCapitalize="none"
                />
                <Input
                    label="Nombre"
                    value={formData.nombre}
                    onChangeText={(v) => updateField('nombre', v)}
                />
                <Input
                    label="Apellido"
                    value={formData.apellido}
                    onChangeText={(v) => updateField('apellido', v)}
                />
                <Input
                    label="Apodo (opcional)"
                    placeholder="Ej: El Diez"
                    value={formData.apodo}
                    onChangeText={(v) => updateField('apodo', v)}
                />
                <SelectModal
                    label="Posición principal en cancha"
                    value={formData.posicionPrincipal}
                    options={PLAYER_POSITIONS}
                    onChange={(v) => updateField('posicionPrincipal', v)}
                />
                <Input
                    label="URL de foto de perfil (opcional)"
                    placeholder="https://..."
                    value={formData.fotoPerfilUrl}
                    onChangeText={(v) => updateField('fotoPerfilUrl', v)}
                    autoCapitalize="none"
                />
            </SectionCard>

            <SectionCard title="Seguridad">
                <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>Cambiar contraseña</Text>
                    <Switch
                        value={changePassword}
                        onValueChange={(v) => {
                            setChangePassword(v);
                            setError(null);
                        }}
                        trackColor={{
                            false: THEME.colors.surfaceBorder,
                            true: THEME.colors.primary,
                        }}
                    />
                </View>

                {changePassword && (
                    <>
                        <Input
                            label="Contraseña actual"
                            secureTextEntry
                            value={formData.currentPassword}
                            onChangeText={(v) => updateField('currentPassword', v)}
                        />
                        <Input
                            label="Nueva contraseña"
                            secureTextEntry
                            value={formData.password}
                            onChangeText={(v) => updateField('password', v)}
                        />
                        <Input
                            label="Confirmar nueva contraseña"
                            secureTextEntry
                            value={formData.passwordConfirm}
                            onChangeText={(v) => updateField('passwordConfirm', v)}
                        />
                    </>
                )}
            </SectionCard>

            <Button
                title="Guardar Cambios"
                onPress={handleSave}
                loading={saving}
                style={{ marginBottom: THEME.spacing.sm }}
            />
            <Button
                title="Cancelar"
                variant="secondary"
                onPress={() => router.back()}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: THEME.spacing.sm,
    },
    switchLabel: {
        color: THEME.colors.text,
        fontSize: 15,
    },
});
