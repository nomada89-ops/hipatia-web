import { useState, useCallback, useRef, useEffect } from 'react';
import { anonymizeText } from '../lib/anonymizer';
import { saveMapping } from '../lib/secureStorage';

export interface OCRResult {
    fileId: string;
    originalName: string;
    text: string;
    isAnonymized: boolean;
    mappings?: any[]; // PIIMapping[]
}

export const useSecureOCR = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('');
    const workerRef = useRef<Worker | null>(null);

    // Initialize Worker on Mount
    useEffect(() => {
        if (!workerRef.current) {
            // Use static worker from public folder to avoid bundling issues
            workerRef.current = new Worker('/ocr-worker.js');

            workerRef.current.onmessage = (e) => {
                const { status, data } = e.data;
                if (status === 'loading') {
                    // Update model load progress
                    if (data.status === 'progress') {
                        // Map 0-100 of model loading to 0-30% of total bar
                        setProgress(Math.round(data.progress || 0) * 0.3);
                        setStatusText(`Cargando modelo neuronal... ${Math.round(data.progress || 0)}%`);
                    } else if (data.status === 'initiate') {
                        setStatusText(`Descargando ${data.file}...`);
                    }
                } else if (status === 'ready') {
                    console.log("OCR Worker Ready");
                }
            };

            // Trigger init
            workerRef.current.postMessage({ type: 'init' });
        }

        return () => {
            workerRef.current?.terminate();
            workerRef.current = null;
        };
    }, []);

    const processFile = useCallback(async (file: File): Promise<OCRResult> => {
        setIsProcessing(true);
        setStatusText('Analizando escritura manual (TrOCR)...');
        // Ensure progress starts after model load zone
        setProgress(30);

        return new Promise((resolve, reject) => {
            const worker = workerRef.current;
            if (!worker) {
                reject(new Error("Worker not initialized"));
                return;
            }

            const fileId = `${file.name}_${Date.now()}`;
            const reader = new FileReader();

            // Define message handler for this specific transaction
            const handleMessage = (e: MessageEvent) => {
                const { status, fileId: returnedId, text, error } = e.data;

                // Filter by fileId to avoid race conditions if multiple files
                if (returnedId !== fileId && returnedId !== 'system') return;

                if (status === 'complete') {
                    worker.removeEventListener('message', handleMessage);

                    // Post-Process: Anonymization
                    setProgress(80);
                    setStatusText('Anonimizando datos sensibles...');

                    try {
                        const { cleanText, mappings } = anonymizeText(text);
                        saveMapping(fileId, mappings);

                        setProgress(100);
                        setStatusText('Completado.');
                        setIsProcessing(false);

                        resolve({
                            fileId,
                            originalName: file.name,
                            text: cleanText,
                            isAnonymized: mappings.length > 0,
                            mappings
                        });
                    } catch (err) {
                        reject(err);
                    }
                } else if (status === 'error') {
                    worker.removeEventListener('message', handleMessage);
                    setIsProcessing(false);
                    reject(new Error(error));
                }
            };

            worker.addEventListener('message', handleMessage);

            // Read and send
            reader.onload = (e) => {
                const imageData = e.target?.result;
                worker.postMessage({
                    type: 'process',
                    data: imageData, // Data URL
                    fileId
                });
            };
            reader.readAsDataURL(file);
        });
    }, []);

    const terminateWorker = useCallback(async () => {
        workerRef.current?.terminate();
        workerRef.current = null;
    }, []);

    return {
        processFile,
        terminateWorker,
        isProcessing,
        progress,
        statusText
    };
};
