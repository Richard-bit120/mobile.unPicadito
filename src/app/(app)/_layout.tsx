import { THEME } from '@/config/theme';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { Redirect, Stack } from 'expo-router';

export default function AppGuardLayout() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    if (!isAuthenticated) {
        return <Redirect href="/(auth)/login" />;
    }

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: THEME.colors.background },
            }}
        >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
                name="salas/[id]"
                options={{
                    headerShown: true,
                    title: 'Detalle del Partido',
                    headerStyle: { backgroundColor: THEME.colors.surface },
                    headerTintColor: THEME.colors.text,
                }}
            />
            <Stack.Screen
                name="salas/[id]/editar"
                options={{
                    headerShown: true,
                    title: 'Editar Sala',
                    headerStyle: { backgroundColor: THEME.colors.surface },
                    headerTintColor: THEME.colors.text,
                }}
            />
            <Stack.Screen
                name="perfil/editar"
                options={{
                    headerShown: true,
                    title: 'Editar Perfil',
                    headerStyle: { backgroundColor: THEME.colors.surface },
                    headerTintColor: THEME.colors.text,
                }}
            />
            <Stack.Screen
                name="usuarios/[id]"
                options={{
                    headerShown: true,
                    title: 'Perfil del Jugador',
                    headerStyle: { backgroundColor: THEME.colors.surface },
                    headerTintColor: THEME.colors.text,
                }}
            />
        </Stack>
    );
}