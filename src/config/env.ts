import { Platform } from 'react-native';

const getLocalHost = (): string => {
    if (Platform.OS === 'android') {
        return 'http://10.0.2.2:8080/api';
    }
    return 'http://localhost:8080/api';
};

export const ENV = {
    API_URL: process.env.EXPO_PUBLIC_API_URL || getLocalHost(),
    DEFAULT_MAP_DELTA: {
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    },
    DEFAULT_COORDINATES: {
        latitude: -27.3621,
        longitude: -55.9009,
    },
};