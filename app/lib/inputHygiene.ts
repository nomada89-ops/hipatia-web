/**
 * Input Hygiene Utilities
 * Phase 1: Ensure strict text/plain ingestion and strip metadata.
 */

export const sanitizePaste = (e: React.ClipboardEvent): string => {
    // Prevent default paste behavior
    e.preventDefault();

    // Get strictly text/plain
    let text = e.clipboardData.getData("text/plain");

    // Additional cleanup (optional)
    // Remove null bytes
    text = text.replace(/\0/g, '');

    // Remove control characters (except newlines/tabs)
    // eslint-disable-next-line
    text = text.replace(/[\x00-\x09\x0B-\x1F\x7F]/g, '');

    return text;
};

export const sanitizeString = (input: string): string => {
    // General sanitizer for non-event inputs
    if (!input) return "";
    return input.replace(/\0/g, '').trim();
};
