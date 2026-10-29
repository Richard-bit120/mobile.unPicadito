import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SectionCard } from '@/components/ui/SectionCard';
import { THEME } from '@/config/theme';
import { registerSchema } from '@/features/auth/schemas/authSchema';
import { authService } from '@/features/auth/services/authService';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as yup from 'yup';

export default function RegisterScreen() {
    const router = useRouter();
    const setAuth = useAuthStore((s) => s.setAuth);

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [apiError, setApiError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const updateField = (key: string, value: string) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: '' }));
    };

    const handleRegister = async () => {
        setErrors({});
        setApiError(null);
        setLoading(true);

        try {
            const valid = await registerSchema.validate(formData, { abortEarly: false });
            const res = await authService.register({
                nombre: valid.nombre,
                apellido: valid.apellido,
                nombreUsuario: valid.username,
                email: valid.email,
                password: valid.password,
                passwordConfirm: valid.confirmPassword,
            });

            const user = res.user ?? res.data?.user ?? res;
            const token = res.token ?? res.data?.token;
            const refreshToken = res.refreshToken ?? res.data?.refreshToken ?? null;

            if (token) {
                setAuth(token, user, refreshToken);
                router.replace('/(app)/(tabs)');
            } else {
                router.replace('/(auth)/login');
            }
        } catch (err: any) {
            if (err instanceof yup.ValidationError) {
                const fieldErrors: Record<string, string> = {};
                err.inner.forEach((e) => {
                    if (e.path && !fieldErrors[e.path]) fieldErrors[e.path] = e.message;
                });
                setErrors(fieldErrors);
            } else {
                setApiError(err.message || 'No se pudo completar el registro');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenContainer>
            <View style={styles.brandHeader}>
                <Text style={styles.brandTitle}>Crear Cuenta</Text>
                <Text style={styles.brandSubtitle}>Únete a la comunidad de unPicadito</Text>
            </View>

            <SectionCard>
                <ErrorMessage message={apiError} />
                <Input
                    label="Nombre"
                    placeholder="Juan"
                    value={formData.nombre}
                    onChangeText={(v) => updateField('nombre', v)}
                    error={errors.nombre}
                />
                <Input
                    label="Apellido"
                    placeholder="Pérez"
                    value={formData.apellido}
                    onChangeText={(v) => updateField('apellido', v)}
                    error={errors.apellido}
                />
                <Input
                    label="Nombre de usuario"
                    placeholder="juanperez10"
                    autoCapitalize="none"
                    value={formData.username}
                    onChangeText={(v) => updateField('username', v)}
                    error={errors.username}
                />
                <Input
                    label="Correo electrónico"
                    placeholder="tu@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={formData.email}
                    onChangeText={(v) => updateField('email', v)}
                    error={errors.email}
                />
                <Input
                    label="Contraseña"
                    placeholder="Al menos 6 caracteres (letras y números)"
                    secureTextEntry
                    value={formData.password}
                    onChangeText={(v) => updateField('password', v)}
                    error={errors.password}
                />
                <Input
                    label="Confirmar contraseña"
                    placeholder="Repite tu contraseña"
                    secureTextEntry
                    value={formData.confirmPassword}
                    onChangeText={(v) => updateField('confirmPassword', v)}
                    error={errors.confirmPassword}
                />

                <Button title="Registrarse" onPress={handleRegister} loading={loading} />

                <View style={styles.footerRow}>
                    <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
                    <Link href="/(auth)/login" style={styles.link}>
                        Inicia Sesión
                    </Link>
                </View>
            </SectionCard>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    brandHeader: { alignItems: 'center', marginVertical: THEME.spacing.md },
    brandTitle: { fontSize: 24, fontWeight: '800', color: THEME.colors.primary },
    brandSubtitle: { fontSize: 14, color: THEME.colors.textSecondary, marginTop: 4 },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: THEME.spacing.md,
    },
    footerText: { color: THEME.colors.textSecondary, fontSize: 14 },
    link: { color: THEME.colors.primary, fontWeight: '600', fontSize: 14 },
});