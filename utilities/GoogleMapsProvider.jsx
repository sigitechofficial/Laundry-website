"use client";
import { LoadScriptNext } from "@react-google-maps/api";
import { googleApiKey, libraries } from "./URL";

const GoogleMapsProvider = ({ children }) => {
  if (!googleApiKey) {
    if (typeof window !== "undefined") {
      console.error(
        "NEXT_PUBLIC_GOOGLE_MAPS_KEY is missing. Set it in Laundry-website/.env.local (see .env.example)."
      );
    }
    return children;
  }

  return (
    <LoadScriptNext
      googleMapsApiKey={googleApiKey}
      libraries={libraries}
      loadingElement={<div></div>}
    >
      {children}
    </LoadScriptNext>
  );
};

export default GoogleMapsProvider;
