import { REVIEW_RULES } from '@/constants/match.constants';
import { formatPlayerFullName } from '@/utils/userFormatters';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { matchService } from '../services/matchService';
import { PendienteCalificar } from '../types/match.types';

export const usePostMatchRating = (roomId: string) => {
    const [pendientes, setPendientes] = useState<PendienteCalificar[]>([]);
    const [loadedRoomId, setLoadedRoomId] = useState<string | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [stars, setStars] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const submittingRef = useRef(false);
    const latestRoomIdRef = useRef(roomId);
    const prevRoomIdRef = useRef(roomId);
    const isMountedRef = useRef(true);

    latestRoomIdRef.current = roomId;

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (prevRoomIdRef.current !== roomId) {
            prevRoomIdRef.current = roomId;
            setPendientes([]);
            setLoadError(null);
            setSelectedId(null);
            setStars(0);
            setComment('');
            setSubmitError(null);
            setSuccessMessage(null);
        }
    }, [roomId]);

    const loading = Boolean(roomId) && loadedRoomId !== roomId;

    const loadPendientes = useCallback(async () => {
        if (!roomId) return;
        const targetRoomId = roomId;
        try {
            const data = await matchService.getPendientesCalificar(targetRoomId);
            if (!isMountedRef.current || latestRoomIdRef.current !== targetRoomId) return;
            setPendientes(Array.isArray(data) ? data : []);
            setLoadError(null);
        } catch (err: any) {
            if (!isMountedRef.current || latestRoomIdRef.current !== targetRoomId) return;
            setLoadError(err.message || 'No se pudo cargar la lista de jugadores.');
        } finally {
            if (isMountedRef.current && latestRoomIdRef.current === targetRoomId) {
                setLoadedRoomId(targetRoomId);
            }
        }
    }, [roomId]);

    useFocusEffect(
        useCallback(() => {
            loadPendientes();
        }, [loadPendientes])
    );

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') {
                loadPendientes();
            }
        });
        return () => subscription.remove();
    }, [loadPendientes]);

    const selectedPlayer =
        pendientes.find((p) => p.userId === selectedId && p.puedeCalificar) ?? null;

    const selectPlayer = useCallback((userId: number | null) => {
        setSelectedId(userId);
        setStars(0);
        setComment('');
        setSubmitError(null);
        setSuccessMessage(null);
    }, []);

    const submit = useCallback(async () => {
        if (submittingRef.current || isSubmitting) return;
        if (!selectedPlayer || stars < REVIEW_RULES.MIN_STARS) {
            setSubmitError(
                `Elegí un jugador y una puntuación de ${REVIEW_RULES.MIN_STARS} a ${REVIEW_RULES.MAX_STARS} estrellas.`
            );
            return;
        }

        submittingRef.current = true;
        setIsSubmitting(true);
        setSubmitError(null);
        setSuccessMessage(null);

        try {
            await matchService.createReview({
                salaId: roomId,
                calificadoId: selectedPlayer.userId,
                estrellas: stars,
                comentario: comment.trim() || undefined,
            });
            const playerName = formatPlayerFullName(selectedPlayer, selectedPlayer.nombre);
            setSuccessMessage(`¡Calificaste a ${playerName}!`);
            setSelectedId(null);
            setStars(0);
            setComment('');
            await loadPendientes();
        } catch (err: any) {
            setSubmitError(err.message || 'No se pudo guardar la calificación.');
            await loadPendientes();
        } finally {
            submittingRef.current = false;
            if (isMountedRef.current) {
                setIsSubmitting(false);
            }
        }
    }, [comment, isSubmitting, loadPendientes, roomId, selectedPlayer, stars]);

    return {
        pendientes,
        loading,
        loadError,
        reload: loadPendientes,
        selectedId,
        selectedPlayer,
        selectPlayer,
        stars,
        setStars,
        comment,
        setComment,
        isSubmitting,
        submitError,
        successMessage,
        submit,
    };
};

