import { ErrorMessage } from '@/components/feedback/ErrorMessage';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { StarRatingInput } from '@/components/ui/StarRatingInput';
import { Textarea } from '@/components/ui/Textarea';
import { THEME } from '@/config/theme';
import { REVIEW_RULES } from '@/constants/match.constants';
import { formatPlayerFullName } from '@/utils/userFormatters';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PendienteCalificar } from '../types/match.types';

interface PostMatchRatingFormProps {
    player: PendienteCalificar | null;
    stars: number;
    onStarsChange: (value: number) => void;
    comment: string;
    onCommentChange: (value: string) => void;
    isSubmitting: boolean;
    submitError: string | null;
    onCancel: () => void;
    onSubmit: () => void;
}

export const PostMatchRatingForm: React.FC<PostMatchRatingFormProps> = ({
    player,
    stars,
    onStarsChange,
    comment,
    onCommentChange,
    isSubmitting,
    submitError,
    onCancel,
    onSubmit,
}) => {
    if (!player) {
        return (
            <Text style={styles.hint}>
                Elegí un jugador de la lista para calificarlo.
            </Text>
        );
    }

    const fullName = formatPlayerFullName(player);

    return (
        <View style={styles.form}>
            <View style={styles.playerHeader}>
                <Avatar
                    uri={player.fotoPerfilUrl}
                    name={player.nombre}
                    size={50}
                    borderWidth={2}
                    fallbackInitial="J"
                />
                <View style={styles.playerMeta}>
                    <Text style={styles.formTitle} numberOfLines={1}>
                        {fullName}
                    </Text>
                    <Text style={styles.playerSubtitle} numberOfLines={1}>
                        @{player.nombreUsuario} • {player.posicionPrincipal || 'POLIFUNCIONAL'}
                    </Text>
                </View>
            </View>

            <StarRatingInput value={stars} onChange={onStarsChange} disabled={isSubmitting} />

            <Textarea
                label="Comentario (opcional)"
                value={comment}
                onChangeText={onCommentChange}
                maxLength={REVIEW_RULES.MAX_COMMENT_LENGTH}
                currentLength={comment.length}
                editable={!isSubmitting}
                placeholder="Comentá brevemente cómo fue jugar con este jugador..."
            />

            <ErrorMessage message={submitError} />

            <Button
                title="Enviar valoración"
                loading={isSubmitting}
                disabled={isSubmitting || stars < REVIEW_RULES.MIN_STARS}
                onPress={onSubmit}
            />
            <Button
                title="Cancelar"
                variant="outline"
                disabled={isSubmitting}
                onPress={onCancel}
                style={styles.cancelButton}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    hint: {
        color: THEME.colors.textMuted,
        fontSize: 14,
        marginTop: THEME.spacing.sm,
    },
    form: {
        marginTop: THEME.spacing.md,
        paddingTop: THEME.spacing.md,
        borderTopWidth: 1,
        borderTopColor: THEME.colors.surfaceBorder,
    },
    playerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: THEME.spacing.sm,
        marginBottom: THEME.spacing.md,
    },
    playerMeta: {
        flex: 1,
    },
    formTitle: {
        color: THEME.colors.text,
        fontSize: 16,
        fontWeight: '700',
    },
    playerSubtitle: {
        color: THEME.colors.textSecondary,
        fontSize: 12,
        marginTop: 2,
    },
    cancelButton: {
        marginTop: THEME.spacing.sm,
    },
});

