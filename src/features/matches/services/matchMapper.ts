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

export const mapRoomFromApi = (rawRoom: any): MappedRoom | null => {
    if (!rawRoom) return null;

    const local = getLocalPart(rawRoom.fechaHoraPartido);
    const participants: MappedParticipant[] = (rawRoom.participantes || []).map(mapParticipant);
    const organizer = participants.find((p) => p.isOrganizer);

    return {
        id: rawRoom.id,
        title: rawRoom.nombre || '',
        description: rawRoom.descripcion || '',
        date: local.date,
        time: local.time,
        location: rawRoom.direccion || rawRoom.nombreCancha || '',
        maxPlayers: rawRoom.cuposTotales || 0,
        creatorId: rawRoom.creador?.id ?? rawRoom.creadorId ?? null,
        organizerId: organizer?.userId ?? null,
        status: rawRoom.estado || 'ABIERTA',
        isPublic: Boolean(rawRoom.esPublica),
        privacy: rawRoom.esPublica ? 'Pública' : 'Privada',
        allowsSubstitutes: Boolean(rawRoom.permiteSuplentes),
        maxSubstitutes: rawRoom.cuposSuplentesMax ?? 0,
        participants,
        raw: rawRoom,
    };
};