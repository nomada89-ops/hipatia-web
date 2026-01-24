import { useState, useCallback, useRef } from 'react';
import { createWorker } from 'tesseract.js';
import { anonymizeText } from '../lib/anonymizer';
import { saveMapping } from '../lib/secureStorage';

export interface OCRResult {
    fileId: string;
    originalName: string;
    text: string;
    isAnonymized: boolean;
}

export const useSecureOCR = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('');
    const workerRef = useRef<Tesseract.Worker | null>(null);

    const processFile = useCallback(async (file: File): Promise<OCRResult> => {
        setIsProcessing(true);
        setProgress(0);
        setStatusText('Inicializando motor OCR local...');

        try {
            if (!workerRef.current) {
                workerRef.current = await createWorker('spa'); // Spanish language
            }

            const worker = workerRef.current;

            // Update progress based on Tesseract events might be tricky without a logger callback
            // For now, we simulate steps or use the logger if we reconstruct the worker
            // But re-using worker is faster.

            setStatusText('Escaneando documento... (Tesseract.js)');
            const { data: { text } } = await worker.recognize(file);

            setProgress(50);
            setStatusText('Buscando y anonimizando datos personales...');

            // Artificial delay to let user see the status change (optional, but good UX)
            await new Promise(r => setTimeout(r, 500));

            const { cleanText, mappings } = anonymizeText(text);

            // Save the mapping to the "Safe"
            // We use the file name + timestamp as a crude ID, or just file name if unique enough in context
            const fileId = `${file.name}_${Date.now()}`;
            saveMapping(fileId, mappings);

            setProgress(100);
            setStatusText('Procesamiento completado.');

            return {
                fileId,
                originalName: file.name,
                text: cleanText,
                isAnonymized: mappings.length > 0
            };

        } catch (error) {
            console.error('OCR Error:', error);
            setStatusText('Error en el procesamiento OCR.');
            throw error;
        } finally {
            setIsProcessing(false);
            // We don't terminate the worker immediately to allow faster subsequent scans?
            // Or we can terminate to save memory. For now, let's keep it open, but we need to handle cleanup.
        }
    }, []);

    const terminateWorker = useCallback(async () => {
        if (workerRef.current) {
            await workerRef.current.terminate();
            workerRef.current = null;
        }
    }, []);

    return {
        processFile,
        terminateWorker,
        isProcessing,
        progress,
        statusText
    };
};
