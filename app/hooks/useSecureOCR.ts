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
import { createWorker } from 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.esm.min.js';

// Image Pre-processing Logic
async function preprocessImage(imageBlob) {
    const bitmap = await createImageBitmap(imageBlob);
    const width = bitmap.width;
    const height = bitmap.height;
    
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0);
    
    // Get raw pixel data
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Binarization (Thresholding) algorithm
    // Turns image into pure Black & White to help Tesseract see strokes
    const threshold = 160; // Slightly high to catch faint pencil
    
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Grayscale (Luminosity method)
        const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        
        // Threshold
        const val = (gray < threshold) ? 0 : 255;
        
        data[i] = val;     // R
        data[i + 1] = val; // G
        data[i + 2] = val; // B
        // Alpha (data[i+3]) remains 255
    }
    
    // Write back
    ctx.putImageData(imageData, 0, 0);
    
    // Return processed blob
    return canvas.convertToBlob({ type: 'image/jpeg', quality: 0.9 });
}

class OCREngine {
    static instance = null;

    static async getInstance(progressLogger) {
        if (!this.instance) {
            this.instance = await createWorker('spa', 1, {
               logger: m => {
                   if (progressLogger) progressLogger(m);
               }
            });
        }
        return this.instance;
    }
}

self.addEventListener('message', async (event) => {
    const { type, data, fileId, mimeType } = event.data;

    try {
        if (type === 'init') {
            await OCREngine.getInstance((msg) => {
                self.postMessage({ 
                    status: 'loading', 
                    fileId: 'system', 
                    data: { status: msg.status, progress: msg.progress * 100 } 
                });
            });
            self.postMessage({ status: 'ready' });
        }

        if (type === 'process') {
            const worker = await OCREngine.getInstance((msg) => {
                 self.postMessage({ 
                    status: 'loading', 
                    fileId: fileId, 
                    data: { status: msg.status, progress: msg.progress * 100 } 
                });
            });

            // 1. Reconstruct Blob
            const originalBlob = new Blob([data], { type: mimeType });
            
            // 2. Pre-process (Clean image)
            // We strip shadows and color to give Tesseract the best chance
            const cleanBlob = await preprocessImage(originalBlob);
            
            // Convert to URL for Tesseract
            const cleanUrl = URL.createObjectURL(cleanBlob);

            // 3. Recognize
            const { data: { text } } = await worker.recognize(cleanUrl);
            
            URL.revokeObjectURL(cleanUrl);
            
            // Debug Log
            const preview = text.slice(0, 100).replace(/\\n/g, ' ');
            const logMsg = '[Tesseract v5] + [B&W Filter] Length: ' + text.length + '. Preview: ' + preview;

            self.postMessage({ status: 'complete', fileId, text, debugInfo: logMsg });
        }
    } catch (err) {
        self.postMessage({ status: 'error', fileId: fileId || 'system', error: err.message + (err.stack ? ' ' + err.stack : '') });
    }
});
`;

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
                addLog("Creating worker blob...");
                // Create Blob URL for the worker code
                const blob = new Blob([WORKER_CODE], { type: 'application/javascript' });
                const url = URL.createObjectURL(blob);

                addLog("Initializing Worker (module)...");
                // Initialize Worker with Module type support
                workerRef.current = new Worker(url, { type: 'module' });

                workerRef.current.onmessage = (e) => {
                    const { status, data } = e.data;
                    if (status === 'loading') {
                        if (data.status === 'progress') {
                            const p = Math.round(data.progress || 0);
                            setProgress(p * 0.3);
                            setStatusText(`Descargando modelo: ${p}%`);
                            if (p % 10 === 0) addLog(`Model download: ${p}%`);
                        } else if (data.status === 'initiate') {
                            addLog(`Initiating model: ${data.file}`);
                            setStatusText(`Iniciando: ${data.file}...`);
                        }
                    } else if (status === 'ready') {
                        addLog("Worker reported: READY");
                        console.log("Blob Worker Ready");
                        setIsModelReady(true);
                    } else if (status === 'error') {
                        addLog(`Worker reported ERROR: ${data.error}`);
                        console.error("Worker sent error:", data);
                        setStatusText(`Error inicialización: ${data.error}`);
                    }
                };

                workerRef.current.onerror = (err) => {
                    addLog("Worker Global Error (onerror triggered)");
                    console.error("Worker Global Error:", err);
                    setStatusText("Bloqueo de seguridad o Error de Red en Worker (Blob).");
                };

                addLog("Sending 'init' message to worker...");
                workerRef.current.postMessage({ type: 'init' });
            } catch (err) {
                addLog(`Setup Error: ${err}`);
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
                // Log all worker messages for debugging
                // addLog(`Worker msg: ${status} for ${returnedId || 'system'}`);

                if (returnedId !== fileId && returnedId !== 'system') return;

                if (status === 'complete') {
                    addLog(`Processing complete for ${fileId}`);
                    // Log the first 100 chars of the text to see if it's empty or garbage
                    addLog(`[DEBUG-TEXT] First 100 chars: "${text.substring(0, 100).replace(/\n/g, ' ')}..." (Length: ${text.length})`);

                    clearTimeout(timeoutId);
                    worker.removeEventListener('message', handleMessage);

                    setProgress(80);
                    setStatusText('Anonimizando...');
                    try {
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
                        addLog(`Anonymization error: ${err}`);
                        reject(err);
                    }
                } else if (status === 'error') {
                    addLog(`Worker reported error: ${error}`);
                    clearTimeout(timeoutId);
                    worker.removeEventListener('message', handleMessage);
                    setIsProcessing(false);
                    reject(new Error(error));
                }
            };

            worker.addEventListener('message', handleMessage);

            reader.onload = (e) => {
                const imageData = e.target?.result;
                addLog(`File read complete. Posting to worker... length: ${imageData?.toString().length}`);
                worker.postMessage({ type: 'process', data: imageData, fileId, mimeType: file.type });
            };
            reader.readAsArrayBuffer(file);
        });
    }, [isModelReady, statusText]);

    const terminateWorker = useCallback(async () => {
        workerRef.current?.terminate();
        workerRef.current = null;
    }, []);

    return { processFile, terminateWorker, isProcessing, progress, statusText, debugLogs: logs };
};
