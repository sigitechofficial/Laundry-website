export const BASE_URL = "http://localhost:3010/"
// export const BASE_URL = "https://prodlaundry.sigisolutions.net/"
// export const BASE_URL = "https://stagelaundry.sigisolutions.net/"

/** Browser Maps key from `.env.local` — never hardcode in source. */
export const googleApiKey = (
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ""
).trim();

export const libraries = ['places', 'geometry', 'drawing'];
