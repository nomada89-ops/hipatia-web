import { pipeline, env } from '@xenova/transformers';

// Skip local model checks since we are running in browser
env.allowLocalModels = false;
env.useBrowserCache = true;

// Singleton pattern for the pipeline
class OCRPipeline {
    static task = 'image-to-text';
    static model = 'Xenova/trocr-small-handwritten';
    static instance: any = null;

    static getInstance(progress_callback: any = null) {
        if (this.instance === null) {
            // @ts-ignore
            this.instance = pipeline(this.task, this.model, { progress_callback });
        }
        return this.instance;
    }
}

self.addEventListener('message', async (event) => {
    const { type, data, fileId } = event.data;

    if (type === 'init') {
        try {
            await OCRPipeline.getInstance((x: any) => {
                // Relay download progress
                self.postMessage({
                    status: 'loading',
                    fileId: 'system',
                    data: x
                });
            });
            self.postMessage({ status: 'ready' });
        } catch (err: any) {
            self.postMessage({ status: 'error', error: err.message });
        }
    }

    if (type === 'process') {
        try {
            const classifier = await OCRPipeline.getInstance();
            // Data is the image URL or blob
            const output = await classifier(data);

            // Output format for image-to-text is [{ generated_text: "..." }]
            let text = output[0]?.generated_text || "";

            self.postMessage({
                status: 'complete',
                fileId,
                text
            });

        } catch (err: any) {
            self.postMessage({
                status: 'error',
                fileId,
                error: err.message
            });
        }
    }
});
