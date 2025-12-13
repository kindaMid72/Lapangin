"use client";

import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import Link from "next/link";

// components
import CourtViewCard from "@/features/Public-Microsites/components/CourtViewCard.jsx";

const defaultMapCenter = {
    lat: -6.2088,
    lng: 106.8456,
};

export default function PublicCourtSpace({ data }) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    });

    const courtSpace = data.courtSpace;
    const courts = data.courts;
    // Safely handle location parsing (Supabase returns object for JSON columns, but fallback for string)
    const location = typeof courtSpace?.location === 'string' ? JSON.parse(courtSpace.location) : (courtSpace?.location || {});
    const longitude = location?.longtitude;
    const latitude = location?.langitude;


    return (
        <div>
            <header className="flex items-start justify-center flex-col p-10 bg-green-900 text-white rounded-bl-3xl">
                <h1 className="text-3xl font-extrabold py-3">{courtSpace?.name || 'Court Space'}</h1>
                <div className="flex gap-x-4 gap-y-2 flex-wrap justify-start">
                    <div className="flex gap-2 items-center hover:underline cursor-pointer">
                        <i className="fa-solid fa-location-dot w-4 text-center"></i>
                        <Link href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`} target="_blank" rel="noopener noreferrer">
                            {courtSpace?.address || 'Alamat tidak tersedia'}
                        </Link>
                    </div>
                    <div className="flex gap-2 items-center hover:underline cursor-pointer">
                        <i className="fa-solid fa-phone w-4 text-center"></i>
                        <Link href={`tel:${courtSpace?.phone}`}>{courtSpace?.phone || 'Telepon tidak tersedia'}</Link>
                    </div>
                    <div className="flex gap-2 items-center hover:underline cursor-pointer">
                        <i className="fa-solid fa-envelope w-4 text-center"></i>
                        <Link href={`mailto:${courtSpace?.email}`}>{courtSpace?.email || 'Email tidak tersedia'}</Link>
                    </div>
                </div>
            </header>

            <main className="h-full w-full bg-gray-50">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 sm:p-6 lg:p-8">
                    {/* Left/Main Column: Court Selection */}
                    <div className="lg:col-span-2">
                        <div className="text-start">
                            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Booking Lapangan</h2>
                            <p className="mt-2 text-lg leading-6 text-gray-600">Pilih lapangan dan jadwal yang tersedia sesuai kebutuhanmu.</p>
                        </div>
                        <div className="mt-8 flex flex-wrap justify-center sm:justify-start gap-6">
                            {courts?.map((court) => (
                                <CourtViewCard key={court.id} props={court} />
                            ))}
                        </div>
                    </div>

                    {/* Right/Side Column: Map and Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Lokasi Kami</h3>
                            <div className="h-80 w-full rounded-lg overflow-hidden bg-gray-300 dark:bg-gray-700 shadow-md">
                                {isLoaded ? (
                                    <GoogleMap
                                        mapContainerStyle={{ width: '100%', height: '100%' }}
                                        center={{
                                            lat: Number(latitude) || defaultMapCenter.lat,
                                            lng: Number(longitude) || defaultMapCenter.lng
                                        }}
                                        zoom={15}
                                    >
                                        <Marker position={{
                                            lat: Number(latitude) || defaultMapCenter.lat,
                                            lng: Number(longitude) || defaultMapCenter.lng
                                        }} />
                                    </GoogleMap>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <p>Memuat Peta...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Deskripsi</h3>
                            <p className="text-gray-600 prose">
                                {courtSpace?.description || 'Tidak ada deskripsi untuk CourtSpace ini.'}
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}