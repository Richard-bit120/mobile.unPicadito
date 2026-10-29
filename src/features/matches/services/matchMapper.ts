import { MappedParticipant, MappedRoom } from '../types/match.types';
import { getLocalPart } from '../utils/dateUtils';

const mapParticipantStatus = (p: any): MappedParticipant['status'] => {
    if (p.estado === 'PENDIENTE') return 'PENDING';
    if (p.estado !== 'CONFIRMADO') return 'INACTIVE';
    return p.rol === 'SUPLENTE' ? 'SUBSTITUTE' : 'CONFIRMED';
};

const mapParticipant = (p: any): MappedParticipant => ({
    ...p,
    participationId: p.id,
    id: p.usuario?.id,
    userId: p.usuario?.id,
    role: p.rol,
    isOrganizer: p.rol === 'ORGANIZADOR' && p.estado === 'CONFIRMADO',
    status: mapParticipantStatus(p),
    username: p.usuario?.nombreUsuario,
    firstName: p.usuario?.nombre,
    lastName: p.usuario?.apellido,
    profilePictureUrl: p.usuario?.fotoPerfilUrl,
    mainPosition: p.usuario?.posicionPrincipal,
    reputation: p.usuario?.reputacion,
});

export const parseLocationCoords = (ubicacion: any): { x: number; y: number } | null => {
    if (!ubicacion) return null;
    if (typeof ubicacion === 'object') {
        const x = Number(ubicacion.x ?? ubicacion.lng ?? ubicacion.longitude);
        const y = Number(ubicacion.y ?? ubicacion.lat ?? ubicacion.latitude);
        if (!isNaN(x) && !isNaN(y)) return { x, y };
    }
    if (typeof ubicacion === 'string') {
        const match = ubicacion.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
        if (match) {
            const lng = Number(match[1]);
            const lat = Number(match[2]);
            if (!isNaN(lng) && !isNaN(lat)) return { x: lng, y: lat };
        }
    }
    return null;
};

export const mapRoomFromApi = (rawRoom: any): MappedRoom | null => {
    if (!rawRoom) return null;

    const local = getLocalPart(rawRoom.fechaHoraPartido);
    const participants: MappedParticipant[] = (rawRoom.participantes || []).map(mapParticipant);
    const organizer = participants.find((p) => p.isOrganizer);

    const venueName = rawRoom.cancha?.predio?.nombre || '';
    const pitchName = rawRoom.cancha?.nombre || rawRoom.nombreCancha || '';
    const venueAddress = rawRoom.cancha?.predio?.direccion || rawRoom.direccion || '';
    const locality = rawRoom.cancha?.predio?.localidad || '';

    let locationLabel = '';
    if (venueName && pitchName) {
        locationLabel = `${venueName} (${pitchName})`;
    } else {
        locationLabel = venueName || pitchName || venueAddress || 'Cancha a confirmar';
    }

    if (venueAddress && !locationLabel.includes(venueAddress)) {
        locationLabel += ` - ${venueAddress}`;
    }
    if (locality && !locationLabel.includes(locality)) {
        locationLabel += `, ${locality}`;
    }

    const parsedCoords = parseLocationCoords(rawRoom.ubicacion) ||
        parseLocationCoords(rawRoom.cancha?.predio?.ubicacion);

    return {
        id: rawRoom.id,
        title: rawRoom.nombre || '',
        description: rawRoom.descripcion || '',
        date: local.date,
        time: local.time,
        location: locationLabel,
        pitchName,
        venueName,
        maxPlayers: rawRoom.cuposTotales || 0,
        creatorId: rawRoom.creador?.id ?? rawRoom.creadorId ?? null,
        organizerId: organizer?.userId ?? null,
        status: rawRoom.estado || 'ABIERTA',
        isPublic: Boolean(rawRoom.esPublica),
        privacy: rawRoom.esPublica ? 'Pública' : 'Privada',
        allowsSubstitutes: Boolean(rawRoom.permiteSuplentes),
        maxSubstitutes: rawRoom.cuposSuplentesMax ?? 0,
        participants,
        raw: {
            ...rawRoom,
            ubicacion: parsedCoords || rawRoom.ubicacion,
            nombreCancha: pitchName,
            direccion: venueAddress,
        },
    };
};
