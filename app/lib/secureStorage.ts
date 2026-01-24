import { PIIMapping } from './anonymizer';

const STORAGE_PREFIX = 'hipatia_safe_';

/**
 * "The Safe" - Wrappers for LocalStorage to manage PII mappings.
 * Data stored here NEVER leaves the client.
 */

export const saveMapping = (fileId: string, mappings: PIIMapping[]) => {
    if (typeof window === 'undefined') return;

    try {
        const key = `${STORAGE_PREFIX}${fileId}`;
        localStorage.setItem(key, JSON.stringify(mappings));
        // Also save a timestamp to potentially clean up old mappings later
        localStorage.setItem(`${key}_ts`, Date.now().toString());
    } catch (error) {
        console.error('Hipatia Safe: Failed to save mapping', error);
    }
};

export const getMapping = (fileId: string): PIIMapping[] | null => {
    if (typeof window === 'undefined') return null;

    try {
        const key = `${STORAGE_PREFIX}${fileId}`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Hipatia Safe: Failed to retrieve mapping', error);
        return null;
    }
};

export const clearSafe = (fileId?: string) => {
    if (typeof window === 'undefined') return;

    if (fileId) {
        localStorage.removeItem(`${STORAGE_PREFIX}${fileId}`);
        localStorage.removeItem(`${STORAGE_PREFIX}${fileId}_ts`);
    } else {
        // Clear all hipatia safe data
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(STORAGE_PREFIX)) {
                localStorage.removeItem(key);
            }
        });
    }
};

// Debug tool to see what's in the safe
export const inspectSafe = () => {
    if (typeof window === 'undefined') return {};
    const safeData: Record<string, any> = {};
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith(STORAGE_PREFIX)) {
            safeData[key] = localStorage.getItem(key);
        }
    });
    return safeData;
};
