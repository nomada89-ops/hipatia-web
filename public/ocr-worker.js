
// Import Transformers.js from CDN to avoid build/bundling issues
importScripts('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js');

// Access the global transformers object
const { env, pipeline } = self.transformers;

// Config
env.allowLocalModels = false;
env.useBrowserCache = true;
// Limit threads to avoided hanging on some browsers?
// env.backends.onnx.wasm.numThreads = 1; 

// Singleton
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
                self.postMessage({
                    status: 'loading',
                    fileId: 'system',
                    data: x
                });
            });
            self.postMessage({ status: 'ready' });
        } catch (err) {
            self.postMessage({ status: 'error', error: `Init Error: ${err.message}` });
        }
    }

    if (type === 'process') {
        try {
            // Ensure instance is ready (awaiting singleton)
            const classifier = await OCRPipeline.getInstance();

            // Run inference
            // Data is expected to be a Data URL or Blob
            const output = await classifier(data);

            // Output format for image-to-text is [{ generated_text: "..." }]
            const text = output[0]?.generated_text || "";

            self.postMessage({
                status: 'complete',
                fileId,
                text
            });

        } catch (err) {
            self.postMessage({
                status: 'error',
                fileId,
                error: `Process Error: ${err.message}`
            });
        }
    }
});
