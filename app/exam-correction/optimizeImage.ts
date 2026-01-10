import imageCompression from 'browser-image-compression';

/**
 * Optimiza una imagen de examen para OCR de Gemini.
 * 1. Aumenta contraste y convierte a escala de grises.
 * 2. Redimensiona a max 2000px.
 * 3. Comprime a WebP con calidad 0.75.
 */
export const optimizeExamImage = async (file: File): Promise<File> => {
    try {
        console.log(`[Optimizer] Inicio: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);

        // 1. Pre-procesamiento con Canvas (Contraste y Escala de Grises)
        const processedBlob = await applyFilters(file);

        // Convertir Blob a File para pasarlo a browser-image-compression
        const processedFile = new File([processedBlob], file.name, { type: file.type });

        // 2. Compresión y Redimensionado
        const options = {
            maxSizeMB: 0.7,          // Máximo 700KB (Objetivo del usuario)
            maxWidthOrHeight: 2000,  // Redimensionar lado largo a 2000px
            useWebWorker: true,
            fileType: 'image/webp',   // Formato optimizado prioridad 1
            initialQuality: 0.75      // Calidad inicial
        };

        const compressedFile = await imageCompression(processedFile, options);

        console.log(`[Optimizer] Fin: ${compressedFile.name} (${(compressedFile.size / 1024).toFixed(2)} KB)`);
        return compressedFile;

    } catch (error) {
        console.error("[Optimizer] Error optimizando imagen, devolviendo original:", error);
        return file; // Fallback de seguridad
    }
};

/**
 * Aplica filtros de contraste y escala de grises usando Canvas.
 */
const applyFilters = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error("No se pudo obtener el contexto del canvas"));
                return;
            }

            canvas.width = img.width;
            canvas.height = img.height;

            // Aplicar filtros CSS al contexto
            // Grayscale(1) = 100% escala de grises (elimina ruido de color)
            // Contrast(1.2) = +20% contraste (resalta tinta frente a papel)
            ctx.filter = 'grayscale(1) contrast(1.2)';

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error("Error al convertir canvas a blob"));
            }, 'image/jpeg', 0.95); // Calidad intermedia para el paso intermedio
        };

        img.onerror = (e) => reject(e);
        img.src = URL.createObjectURL(file);
    });
};
