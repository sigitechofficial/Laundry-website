/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'via.placeholder.com',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
            // Backend uploads (profile photos etc.) — production and staging, see utilities/URL.js
            {
                protocol: 'https',
                hostname: 'prodlaundry.sigisolutions.net',
            },
            {
                protocol: 'https',
                hostname: 'stagelaundry.sigisolutions.net',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
            },
            {
                protocol: 'http',
                hostname: '127.0.0.1',
            },
        ],
    },
    // Dev server only: allow opening it through an ngrok HTTPS tunnel (Apple/Google Pay need HTTPS)
    allowedDevOrigins: ["*.ngrok-free.app", "*.ngrok-free.dev", "*.ngrok.app", "*.ngrok.dev", "*.ngrok.io"],
    // Ensure environment variables are properly exposed
    env: {
        NEXT_PUBLIC_GOOGLE_MAPS_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY,
    },
};

module.exports = nextConfig;
