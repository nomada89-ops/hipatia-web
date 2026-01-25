export interface PIIMapping {
    original: string;
    alias: string;
    type: 'NAME' | 'DNI' | 'OTHER';
}

export interface AnonymizationResult {
    cleanText: string;
    mappings: PIIMapping[];
}

/**
 * "El Triturador" - Client-side PII scrubbing.
 * Detects patterns like "Nombre:", "Alumno:", "DNI:" and replaces them with aliases.
 * 
 * @param text The raw text to scrub.
 * @param existingMappings (Optional) Previous mappings to ensure consistent aliasing across pages (e.g. Juan -> [ESTUDIANTE_01] in all pages).
 * @param startCounter (Optional) Where to start the anonymous counter if no mapping found.
 */
export const anonymizeText = (text: string, existingMappings: PIIMapping[] = [], startCounter = 1): AnonymizationResult => {
    let cleanText = text;
    // Clone to avoid mutating prop, but we want to accumulate
    const mappings: PIIMapping[] = [...existingMappings];
    let studentCounter = startCounter;

    // Helper to find or create alias
    const getAlias = (original: string, isName: boolean): string => {
        const found = mappings.find(m => m.original.toLowerCase() === original.toLowerCase());
        if (found) return found.alias;

        const alias = isName
            ? `[ESTUDIANTE_${studentCounter.toString().padStart(2, '0')}]`
            : isName === false ? `[DNI_REDACTED]` : `[EMAIL_REDACTED]`; // Fallback logic

        // Only increment counter for new Names
        if (isName) studentCounter++;

        mappings.push({
            original,
            alias,
            type: isName ? 'NAME' : 'OTHER' // Simplified type logic
        });
        return alias;
    };

    // 1. Detect Names based on common prefixes
    const nameRegex = /(?:Nombre|Nome|Name|Alumno|Alumna|Estudiante)(?:\s*[:.-]\s*)([A-ZÁÉÍÓÚÑ][a-záéíóúñA-ZÁÉÍÓÚÑ\s]+)(?:$|\n|\.|,|\s{2,})/gim;

    cleanText = cleanText.replace(nameRegex, (match, capturedName) => {
        const original = capturedName.trim();
        if (original.length < 3) return match;
        const alias = getAlias(original, true);
        return match.replace(original, alias);
    });

    // 2. Detect DNI/NIE
    const dniRegex = /\b([0-9]{8}[A-Z]|[XYZ][0-9]{7}[A-Z])\b/gi;
    cleanText = cleanText.replace(dniRegex, (match) => {
        return `[DNI_REDACTED]`;
        // Note: We are not mapping DNIs reversibly for now to keep it simple, or we could.
    });

    // 3. Detect Emails
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    cleanText = cleanText.replace(emailRegex, (match) => {
        return `[EMAIL_REDACTED]`;
    });

    return { cleanText, mappings };
};

/**
 * "El Bumerán" - Re-hydrates the server report with original identities.
 */
export const restoreIdentities = (htmlReport: string, mappings: PIIMapping[]): string => {
    let restored = htmlReport;

    // Sort mappings by length (descending) to prevent partial replacement if we had overlapping aliases (unlikely with fixed format)
    // But mainly we map Alias -> Original
    mappings.forEach(map => {
        // Global replace of the alias
        // Escape brackets for regex just in case
        const safeAlias = map.alias.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
        const regex = new RegExp(safeAlias, 'g');
        restored = restored.replace(regex, `<span class="font-bold text-indigo-600 bg-indigo-50 px-1 rounded" title="Identidad restaurada localmente">${map.original}</span>`);
    });

    return restored;
};
