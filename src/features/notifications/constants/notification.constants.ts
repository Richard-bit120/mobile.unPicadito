export const NOTIFICATION_API_ENDPOINTS = {
    BASE: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
    READ_ALL: '/notifications/read-all',
    PREFERENCES: '/notifications/preferences',
    DEVICES: '/notifications/devices',
    markAsRead: (id: string) => `/notifications/${id}/read`,
} as const;

export const PUSH_CONFIG = {
    ANDROID_CHANNEL_ID: 'partidos-unpicadito',
    ANDROID_CHANNEL_NAME: 'Partidos y Salas',
    STORAGE_TOKEN_KEY: 'unpicadito_push_token',
    VIBRATION_PATTERN: [0, 250, 250, 250],
} as const;

export const DEVICE_PLATFORMS = {
    ANDROID: 'ANDROID',
    IOS: 'IOS',
} as const;
