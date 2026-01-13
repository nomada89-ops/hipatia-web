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
        return config;
    },
};

export default nextConfig;
