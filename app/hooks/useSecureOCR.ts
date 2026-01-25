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

// WRITING WORKER CODE INLINE TO AVOID PATH ISSUES
// We use ES Modules for the worker to import from CDN
const WORKER_CODE = `
import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js';

// Config
env.allowLocalModels = false;
env.useBrowserCache = true;

class OCRPipeline {
    static task = 'image-to-text';
    static model = 'Xenova/trocr-small-handwritten';
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            this.instance = await pipeline(this.task, this.model, { progress_callback });
        }
        return this.instance;
    }
}

self.addEventListener('message', async (event) => {
    const { type, data, fileId } = event.data;

    if (type === 'init') {
        try {
            await OCRPipeline.getInstance((x) => {
                self.postMessage({ status: 'loading', fileId: 'system', data: x });
            });
            self.postMessage({ status: 'ready' });
        } catch (err) {
            self.postMessage({ status: 'error', error: err.message });
        }
    }

    if (type === 'process') {
        try {
            const classifier = await OCRPipeline.getInstance();
            const output = await classifier(data);
            const text = output[0]?.generated_text || "";
            self.postMessage({ status: 'complete', fileId, text });
        } catch (err) {
            self.postMessage({ status: 'error', fileId, error: err.message });
        }
    }
});
`;

export const useSecureOCR = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('');
    const [isModelReady, setIsModelReady] = useState(false);
    const workerRef = useRef<Worker | null>(null);

    useEffect(() => {
        if (!workerRef.current) {
            try {
                // Create Blob URL for the worker code
                const blob = new Blob([WORKER_CODE], { type: 'application/javascript' });
                const url = URL.createObjectURL(blob);

                // Initialize Worker with Module type support
                workerRef.current = new Worker(url, { type: 'module' });

                workerRef.current.onmessage = (e) => {
                    const { status, data } = e.data;
                    if (status === 'loading') {
                        if (data.status === 'progress') {
                            const p = Math.round(data.progress || 0);
                            setProgress(p * 0.3);
                            setStatusText(`Descargando modelo: ${p}%`);
                        } else if (data.status === 'initiate') {
                            setStatusText(`Iniciando: ${data.file}...`);
                        }
                    } else if (status === 'ready') {
                        console.log("Blob Worker Ready");
                        setIsModelReady(true);
                    } else if (status === 'error') {
                        console.error("Worker sent error:", data);
                        setStatusText(`Error inicialización: ${data.error}`);
                    }
                };

                workerRef.current.onerror = (err) => {
                    console.error("Worker Global Error:", err);
                    setStatusText("Bloqueo de seguridad o Error de Red en Worker (Blob).");
                };

                workerRef.current.postMessage({ type: 'init' });
            } catch (err) {
                console.error("Setup Error:", err);
                setStatusText("Error creando el Worker local.");
            }
        }

        return () => {
            workerRef.current?.terminate();
            workerRef.current = null;
        };
    }, []);

    const processFile = useCallback(async (file: File): Promise<OCRResult> => {
        setIsProcessing(true);
        if (isModelReady) {
            setStatusText('Analizando imagen (IA Local)...');
            setProgress(30);
        } else {
            if (statusText === '') setStatusText('Conectando con Motor IA...');
        }

        return new Promise((resolve, reject) => {
            const worker = workerRef.current;
            if (!worker) {
                reject(new Error("Worker failed"));
                return;
            }

            const fileId = `${file.name}_${Date.now()}`;
            const reader = new FileReader();

            // Timeout safety (2 minutes max for slow networks)
            const timeoutId = setTimeout(() => {
                worker.removeEventListener('message', handleMessage);
                reject(new Error("Timeout: El modelo tarda demasiado en responder."));
            }, 120000);

            const handleMessage = (e: MessageEvent) => {
                const { status, fileId: returnedId, text, error } = e.data;
                if (returnedId !== fileId && returnedId !== 'system') return;

                if (status === 'complete') {
                    clearTimeout(timeoutId);
                    worker.removeEventListener('message', handleMessage);

                    setProgress(80);
                    setStatusText('Anonimizando...');
                    try {
                        const { cleanText, mappings } = anonymizeText(text);
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
                const imageData = e.target?.result;
                worker.postMessage({ type: 'process', data: imageData, fileId });
            };
            reader.readAsDataURL(file);
        });
    }, [isModelReady, statusText]);

    const terminateWorker = useCallback(async () => {
        workerRef.current?.terminate();
        workerRef.current = null;
    }, []);

    return { processFile, terminateWorker, isProcessing, progress, statusText };
};
