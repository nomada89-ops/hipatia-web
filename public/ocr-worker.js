
// Using ES Modules - Standard for Transformers.js V2+
import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js';

// Skip local checks
env.allowLocalModels = false;
env.useBrowserCache = true;

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
                // Relay progress
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
                error: `Process Error: ${err.message}`
            });
        }
    }
});
