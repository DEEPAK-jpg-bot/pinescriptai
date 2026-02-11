/** @type {import('next').NextConfig} */
const nextConfig = {
    // Basic config for Vercel deployment - no localhost rewrites needed in production
    // The vercel.json handles routing /api/* to the Python backend
    experimental: {
        serverActions: {
            allowedOrigins: ['localhost:3000'],
        },
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
        ],
    },
};

export default nextConfig;
