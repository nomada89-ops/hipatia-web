
// Import Transformers.js from CDN to avoid build/bundling issues
importScripts('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.14.0/dist/transformers.min.js');

// Config
self.env.allowLocalModels = false;
self.env.useBrowserCache = true;

// Singleton
class OCRPipeline {
    static task = 'image-to-text';
    static model = 'Xenova/trocr-small-handwritten';
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            // Use the global 'transformers' object provided by the script
            const { pipeline } = self.transformers;
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
            self.postMessage({ status: 'error', error: err.message });
        }
    }

    if (type === 'process') {
        try {
            const classifier = await OCRPipeline.getInstance();
            const output = await classifier(data);
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
                error: err.message
            });
        }
    }
});
