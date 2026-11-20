import { axiosInstance } from '@/api/axiosInstance';
import { THEME } from '@/config/theme';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { NOTIFICATION_API_ENDPOINTS } from '@/features/notifications/constants/notification.constants';
import { extractNotificationIdFromResponse, extractSalaIdFromNotification, registerDevicePushToken } from '@/features/notifications/services/pushTokenService';
import * as Notifications from 'expo-notifications';
import { Redirect, Stack, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';

export default function AppGuardLayout() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const router = useRouter();
    const ultimaRespuestaProcesadaRef = useRef<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) return;

        void registerDevicePushToken();

        const procesarToqueNotificacion = async (response: Notifications.NotificationResponse | null) => {
            if (!response) return;

            const identificador = response.notification.request.identifier;
            if (ultimaRespuestaProcesadaRef.current === identificador) return;
            ultimaRespuestaProcesadaRef.current = identificador;

            const notificationId = extractNotificationIdFromResponse(response);
            if (notificationId) {
                try {
                    await axiosInstance.patch(NOTIFICATION_API_ENDPOINTS.markAsRead(notificationId));
                } catch {
                    // Silencioso si ya estaba leída o sin red
                }
            }

            const salaId = extractSalaIdFromNotification(response);
            if (salaId) {
                router.push({ pathname: '/(app)/salas/[id]', params: { id: salaId } });
            }
        };

        const revisarUltimaNotificacion = async () => {
            const lastResponse = await Notifications.getLastNotificationResponseAsync();
            if (lastResponse) {
                await procesarToqueNotificacion(lastResponse);
            }
        };

        void revisarUltimaNotificacion();

        const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
            void procesarToqueNotificacion(response);
        });

        return () => {
            subscription.remove();
        };
    }, [isAuthenticated, router]);

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