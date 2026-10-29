import { ENV } from '@/config/env';

export const ROOM_STATUS = {
    ABIERTA: 'ABIERTA',
    COMPLETA: 'COMPLETA',
    CANCELADA: 'CANCELADA',
    FINALIZADA: 'FINALIZADA',
} as const;

export const PARTICIPANT_ROLES = {
    ORGANIZADOR: 'ORGANIZADOR',
    TITULAR: 'TITULAR',
    SUPLENTE: 'SUPLENTE',
    SOLICITANTE: 'SOLICITANTE',
} as const;

export const PARTICIPANT_STATUS = {
    PENDIENTE: 'PENDIENTE',
    CONFIRMADO: 'CONFIRMADO',
    RECHAZADO: 'RECHAZADO',
    BAJA: 'BAJA',
    EXPULSADO: 'EXPULSADO',
} as const;

export const CANCEL_ROOM_RULES = {
    MIN_REASON_LENGTH: 10,
    MAX_REASON_LENGTH: 500,
    LOCK_WINDOW_HOURS: 24,
} as const;

export const FINALIZE_ROOM_RULES = {
    MINUTES_AFTER_START: 30,
} as const

export const INITIAL_ROOM_FORM_VALUES = {
    nombre: '',
    nombreCancha: '',
    direccion: '',
    fecha: '',
    hora: '',
    cuposTotales: 10,
    permiteSuplentes: true,
    esPublica: true,
    descripcion: '',
    ubicacion: {
        x: ENV.DEFAULT_COORDINATES.longitude,
        y: ENV.DEFAULT_COORDINATES.latitude,
    },
};