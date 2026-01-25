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
// We use dynamic import to ensure we can catch loading errors
let AutoProcessor, Florence2ForConditionalGeneration, RawImage, env;

async function loadLibrary() {
    try {
        // Try to import from the official Hugging Face package (v3)
        // Using a specific recent version to ensure stability
        const module = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.2.4/dist/transformers.min.js');
        AutoProcessor = module.AutoProcessor;
        Florence2ForConditionalGeneration = module.Florence2ForConditionalGeneration;
        RawImage = module.RawImage;
        env = module.env;

        // Setup Environment
        env.allowLocalModels = false;
        env.useBrowserCache = true;
        // env.backends.onnx.wasm.numThreads = 1; 
        
        return true;
    } catch (err) {
        throw new Error("Failed to load Transformers.js library: " + err.message);
    }
}

class OCRPipeline {
    static model_id = 'onnx-community/Florence-2-base-ft';
    static model = null;
    static processor = null;
    static initializationPromise = null;

    static async getInstance(progress_callback = null) {
        if (!AutoProcessor) await loadLibrary();

        // Use a singleton promise to prevent race conditions during initialization
        if (this.initializationPromise) {
            return this.initializationPromise;
        }

        this.initializationPromise = (async () => {
            if (this.model === null) {
                // Initialize model and processor sequentially
                // Use 'q8' for better WASM compatibility and stability
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
    const { type, data, fileId } = event.data;

    // ERROR TRAP
    try {
        if (type === 'init') {
            await loadLibrary(); 
            // We pass a progress callback only for the 'init' phase to show model download
            await OCRPipeline.getInstance((x) => {
                self.postMessage({ status: 'loading', fileId: 'system', data: x });
            });
            self.postMessage({ status: 'ready' });
        }

        if (type === 'process') {
            await loadLibrary(); 
            // Ensure we get the fully initialized instance by awaiting the singleton
            const { model, processor } = await OCRPipeline.getInstance();
            
            // RawImage helper to read the blob/base64
            const image = await RawImage.read(data);
            
            // Log dimensions to check if we are receiving the full image
            const dimsLog = `[Dimensions]: ${ image.width }x${ image.height }`;

            // Florence-2 phrase for pure OCR
            // DEBUG: Switching to CAPTION to verify model "sight" vs resolution issues
            const prompt = '<MORE_DETAILED_CAPTION>';
            
            const inputs = await processor(image, prompt);
            
            const generated_ids = await model.generate({
                ...inputs,
                max_new_tokens: 1024,
            });
            
            const raw_text = processor.batch_decode(generated_ids, { skip_special_tokens: false })[0];
            
            // Cleanup tags if needed, but Florence <OCR> usually output includes matches. 
            // We strip the special tokens for the final text.
            const cleanText = processor.batch_decode(generated_ids, { skip_special_tokens: true })[0];
            
            // Log raw output for debugging
            let finalText = cleanText;
            // Always log debug info including dimensions and raw output
            finalText = `[DEBUG_INFO]: ${ dimsLog } || [RAW]: ${ raw_text } || [CLEAN]: ${ cleanText } `;

            self.postMessage({ status: 'complete', fileId, text: finalText });
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
