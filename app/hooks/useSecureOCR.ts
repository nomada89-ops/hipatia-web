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
// WRITING WORKER CODE INLINE TO AVOID PATH ISSUES
// We use ES Modules for the worker to import from CDN
// WRITING WORKER CODE INLINE TO AVOID PATH ISSUES
// We use ES Modules for the worker to import from CDN
// WRITING WORKER CODE INLINE TO AVOID PATH ISSUES
// We use ES Modules for the worker to import from CDN
// WRITING WORKER CODE INLINE TO AVOID PATH ISSUES
// We use ES Modules for the worker to import from CDN
const WORKER_CODE = `
let AutoProcessor, Florence2ForConditionalGeneration, RawImage, env;

async function loadLibrary() {
    try {
        const module = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.2.4/dist/transformers.min.js');
        AutoProcessor = module.AutoProcessor;
        Florence2ForConditionalGeneration = module.Florence2ForConditionalGeneration;
        RawImage = module.RawImage;
        env = module.env;

        // Setup Environment
        env.allowLocalModels = false;
        env.useBrowserCache = true;
        
        return true;
    } catch (err) {
        throw new Error("Failed to load Transformers.js library: " + err.message);
    }
}

class OCRPipeline {
    // Switch back to Base model for speed
    static model_id = 'onnx-community/Florence-2-base-ft';
    static model = null;
    static processor = null;
    static initializationPromise = null;

    static async getInstance(progress_callback = null) {
        if (!AutoProcessor) await loadLibrary();

        if (this.initializationPromise) {
            return this.initializationPromise;
        }

        this.initializationPromise = (async () => {
            if (this.model === null) {
                this.model = await Florence2ForConditionalGeneration.from_pretrained(this.model_id, {
                    dtype: 'q8', 
                    device: 'wasm',
                    progress_callback
                });
                
                this.processor = await AutoProcessor.from_pretrained(this.model_id);
            }
            return { model: this.model, processor: this.processor };
        })();

        return this.initializationPromise;
    }
}

self.addEventListener('message', async (event) => {
    const { type, data, fileId, mimeType } = event.data;

    try {
        if (type === 'init') {
            await loadLibrary(); 
            await OCRPipeline.getInstance((x) => {
                self.postMessage({ status: 'loading', fileId: 'system', data: x });
            });
            self.postMessage({ status: 'ready' });
        }

        if (type === 'process') {
            await loadLibrary(); 
            const { model, processor } = await OCRPipeline.getInstance();
            
            // 1. Create Bitmap
            const blob = new Blob([data], { type: mimeType });
            const bitmap = await createImageBitmap(blob);
            const w = bitmap.width;
            const h = bitmap.height;
            
            const dimsLog = '[Dimensions]: ' + w + 'x' + h;
            
            // 2. Define Slices (2-Slice Overlap Strategy)
            const sliceConfig = [
                { y: 0, h: Math.floor(h * 0.60) },                  // Top 60%
                { y: Math.floor(h * 0.40), h: Math.floor(h * 0.60) } // Bottom 60% (20% overlap)
            ];

            let combinedText = '';
            
            // 3. Process Each Slice
            for (let i = 0; i < sliceConfig.length; i++) {
                const conf = sliceConfig[i];
                const safeH = Math.min(conf.h, h - conf.y);
                
                // Crop
                const canvas = new OffscreenCanvas(w, safeH);
                const ctx = canvas.getContext('2d');
                ctx.drawImage(bitmap, 0, conf.y, w, safeH, 0, 0, w, safeH);
                const sliceBlob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.95 });
                
                // Read
                const sliceUrl = URL.createObjectURL(sliceBlob);
                const image = await RawImage.read(sliceUrl);
                URL.revokeObjectURL(sliceUrl);
                
                // Process -> Force OCR task
                const inputs = await processor(image, '<OCR>');
                
                const generated_ids = await model.generate({
                    ...inputs,
                    max_new_tokens: 1024,
                    num_beams: 2, // Compromise: Better than greedy, faster than 3
                    do_sample: false
                });
                
                const chunkText = processor.batch_decode(generated_ids, { skip_special_tokens: true })[0];
                combinedText += chunkText + '\\n';
            }
            
            bitmap.close();
            
            // 4. Send Results (Prepend Debug Info)
            const finalDebug = '[DEBUG] ' + dimsLog + ' | Slices: 2 | Model: Large-FT (Accurate)';
            self.postMessage({ status: 'complete', fileId, text: finalDebug + '\\n' + combinedText, debugInfo: finalDebug });
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
