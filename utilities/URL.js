/*
 * Backend API address.
 *
 * Do NOT hard-code or swap this per branch any more. `main` and `dev` used to carry
 * different hard-coded values, so every `dev -> main` merge risked pointing Production
 * at the staging API (and staging at production).
 *
 * How it is chosen, in order:
 *   1. NEXT_PUBLIC_API_URL, if set (Vercel → Project → Settings → Environment Variables,
 *      or .env.local for local work). Use this for anything unusual, e.g.
 *      http://localhost:3010/ to run against a local backend.
 *   2. Otherwise by Vercel environment (NEXT_PUBLIC_VERCEL_ENV is set automatically
 *      on Vercel): "production" → production API, everything else (preview / dev
 *      branch deploys / local) → staging API.
 *
 * Keep the trailing slash: requests are built as `${BASE_URL}customer/...`.
 */
const PRODUCTION_API = "https://prodlaundry.sigisolutions.net/";
const STAGING_API = "https://stagelaundry.sigisolutions.net/";

const withSlash = (url) => (url.endsWith("/") ? url : `${url}/`);

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL
  ? withSlash(process.env.NEXT_PUBLIC_API_URL.trim())
  : process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
    ? PRODUCTION_API
    : STAGING_API;

/** Browser Maps key from `.env.local` — never hardcode in source. */
export const googleApiKey = (
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ""
).trim();

export const libraries = ['places', 'geometry', 'drawing'];
