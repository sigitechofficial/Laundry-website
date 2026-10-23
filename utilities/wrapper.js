"use client";

import HeroUIProviders from "./HeroUIProviders";
import GoogleMapsProvider from "./GoogleMapsProvider";

// Client providers used by the root layout (src/app/layout.js). Both render on the
// server too, so pages arrive with their content instead of blank.
export function HeroUIProvidersWrapper({ children }) {
  return <HeroUIProviders>{children}</HeroUIProviders>;
}
export function GoogleMapsProviderWrapper({ children }) {
  return <GoogleMapsProvider>{children}</GoogleMapsProvider>;
}