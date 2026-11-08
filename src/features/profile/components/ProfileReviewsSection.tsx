import { SectionCard } from '@/components/ui/SectionCard';
import { THEME } from '@/config/theme';
import { REVIEW_RULES } from '@/constants/match.constants';
import { formatPlayerFullName, sortReviewsByNewest } from '@/utils/userFormatters';
import { Star } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { UserReviewItem } from '../types/profile.types';

interface ProfileReviewsSectionProps {
    reviews: UserReviewItem[];
    titlePrefix?: string;
    emptyMessage?: string;
}

const formatReviewDate = (iso?: string | null): string | null => {
    if (!iso) return null;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

export const ProfileReviewsSection: React.FC<ProfileReviewsSectionProps> = ({
    reviews,
    titlePrefix = 'Reseñas',
    emptyMessage = 'Aún no hay reseñas registradas.',
}) => {
    const sortedReviews = sortReviewsByNewest<UserReviewItem>(reviews);

    return (
        <SectionCard title={`${titlePrefix} (${sortedReviews.length})`}>
            {sortedReviews.length === 0 ? (
                <Text style={styles.muted}>{emptyMessage}</Text>
            ) : (
                sortedReviews.map((rev, index) => {
                    const authorName = formatPlayerFullName(rev.calificador, 'Jugador');
                    const dateLabel = formatReviewDate(rev.creadoEn);
                    const comment = rev.comentario?.trim();

                    return (
                        <View
                            key={rev.id || String(index)}
                            style={[
                                styles.reviewItem,
                                index === sortedReviews.length - 1 && styles.reviewItemLast,
                            ]}
                        >
                            <View style={styles.reviewHeader}>
                                <View style={styles.authorMeta}>
                                    <Text style={styles.reviewerName} numberOfLines={1}>
                                        {authorName}
                                    </Text>
                                    {!!dateLabel && (
                                        <Text style={styles.reviewDate}>{dateLabel}</Text>
                                    )}
                                </View>
                                <View style={styles.ratingBox}>
                                    <Star
                                        size={14}
                                        color={THEME.colors.warning}
                                        fill={THEME.colors.warning}
                                    />
                                    <Text style={styles.reviewStars}>
                                        {rev.estrellas}/{REVIEW_RULES.MAX_STARS}
                                    </Text>
                                </View>
                            </View>
                            {!!comment && (
                                <Text style={styles.reviewComment}>{comment}</Text>
                            )}
                        </View>
                    );
                })
            )}
        </SectionCard>
    );
};

const styles = StyleSheet.create({
    reviewItem: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: THEME.colors.surfaceBorder,
    },
    reviewItemLast: {
        borderBottomWidth: 0,
        paddingBottom: 2,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: THEME.spacing.sm,
    },
    authorMeta: {
        flex: 1,
    },
    reviewerName: {
        color: THEME.colors.text,
        fontSize: 14,
        fontWeight: '600',
    },
    reviewDate: {
        color: THEME.colors.textMuted,
        fontSize: 11,
        marginTop: 2,
    },
    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    reviewStars: {
        color: THEME.colors.warning,
        fontSize: 13,
        fontWeight: '700',
    },
    reviewComment: {
        color: THEME.colors.textSecondary,
        fontSize: 13,
        marginTop: 6,
    },
    muted: {
        color: THEME.colors.textMuted,
        fontSize: 14,
    },
});
