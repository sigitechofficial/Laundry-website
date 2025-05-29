"use client"
import { LoadScript } from '@react-google-maps/api';
import { googleApiKey, libraries } from './URL';


const GoogleMapsProvider = ({ children }) => {
  return (
    <LoadScript
      googleMapsApiKey={googleApiKey} 
      libraries={libraries}
      loadingElement={<div></div>}
    >
      {children}
    </LoadScript>
  );
};

export default GoogleMapsProvider;
