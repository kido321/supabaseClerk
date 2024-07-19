'use client';
import { useEffect } from 'react';

declare global {
  interface Window {
    initMap: () => void;
  }
}

const GoogleMapsScript = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
    script.async = true;
    script.defer = true;

    window.initMap = () => {
      // This function will be called when the Google Maps API is loaded
      // You can leave it empty if you don't need to do anything specific on load
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return null;
};

export default GoogleMapsScript;