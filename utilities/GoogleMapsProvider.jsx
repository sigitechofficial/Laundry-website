"use client";
import { LoadScriptNext } from "@react-google-maps/api";
import { googleApiKey, libraries } from "./URL";

const GoogleMapsProvider = ({ children }) => {
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
