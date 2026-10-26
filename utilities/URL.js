/*
 * Backend API address.
 *
 * Chosen per deployment, never hard-coded per branch (main and dev used to carry
 * different values, so every dev -> main merge risked pointing production at staging).
 *
 * In order:
 *   1. NEXT_PUBLIC_API_URL, if set: an explicit address (e.g. http://localhost:3010/
 *      for a local backend, set in .env.local).
 *   2. NEXT_PUBLIC_APP_ENV, worked out in next.config.js when the site is built:
 *      "production" for builds of the main branch on any host (AWS Amplify, Vercel,
 *      GitHub Actions / cPanel) -> production API; anything else (dev, previews,
 *      local) -> staging API.
 *
 * It used to check only Vercel's NEXT_PUBLIC_VERCEL_ENV. The live site is on AWS
 * Amplify, where that is never set, so production was calling the staging API.
 *
 * Keep the trailing slash: requests are built as `${BASE_URL}customer/...`.
 */
const PRODUCTION_API = "https://prodlaundry.sigisolutions.net/";
const STAGING_API = "https://stagelaundry.sigisolutions.net/";

const withSlash = (url) => (url.endsWith("/") ? url : `${url}/`);

export const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV === "production" ? "production" : "staging";

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL
  ? withSlash(process.env.NEXT_PUBLIC_API_URL.trim())
  : APP_ENV === "production"
    ? PRODUCTION_API
    : STAGING_API;

/** Browser Maps key from `.env.local` — never hardcode in source. */
export const googleApiKey = (
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ""
).trim();

export const libraries = ['places', 'geometry', 'drawing'];
