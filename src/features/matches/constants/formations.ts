export interface TacticalPosition {
    top: `${number}%`;
    left: `${number}%`;
    team: 'home' | 'away';
}

export const TACTICAL_FORMATIONS: Record<string, TacticalPosition[]> = {
    'Fútbol 5': [
        { top: '88%', left: '50%', team: 'home' },
        { top: '70%', left: '25%', team: 'home' },
        { top: '70%', left: '75%', team: 'home' },
        { top: '58%', left: '50%', team: 'home' },
        { top: '52%', left: '50%', team: 'home' },
        { top: '12%', left: '50%', team: 'away' },
        { top: '30%', left: '25%', team: 'away' },
        { top: '30%', left: '75%', team: 'away' },
        { top: '42%', left: '50%', team: 'away' },
        { top: '48%', left: '50%', team: 'away' },
    ],
    'Fútbol 7': [
        { top: '90%', left: '50%', team: 'home' },
        { top: '74%', left: '20%', team: 'home' },
        { top: '76%', left: '50%', team: 'home' },
        { top: '74%', left: '80%', team: 'home' },
        { top: '60%', left: '30%', team: 'home' },
        { top: '60%', left: '70%', team: 'home' },
        { top: '52%', left: '50%', team: 'home' },
        { top: '10%', left: '50%', team: 'away' },
        { top: '26%', left: '20%', team: 'away' },
        { top: '24%', left: '50%', team: 'away' },
        { top: '26%', left: '80%', team: 'away' },
        { top: '40%', left: '30%', team: 'away' },
        { top: '40%', left: '70%', team: 'away' },
        { top: '48%', left: '50%', team: 'away' },
    ],
};

export const inferModalityByMaxPlayers = (maxPlayers: number): string => {
    if (maxPlayers >= 14) return 'Fútbol 7';
    return 'Fútbol 5';
};
