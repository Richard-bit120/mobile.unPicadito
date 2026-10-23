import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SectionCard } from '@/components/ui/SectionCard';
import { THEME } from '@/config/theme';
import { loginSchema } from '@/features/auth/schemas/authSchema';
import { authService } from '@/features/auth/services/authService';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as yup from 'yup';

export default function LoginScreen() {
    const router = useRouter();
    const setAuth = useAuthStore((s) => s.setAuth);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [apiError, setApiError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setErrors({});
        setApiError(null);
        setLoading(true);

        try {
            const valid = await loginSchema.validate({ email, password }, { abortEarly: false });
            const res = await authService.login(valid);

            const user = res.user ?? res.data?.user ?? res;
            const token = res.token ?? res.data?.token;
            const refreshToken = res.refreshToken ?? res.data?.refreshToken ?? null;

            setAuth(token, user, refreshToken);
            router.replace('/(app)/(tabs)');
        } catch (err: any) {
            if (err instanceof yup.ValidationError) {
                const fieldErrors: Record<string, string> = {};
                err.inner.forEach((e) => {
                    if (e.path && !fieldErrors[e.path]) fieldErrors[e.path] = e.message;
                });
                setErrors(fieldErrors);
            } else {
                setApiError(err.message || 'Error al iniciar sesión');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenContainer style={styles.centered}>
            <View style={styles.brandHeader}>
                <Text style={styles.brandTitle}>unPicadito ⚽</Text>
                <Text style={styles.brandSubtitle}>Inicia sesión para sumarte a un partido</Text>
            </View>

            <SectionCard>
                <ErrorMessage message={apiError} />
                <Input
                    label="Correo electrónico"
                    placeholder="tu@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    error={errors.email}
                />
                <Input
                    label="Contraseña"
                    placeholder="••••••••"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    error={errors.password}
                />
                <Button title="Iniciar Sesión" onPress={handleLogin} loading={loading} />

                <View style={styles.footerRow}>
                    <Text style={styles.footerText}>¿No tienes cuenta? </Text>
                    <Link href="/(auth)/register" style={styles.link}>
                        Regístrate
                    </Link>
                </View>
            </SectionCard>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    centered: { justifyContent: 'center' },
    brandHeader: { alignItems: 'center', marginBottom: THEME.spacing.lg },
    brandTitle: { fontSize: 28, fontWeight: '800', color: THEME.colors.primary },
    brandSubtitle: { fontSize: 14, color: THEME.colors.textSecondary, marginTop: 4 },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: THEME.spacing.md,
    },
    footerText: { color: THEME.colors.textSecondary, fontSize: 14 },
    link: { color: THEME.colors.primary, fontWeight: '600', fontSize: 14 },
});