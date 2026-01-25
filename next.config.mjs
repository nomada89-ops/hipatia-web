/** @type {import('next').NextConfig} */
const nextConfig = {
    // output: 'export', // Disabled for API routes (Grader)
    images: {
        unoptimized: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    webpack: (config) => {
        config.resolve.alias.canvas = false;
        config.resolve.alias.html2canvas = 'html2canvas-pro';
        // Transformers.js: Prevent bundling server-side binaries
        config.resolve.alias['onnxruntime-node'] = false;
        config.resolve.alias['sharp'] = false;

        // Transformers.js webpack config
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            path: false,
            crypto: false,
        };
        return config;
    },
};

export default nextConfig;
