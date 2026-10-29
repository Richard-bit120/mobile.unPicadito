import { ENV } from '@/config/env';
import { LocalidadOpcion, OTRAS_LOCALIDADES, TIPO_UBICACION_FILTRO } from '@/constants/location.constants';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

export interface UserLocationState {
    lat: number;
    lng: number;
    nombre: string;
    tipo: typeof TIPO_UBICACION_FILTRO[keyof typeof TIPO_UBICACION_FILTRO];
}

const DEFAULT_FALLBACK: UserLocationState = {
    lat: ENV.DEFAULT_COORDINATES.latitude,
    lng: ENV.DEFAULT_COORDINATES.longitude,
    nombre: 'Posadas (Centro)',
    tipo: TIPO_UBICACION_FILTRO.OTRAS_OPCIONES,
};

export const useUserLocation = (initialCoords?: { lat?: number; lng?: number }) => {
    const [location, setLocation] = useState<UserLocationState>(() => {
        if (initialCoords?.lat !== undefined && initialCoords?.lng !== undefined) {
            return {
                lat: initialCoords.lat,
                lng: initialCoords.lng,
                nombre: 'Ubicación seleccionada',
                tipo: TIPO_UBICACION_FILTRO.OTRAS_OPCIONES,
            };
        }
        return {
            lat: DEFAULT_FALLBACK.lat,
            lng: DEFAULT_FALLBACK.lng,
            nombre: 'Detectando GPS...',
            tipo: TIPO_UBICACION_FILTRO.MI_UBICACION,
        };
    });

    const [isLoadingGps, setIsLoadingGps] = useState(true);

    const solicitarGps = async (
        onSuccess?: (loc: UserLocationState) => void,
        onError?: (msg: string) => void
    ) => {
        setIsLoadingGps(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setIsLoadingGps(false);
                const msg = 'Permiso de ubicación denegado. Puedes elegir una localidad manual.';
                if (onError) onError(msg);
                return;
            }

            const current = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            const nueva: UserLocationState = {
                lat: current.coords.latitude,
                lng: current.coords.longitude,
                nombre: 'Mi ubicación real (GPS)',
                tipo: TIPO_UBICACION_FILTRO.MI_UBICACION,
            };

            setLocation(nueva);
            setIsLoadingGps(false);
            if (onSuccess) onSuccess(nueva);
        } catch {
            setIsLoadingGps(false);
            const msg = 'No pudimos obtener tu señal GPS. Seleccionando Posadas por defecto.';
            setLocation(DEFAULT_FALLBACK);
            if (onError) onError(msg);
        }
    };

    useEffect(() => {
        if (initialCoords?.lat !== undefined && initialCoords?.lng !== undefined) {
            setIsLoadingGps(false);
            return;
        }

        solicitarGps();
    }, [initialCoords?.lat, initialCoords?.lng]);

    const seleccionarLocalidad = (loc: LocalidadOpcion) => {
        const nueva: UserLocationState = {
            lat: loc.lat,
            lng: loc.lng,
            nombre: `${loc.nombre} (${loc.provincia})`,
            tipo: TIPO_UBICACION_FILTRO.OTRAS_OPCIONES,
        };
        setLocation(nueva);
        return nueva;
    };

    return {
        location,
        isLoadingGps,
        solicitarGps,
        seleccionarLocalidad,
    };
};
