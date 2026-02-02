import { useState, useEffect } from 'react';

// In a real implementation, this would fetch from a secure, authenticated endpoint
// or a local file loaded by the user at runtime.
// For the prototype, we assume the map is available or we mock it.

interface SecureMap {
    [hash: string]: string;
}

export const useSecureNames = (initialMap: SecureMap = {}) => {
    const [nameMap, setNameMap] = useState<SecureMap>(initialMap);

    // Function to load the map (e.g. from file upload)
    const loadSecureMap = (map: SecureMap) => {
        setNameMap(map);
    };

    // The core De-Hashing function
    const getRealName = (hashOrId: string, fallback: string = "Unknown"): string => {
        // Check if it's a known hash
        if (nameMap[hashOrId]) {
            return nameMap[hashOrId];
        }

        // Check if the ID itself has a mapping (sometimes we map ID -> Name directly)
        if (nameMap[hashOrId]) {
            return nameMap[hashOrId];
        }

        // Heuristic: If it looks like "Teacher_...", check if we have the hash part
        if (hashOrId.startsWith("Teacher_")) {
            // Just return the shorter version if we don't know the real name
            return `${fallback} (${hashOrId.substring(8, 14)}...)`;
        }

        return fallback || hashOrId;
    };

    return { getRealName, loadSecureMap };
};
