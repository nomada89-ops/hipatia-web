import { useState, useCallback, useRef, useEffect } from 'react';
import { anonymizeText } from '../lib/anonymizer';
import { saveMapping } from '../lib/secureStorage';

export interface OCRResult {
    fileId: string;
    originalName: string;
    text: string;
    isAnonymized: boolean;
    mappings?: any[];
}

export const useSecureOCR = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('');
    const [isModelReady, setIsModelReady] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const workerRef = useRef<Worker | null>(null);

    const addLog = useCallback((msg: string) => {
        setLogs(prev => [...prev, `${new Date().toISOString().split('T')[1]} - ${msg}`]);
        console.log(`[SecureOCR] ${msg}`);
    }, []);

    useEffect(() => {
        if (!workerRef.current) {
            try {
                addLog("Initializing TrOCR Worker...");
                // Initialize the persistent worker
                workerRef.current = new Worker(new URL('../workers/ocr.worker.ts', import.meta.url));

                workerRef.current.onmessage = (e) => {
                    const { status, data } = e.data;

                    if (status === 'loading') {
                        // TrOCR download progress
                        if (data && data.status === 'progress') {
                            const p = Math.round(data.progress || 0);
                            setProgress(p);
                            setStatusText(`Descargando modelo: ${p}%`);
                            if (p % 10 === 0) addLog(`Model download: ${p}%`);
                        }
                    } else if (status === 'ready') {
                        addLog("Worker reported: READY (Model Loaded)");
                        setIsModelReady(true);
                        setStatusText('Modelo Listo');
                    } else if (status === 'error') {
                        addLog(`Worker reported ERROR: ${data?.error || e.data.error}`);
                        setStatusText('Error en el motor OCR');
                    }
                };

                workerRef.current.onerror = (err) => {
                    addLog("Worker Global Error");
                    console.error(err);
                    setStatusText("Error fatal en Worker");
                };

                // Trigger model load immediately
                addLog("Sending 'init' to worker...");
                workerRef.current.postMessage({ type: 'init' });

            } catch (err) {
                addLog(`Setup Error: ${err}`);
                console.error("Setup Error:", err);
                setStatusText("Error creando el Worker local.");
            }
        }

        return () => {
            // We usually don't terminate the worker here to keep the model loaded in SPA
            // usage, but if strictly cleaning up:
            // workerRef.current?.terminate();
            // workerRef.current = null;
        };
    }, []);

    const processFile = useCallback(async (file: File): Promise<OCRResult> => {
        setIsProcessing(true);
        if (isModelReady) {
            setStatusText('Analizando escritura manual (IA)...');
            setProgress(10); // Start visual progress
        } else {
            // If model isn't ready, we might trigger a load or wait
            setStatusText('Esperando carga del modelo...');
        }

        return new Promise((resolve, reject) => {
            const worker = workerRef.current;
            if (!worker) {
                reject(new Error("Worker failed"));
                return;
            }

            const fileId = `${file.name}_${Date.now()}`;
            const reader = new FileReader();

            // Timeout increased for TrOCR (can act reasonably slow for first inference)
            const timeoutId = setTimeout(() => {
                worker.removeEventListener('message', handleMessage);
                reject(new Error("Timeout: El modelo tarda demasiado."));
            }, 300000); // 5 minutes

            const handleMessage = (e: MessageEvent) => {
                const { status, fileId: returnedId, text, error } = e.data;

                if (returnedId !== fileId && returnedId !== 'system') return;

                if (status === 'complete') {
                    addLog(`Processing complete for ${fileId}`);
                    clearTimeout(timeoutId);
                    worker.removeEventListener('message', handleMessage);

                    setProgress(80);
                    setStatusText('Anonimizando...');

                    try {
                        // Anonymize locally
                        const { cleanText, mappings } = anonymizeText(text);
                        addLog(`Anonymization finished. Found ${mappings.length} items.`);
                        saveMapping(fileId, mappings);

                        setProgress(100);
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
                    clearTimeout(timeoutId);
                    worker.removeEventListener('message', handleMessage);
                    setIsProcessing(false);
                    reject(new Error(error));
                }
            };

            worker.addEventListener('message', handleMessage);

            reader.onload = (e) => {
                const imageData = e.target?.result; // ArrayBuffer or DataURL
                // Xenova Pipeline accepts Blob URL or Data URL
                // Let's create a Blob URL for consistency
                const blob = new Blob([new Uint8Array(imageData as ArrayBuffer)], { type: file.type });
                const blobUrl = URL.createObjectURL(blob);

                addLog(`Posting image to worker: ${fileId}`);
                worker.postMessage({ type: 'process', data: blobUrl, fileId });
            };

            reader.readAsArrayBuffer(file);
        });
    }, [isModelReady]);

    const terminateWorker = useCallback(async () => {
        workerRef.current?.terminate();
        workerRef.current = null;
    }, []);

    return { processFile, terminateWorker, isProcessing, progress, statusText, debugLogs: logs };
};
