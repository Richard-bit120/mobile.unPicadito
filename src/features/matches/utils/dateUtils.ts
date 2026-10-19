export const getLocalPart = (isoString?: string) => {
    if (!isoString) return { date: '', time: '' };
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
        const parts = isoString.split('T');
        return {
            date: parts[0] || '',
            time: parts[1]?.slice(0, 5) || '',
        };
    }
    const pad = (n: number) => String(n).padStart(2, '0');
    return {
        date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
        time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
    };
};

export const createIsoFromLocal = (dateStr: string, timeStr: string): string => {
    const date = new Date(`${dateStr}T${timeStr}:00`);
    return date.toISOString();
};

export const isWithin24Hours = (isoString?: string): boolean => {
    if (!isoString) return false;
    const matchDate = new Date(isoString);
    const now = new Date();
    const diffHours = (matchDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours > 0 && diffHours <= 24;
};