export interface ReviewerSummary {
    id: number;
    nombre: string;
    apellido?: string | null;
    nombreUsuario?: string | null;
    fotoPerfilUrl?: string | null;
}

export interface UserReviewItem {
    id: string;
    estrellas: number;
    comentario?: string | null;
    creadoEn?: string | null;
    calificador?: ReviewerSummary | null;
}

