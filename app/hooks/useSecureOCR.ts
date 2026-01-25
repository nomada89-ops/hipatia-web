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
import { AutoProcessor, Florence2ForConditionalGeneration, RawImage, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js'; 

// HACK: Florence-2 requires v3 features. If v2.17.2 fails, we should try a v3 alpha, 
// but for stability let's try the latest v3 alpha explicit import if the v2 one doesn't have it.
// Actually, Florence-2 is ONLY in v3. Let's start with the v3 alpha CDN.
import { AutoProcessor as V3Proc, Florence2ForConditionalGeneration as V3Model, RawImage as V3Image, env as V3Env } 
    from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@3.0.0-alpha.19/dist/transformers.min.js';

// Setup Environment
V3Env.allowLocalModels = false;
V3Env.useBrowserCache = true;
// V3Env.backends.onnx.wasm.numThreads = 1; // Optional: throttle if needed

class OCRPipeline {
    static model_id = 'onnx-community/Florence-2-base-ft';
    static model = null;
    static processor = null;

    static async getInstance(progress_callback = null) {
        if (this.model === null) {
            this.model = await V3Model.from_pretrained(this.model_id, {
                dtype: 'fp32', // q8 is default for some, but let's be safe or rely on auto
                device: 'wasm',
                progress_callback
            });
            this.processor = await V3Proc.from_pretrained(this.model_id);
        }
        return { model: this.model, processor: this.processor };
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
            const { model, processor } = await OCRPipeline.getInstance();
            
            // 'data' is a dataURL (base64). RawImage.read() handles it perfectly in v3.
            const image = await V3Image.read(data);
            
            // Florence-2 prompt for OCR
            const prompt = '<OCR>';
            
            const inputs = await processor(image, prompt);
            
            const generated_ids = await model.generate({
                ...inputs,
                max_new_tokens: 1024,
            });
            
            const generated_text = processor.batch_decode(generated_ids, { skip_special_tokens: false })[0];
            
            // Florence-2 often returns the prompt + result or special tags.
            // Post-processing might be needed, but usually <OCR> returns the text directly or wrapped.
            // Let's clean it up slightly if needed. 
            // The output usually contains '</s>' etc. 'skip_special_tokens: false' keeps tags which might be useful for parsing 
            // but for raw text we might want true or manual cleanup.
            // Let's try skip_special_tokens: true first for cleaner text.
            
            const cleanerHost = processor.batch_decode(generated_ids, { skip_special_tokens: true })[0];
            
            self.postMessage({ status: 'complete', fileId, text: cleanerHost });
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
                worker.postMessage({ type: 'process', data: imageData, fileId });
            };
            reader.readAsDataURL(file);
        });
    }, [isModelReady, statusText]);

    const terminateWorker = useCallback(async () => {
        workerRef.current?.terminate();
        workerRef.current = null;
    }, []);

    return { processFile, terminateWorker, isProcessing, progress, statusText, debugLogs: logs };
};
