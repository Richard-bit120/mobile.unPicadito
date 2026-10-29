export interface RawSalaSearchItem {
    id: string;
    nombre: string;
    descripcion?: string;
    nombreCancha?: string;
    direccion?: string;
    fechaHoraPartido: string;
    cuposTotales: number;
    cuposOcupados?: number;
    unidoPorUsuarioActual?: number;
    permiteSuplentes: boolean;
    cuposSuplentesMax?: number;
    esPublica: boolean;
    estado: 'ABIERTA' | 'COMPLETA' | 'CANCELADA' | 'FINALIZADA';
    creador?: {
        id: number;
        nombre: string;
        apellido?: string;
        nombreUsuario?: string;
    };
    cancha?: {
        id: number;
        nombre: string;
        tipo: string;
        predio?: {
            id: number;
            nombre: string;
            direccion: string;
            localidad: string;
            ubicacion?: string | { x: number; y: number };
        };
    };
    ubicacion?: { x: number; y: number } | string;
    distanciaKm?: number;
}

export interface CreateSalaPayload {
    canchaId: number;
    nombre: string;
    descripcion?: string;
    nombreCancha?: string;
    direccion?: string;
    fechaHoraPartido: string;
    cuposTotales?: number;
    permiteSuplentes?: boolean;
    cuposSuplentesMax?: number;
    esPublica?: boolean;
    ubicacion?: { x: number; y: number };
}

export interface MatchFilters {
    search?: string;
    date?: string;
    time?: string;
    onlyAvailable?: boolean;
    nombreCancha?: string;
    esPublica?: string | boolean;
    permiteSuplentes?: string | boolean;
    lat?: number;
    lng?: number;
    radioKm?: number;
}

export interface MappedParticipant {
    participationId: string;
    id: number;
    userId: number;
    role: string;
    isOrganizer: boolean;
    status: 'PENDING' | 'INACTIVE' | 'SUBSTITUTE' | 'CONFIRMED';
    username?: string;
    firstName?: string;
    lastName?: string;
    profilePictureUrl?: string;
    mainPosition?: string;
    reputation?: number;
}

export interface MappedRoom {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    pitchName?: string;
    venueName?: string;
    maxPlayers: number;
    creatorId: number | null;
    organizerId: number | null;
    status: string;
    isPublic: boolean;
    privacy: string;
    allowsSubstitutes: boolean;
    maxSubstitutes: number;
    participants: MappedParticipant[];
    raw: any;
}
