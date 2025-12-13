'use client';

import { GoogleMap, Marker } from "@react-google-maps/api";
import GoogleMapsLoader from "@/features/components/GoogleMapsLoader.jsx";

const defaultMapCenter = {
    lat: -6.2088,
    lng: 106.8456,
};

export default function VenueMap({ latitude, longitude }) {
    const isLoaded = GoogleMapsLoader();

    const location = {
        lat: latitude || defaultMapCenter.lat,
        lng: longitude || defaultMapCenter.lng,
    };

    return (
        <div className="h-80 w-full rounded-lg overflow-hidden bg-gray-300 dark:bg-gray-700 shadow-md">
            {isLoaded ? (
                <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={location}
                    zoom={15}
                    options={{
                        // Disable user interaction
                        zoomControl: true,
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: false,
                        draggable: true,
                        scrollwheel: true,
                    }}
                >
                    <Marker position={location} />
                </GoogleMap>
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <p>Memuat Peta...</p>
                </div>
            )}
        </div>
    );
}
