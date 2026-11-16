import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { SuccessMessage } from '@/components/feedback/SuccessMessage';
import { Button } from '@/components/ui/Button';
import { SectionCard } from '@/components/ui/SectionCard';
import { THEME } from '@/config/theme';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { usePostMatchRating } from '../hooks/usePostMatchRating';
import { PendingPlayersList } from './PendingPlayersList';
import { PostMatchRatingForm } from './PostMatchRatingForm';

interface PostMatchRatingProps {
    roomId: string;
}

export const PostMatchRating: React.FC<PostMatchRatingProps> = ({ roomId }) => {
    const {
        pendientes,
        loading,
        loadError,
        reload,
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
    } = usePostMatchRating(roomId);

    if (loading) {
        return (
            <SectionCard title="Calificá a tus compañeros">
                <View style={styles.loadingRow}>
                    <ActivityIndicator size="small" color={THEME.colors.primary} />
                    <Text style={styles.muted}>Cargando jugadores...</Text>
                </View>
            </SectionCard>
        );
    }

    return (
        <SectionCard title="Calificá a tus compañeros">
            <ErrorMessage message={loadError} />
            {!!loadError && (
                <Button title="Reintentar" variant="outline" onPress={reload} />
            )}

            <SuccessMessage message={successMessage} />

            {!loadError && pendientes.length === 0 && (
                <Text style={styles.muted}>
                    No tenés jugadores pendientes de calificar en este partido.
                </Text>
            )}

            {!loadError && pendientes.length > 0 && (
                <>
                    <PendingPlayersList
                        players={pendientes}
                        selectedId={selectedId}
                        disabled={isSubmitting}
                        onSelect={selectPlayer}
                    />
                    <PostMatchRatingForm
                        player={selectedPlayer}
                        stars={stars}
                        onStarsChange={setStars}
                        comment={comment}
                        onCommentChange={setComment}
                        isSubmitting={isSubmitting}
                        submitError={submitError}
                        onCancel={() => selectPlayer(null)}
                        onSubmit={submit}
                    />
                </>
            )}
        </SectionCard>
    );
};

const styles = StyleSheet.create({
    loadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: THEME.spacing.sm,
        paddingVertical: THEME.spacing.xs,
    },
    muted: {
        color: THEME.colors.textMuted,
        fontSize: 14,
    },
});

