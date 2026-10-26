/*
 * Which deployment this build is for, decided once here and exposed to the app as
 * NEXT_PUBLIC_APP_ENV (utilities/URL.js uses it to pick the production or staging API).
 * "production" = a build of the main branch, whatever the host:
 *   AWS Amplify: AWS_BRANCH; Vercel: VERCEL_ENV / VERCEL_GIT_COMMIT_REF;
 *   GitHub Actions (cPanel deploy): GITHUB_REF_NAME.
 * Set NEXT_PUBLIC_APP_ENV yourself to override (e.g. a production build of another branch).
 */
const deployBranch =
  process.env.AWS_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || process.env.GITHUB_REF_NAME || "";
const appEnv =
  process.env.NEXT_PUBLIC_APP_ENV ||
  (process.env.VERCEL_ENV === "production" || deployBranch === "main" ? "production" : "staging");

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
        NEXT_PUBLIC_APP_ENV: appEnv,
    },
};

module.exports = nextConfig;
