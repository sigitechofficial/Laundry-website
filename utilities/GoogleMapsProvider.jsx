"use client";

import { createContext, useContext } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { googleApiKey, libraries } from "./URL";

/*
 * Loads the Google Maps script once for the whole site, in the background.
 * It used to wrap the site in <LoadScriptNext loadingElement={<div/>}> (loaded with
 * ssr: false), which drew an empty div instead of the page until Google's script had
 * downloaded, so every page waited on Maps. Now pages render at once; the few places
 * that draw a map ask useGoogleMaps().isLoaded first, and the geocoder calls already
 * check for window.google.
 */
const MapsContext = createContext({ isLoaded: false, loadError: undefined });

export function useGoogleMaps() {
  return useContext(MapsContext);
}

function MapsLoader({ children }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-maps-script",
    googleMapsApiKey: googleApiKey,
    libraries,
  });
  return <MapsContext.Provider value={{ isLoaded, loadError }}>{children}</MapsContext.Provider>;
}

export default function GoogleMapsProvider({ children }) {
  if (!googleApiKey) {
    if (typeof window !== "undefined") {
      console.error(
        "NEXT_PUBLIC_GOOGLE_MAPS_KEY is missing. Set it in Laundry-website/.env.local (see .env.example)."
      );
    }
    return children;
  }
  return <MapsLoader>{children}</MapsLoader>;
}