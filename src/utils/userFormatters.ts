export interface PlayerIdentity {
    nombre?: string | null;
    apellido?: string | null;
    nombreUsuario?: string | null;
}

export const cleanLastName = (apellido?: string | null): string => {
    if (!apellido) return '';
    const trimmed = apellido.trim();
    return trimmed.toLowerCase() === 'sin apellido' ? '' : trimmed;
};

export const formatPlayerFullName = (
    player?: PlayerIdentity | null,
    fallback = 'Jugador'
): string => {
    if (!player) return fallback;
    const fullName = [player.nombre?.trim(), cleanLastName(player.apellido)]
        .filter(Boolean)
        .join(' ');
    if (fullName) return fullName;
    if (player.nombreUsuario?.trim()) return `@${player.nombreUsuario.trim()}`;
    return fallback;
};

export const getUserInitial = (name?: string | null, fallback = 'U'): string => {
    const trimmed = name?.trim();
    return (trimmed?.[0] || fallback).toUpperCase();
};

export const formatReputationLabel = (
    reputacion?: number | string | null,
    reviewsCount?: number
): string => {
    if (reviewsCount === 0) return 'Sin calificaciones';
    if (reputacion === null || reputacion === undefined || reputacion === '') {
        return 'Sin calificaciones';
    }
    const numeric = Number(reputacion);
    if (!Number.isFinite(numeric) || numeric <= 0) {
        return 'Sin calificaciones';
    }
    return numeric.toFixed(2);
};

export const sortReviewsByNewest = <T extends { creadoEn?: string | null }>(
    reviews?: T[] | null
): T[] => {
    if (!Array.isArray(reviews)) return [];
    return [...reviews].sort(
        (a, b) =>
            new Date(b.creadoEn || 0).getTime() - new Date(a.creadoEn || 0).getTime()
    );
};

