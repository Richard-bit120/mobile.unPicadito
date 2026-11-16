import { THEME } from '@/config/theme';
import { getUserInitial } from '@/utils/userFormatters';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface AvatarProps {
    uri?: string | null;
    name?: string | null;
    size?: number;
    borderWidth?: number;
    fallbackInitial?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
    uri,
    name,
    size = 48,
    borderWidth = 2,
    fallbackInitial = 'U',
}) => {
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        setImageError(false);
    }, [uri]);

    const radius = size / 2;
    const fontSize = Math.round(size * 0.38);
    const trimmedUri = uri?.trim();

    if (trimmedUri && !imageError) {
        return (
            <Image
                source={{ uri: trimmedUri }}
                onError={() => setImageError(true)}
                accessibilityLabel={name ? `Foto de perfil de ${name}` : 'Foto de perfil'}
                style={[
                    styles.imageBase,
                    { width: size, height: size, borderRadius: radius, borderWidth },
                ]}
            />
        );
    }

    return (
        <View
            style={[
                styles.placeholderBase,
                { width: size, height: size, borderRadius: radius, borderWidth },
            ]}
        >
            <Text style={[styles.initials, { fontSize }]}>
                {getUserInitial(name, fallbackInitial)}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    imageBase: {
        borderColor: THEME.colors.primary,
    },
    placeholderBase: {
        backgroundColor: THEME.colors.surfaceLight,
        borderColor: THEME.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    initials: {
        fontWeight: '800',
        color: THEME.colors.primary,
    },
});
