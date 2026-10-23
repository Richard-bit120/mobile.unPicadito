import { secureStorageAdapter } from '@/platform/storageAdapter';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface User {
    id: number;
    nombre: string;
    apellido: string;
    nombreUsuario: string;
    email: string;
    apodo?: string;
    posicionPrincipal?: string;
    fotoPerfilUrl?: string | null;
    reputacion?: number;
}

interface AuthState {
    token: string | null;
    refreshToken: string | null;
    user: User | null;
    isAuthenticated: boolean;
    isHydrated: boolean;
    setAuth: (token: string, user: User, refreshToken?: string | null) => void;
    setUser: (user: User) => void;
    logout: () => void;
    setHydrated: (hydrated: boolean) => void;
}

const INITIAL_AUTH_STATE = {
    token: null,
    refreshToken: null,
    user: null,
    isAuthenticated: false,
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            ...INITIAL_AUTH_STATE,
            isHydrated: false,
            setAuth: (token, user, refreshToken = null) =>
                set({ token, user, refreshToken, isAuthenticated: true }),
            setUser: (user) => set({ user }),
            logout: () => set({ ...INITIAL_AUTH_STATE }),
            setHydrated: (hydrated) => set({ isHydrated: hydrated }),
        }),
        {
            name: 'unpicadito-auth',
            storage: createJSONStorage(() => secureStorageAdapter),
            onRehydrateStorage: () => (state) => {
                state?.setHydrated(true);
            },
        }
    )
);