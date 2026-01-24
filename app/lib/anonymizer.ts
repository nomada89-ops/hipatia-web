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
 */
export const anonymizeText = (text: string): AnonymizationResult => {
    let cleanText = text;
    const mappings: PIIMapping[] = [];
    let studentCounter = 1;

    // 1. Detect Names based on common prefixes
    // Matches: "Nombre: Juan Perez", "Alumno: Maria Garcia", "Estudiante: Pepe"
    // Captures the value after the label until the end of line or specific punctuation
    const nameRegex = /(?:Nombre|Nome|Name|Alumno|Alumna|Estudiante)(?:\s*[:.-]\s*)([A-ZÁÉÍÓÚÑ][a-záéíóúñA-ZÁÉÍÓÚÑ\s]+)(?:$|\n|\.|,|\s{2,})/gim;

    cleanText = cleanText.replace(nameRegex, (match, capturedName) => {
        const original = capturedName.trim();
        if (original.length < 3) return match; // Ignore very short matches

        // Check if we already have a mapping for this name
        const existing = mappings.find(m => m.original === original);
        if (existing) {
            return match.replace(original, existing.alias);
        }

        const alias = `[ESTUDIANTE_${studentCounter.toString().padStart(2, '0')}]`;
        mappings.push({ original, alias, type: 'NAME' });
        studentCounter++;

        return match.replace(original, alias);
    });

    // 2. Detect DNI/NIE (Simple regex for 8 digits + letter or X/Y/Z + 7 digits + letter)
    const dniRegex = /\b([0-9]{8}[A-Z]|[XYZ][0-9]{7}[A-Z])\b/gi;

    cleanText = cleanText.replace(dniRegex, (match) => {
        const original = match.trim().toUpperCase();

        const existing = mappings.find(m => m.original === original);
        if (existing) {
            return existing.alias;
        }

        const alias = `[DNI_REDACTED]`; // Or maybe a unique DNI alias if needed
        mappings.push({ original, alias, type: 'DNI' });

        return alias;
    });

    // 3. Detect Emails
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    cleanText = cleanText.replace(emailRegex, (match) => {
        const original = match.trim();
        const existing = mappings.find(m => m.original === original);
        if (existing) return existing.alias;

        const alias = `[EMAIL_REDACTED]`;
        mappings.push({ original, alias, type: 'OTHER' });
        return alias;
    });

    return { cleanText, mappings };
};
