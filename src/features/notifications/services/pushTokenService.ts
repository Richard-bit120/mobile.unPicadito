import { axiosInstance } from '@/api/axiosInstance';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { DEVICE_PLATFORMS, NOTIFICATION_API_ENDPOINTS, PUSH_CONFIG } from '../constants/notification.constants';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

const obtenerProjectId = () => {
    const extraEas = (Constants.expoConfig?.extra as any)?.eas?.projectId;
    const easConfig = (Constants as any).easConfig?.projectId;
    return extraEas || easConfig || undefined;
};

export const registerDevicePushToken = async () => {
    try {
        if (Platform.OS === 'web' || !Device.isDevice) {
            return null;
        }

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync(PUSH_CONFIG.ANDROID_CHANNEL_ID, {
                name: PUSH_CONFIG.ANDROID_CHANNEL_NAME,
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [...PUSH_CONFIG.VIBRATION_PATTERN],
            });
        }

        const permisosActuales = await Notifications.getPermissionsAsync();
        let estadoPermiso = permisosActuales.status;

        if (estadoPermiso !== 'granted') {
            const solicitud = await Notifications.requestPermissionsAsync();
            estadoPermiso = solicitud.status;
        }

        if (estadoPermiso !== 'granted') {
            return null;
        }

        const projectId = obtenerProjectId();
        const tokenResponse = await Notifications.getExpoPushTokenAsync(
            projectId ? { projectId } : undefined
        );
        const expoPushToken = tokenResponse?.data;
        if (!expoPushToken) return null;

        const platform = Platform.OS === 'ios' ? DEVICE_PLATFORMS.IOS : DEVICE_PLATFORMS.ANDROID;
        const deviceName = Device.modelName || Device.deviceName || undefined;

        await axiosInstance.post(NOTIFICATION_API_ENDPOINTS.DEVICES, {
            expoPushToken,
            platform,
            deviceName,
        });

        await SecureStore.setItemAsync(PUSH_CONFIG.STORAGE_TOKEN_KEY, expoPushToken);
        return expoPushToken;
    } catch {
        // Si se ejecuta en Expo Go sin projectId o sin red, la app continúa operando con normalidad
        return null;
    }
};

export const unregisterDevicePushToken = async () => {
    try {
        if (Platform.OS === 'web') return;

        const savedToken = await SecureStore.getItemAsync(PUSH_CONFIG.STORAGE_TOKEN_KEY);
        if (!savedToken) return;

        await axiosInstance.delete(NOTIFICATION_API_ENDPOINTS.DEVICES, {
            data: { expoPushToken: savedToken },
        });
    } catch {
        // Ignoramos errores de red durante el logout para no bloquear la salida del usuario
    } finally {
        try {
            if (Platform.OS !== 'web') {
                await SecureStore.deleteItemAsync(PUSH_CONFIG.STORAGE_TOKEN_KEY);
            }
        } catch {
            // Silencioso
        }
    }
};

export const extractSalaIdFromNotification = (response: Notifications.NotificationResponse | null) => {
    const data: any = response?.notification?.request?.content?.data;
    if (!data) return null;

    if (data.salaId) {
        return String(data.salaId);
    }

    if (typeof data.deepLink === 'string' && data.deepLink.startsWith('/salas/')) {
        return data.deepLink.replace('/salas/', '').split('/')[0] || null;
    }

    return null;
};

export const extractNotificationIdFromResponse = (response: Notifications.NotificationResponse | null) => {
    const data: any = response?.notification?.request?.content?.data;
    return data?.notificationId ? String(data.notificationId) : null;
};
