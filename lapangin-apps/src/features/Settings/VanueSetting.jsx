'use client'

/**
 * FIXME: timezone always set to 'Asia/Jakarta' even tho data fetched from database is different
 */

// imports
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

// components

// libs
import api from '@/utils/axiosClient/axiosInterceptor.js';

// stores
import useVenueStore from "@/shared/stores/venueStore";
import ToggleButton from "../components/ToggleButton";

const defaultMapCenter = {
    lat: -6.2088,
    lng: 106.8456,
};

export default function VanueSetting() {
    const { activeVenue, venueMetadata, setSelectedVenue, getVenueMetadata } = useVenueStore();
    const { venue_id, user_id } = useParams();

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    });

    // state
    const [isLoading, setLoading] = useState(false);

    const [name, setName] = useState(''); // fetch from database for all initial vanue credentials
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(false);
    const [timezone, setTimezone] = useState('');
    const [latitude, setLatitude] = useState(defaultMapCenter.lat);
    const [longitude, setLongitude] = useState(defaultMapCenter.lng);
    const [origin, setOrigin] = useState('');

    const allTimezones = Intl.supportedValuesOf('timeZone');

    const [changeOccured, setChangeOccured] = useState(false); // track changes and enable save button if changes occured

    // handler
    useEffect(() => {
        if (!activeVenue) return;
        getVenueMetadata(activeVenue.venueId);
        if (typeof window !== 'undefined') {
            setOrigin(window.location.origin);
        }
    }, [activeVenue]); // trigger update jika activeVenue berubah (user ganti venue)

    useEffect(() => {
        if (venueMetadata) {
            // set state to the venueMetadata that been fetch before
            // (name, slug, phone, address, description, is_active)
            setName(venueMetadata?.name ?? '');
            setAddress(venueMetadata?.address ?? '');
            setPhone(venueMetadata?.phone ?? '');
            setEmail(venueMetadata?.email ?? '');
            setDescription(venueMetadata?.description ?? '');
            setIsActive(venueMetadata?.is_active ?? '');
            setTimezone(venueMetadata?.timezone ?? '');

            const loc = typeof venueMetadata?.location === 'string' ? JSON.parse(venueMetadata.location) : (venueMetadata?.location || {});
            setLatitude(loc?.langitude || defaultMapCenter.lat);
            setLongitude(loc?.longtitude || defaultMapCenter.lng);

            setLoading(false);
            return;
        } else {
            if (!activeVenue) return;
            setLoading(true);
            getVenueMetadata(activeVenue.venueId); // this will assign venueMetadata from data that been fetch from the database
        }
    }, [venueMetadata, activeVenue])

    // watch for changes
    useEffect(() => {
        const loc = typeof venueMetadata?.location === 'string' ? JSON.parse(venueMetadata.location) : (venueMetadata?.location || {});
        const initLat = loc?.langitude || defaultMapCenter.lat;
        const initLng = loc?.longtitude || defaultMapCenter.lng;

        if (venueMetadata && (
            name !== (venueMetadata?.name ?? '') ||
            address !== (venueMetadata?.address ?? '') ||
            phone !== (venueMetadata?.phone ?? '') ||
            email !== (venueMetadata?.email ?? '') ||
            description !== (venueMetadata?.description ?? '') ||
            isActive !== (venueMetadata?.is_active ?? '') ||
            timezone !== (venueMetadata?.timezone ?? '') ||
            latitude !== initLat ||
            longitude !== initLng)
        ) {
            setChangeOccured(true);
        } else {
            setChangeOccured(false);
        }
    }, [name, address, phone, email, description, isActive, venueMetadata, timezone, latitude, longitude]);

    const handleMapClick = (e) => {
        const newLat = e.latLng.lat();
        const newLng = e.latLng.lng();
        setLatitude(newLat);
        setLongitude(newLng);
    };

    async function handleSubmit() {
        try {
            setLoading(true);
            await api.post(`/venue/update_venue_info/${activeVenue.venueId || venue_id}`, {
                name: name,
                address: address,
                phone: phone,
                email: email,
                description: description,
                is_active: isActive,
                timezone: timezone,
                langitude: latitude,
                longtitude: longitude
            }).then(res => {
                getVenueMetadata(activeVenue.venueId); // trigger update for venue metadata, this also will trigger update in the page
                setChangeOccured(false);
                setLoading(false);
            })
        } catch (err) {
            console.log(err);
            setLoading(false); // Make sure to stop loading on error
        }
    }


    return (
        <>
            <div className="flex justify-center items-center">
                <div className="w-full p-6 bg-white dark:bg-gray-900 m-3 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    {/* Header */}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Pengaturan CourtSpace</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Kelola informasi detail untuk venue Anda.</p>
                    </div>

                    {/* Form */}
                    <div className="space-y-4 mt-6 text-gray-700 dark:text-gray-300">
                        <div>
                            <label htmlFor="venue-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama CourtSpace</label>
                            <div className="flex items-center gap-3">
                                <i className="fa-solid fa-store text-gray-400"></i>
                                <input id="venue-name" onChange={(e) => setName(e.target.value)} value={name} placeholder="Nama Usaha Anda" className="w-full p-2 bg-transparent dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Link Public Booking</label>
                            <div className="flex items-center gap-3">
                                <i className="fa-solid fa-globe text-gray-400"></i>
                                <div className="flex-1 flex items-center gap-2">
                                    <p
                                        onClick={() => origin && window.open(`${origin}/booking_now/${venue_id}`, '_blank')}
                                        className="w-full p-2 bg-gray-50 dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:underline truncate"
                                    >
                                        {origin ? `${origin}/booking_now/${venue_id}` : 'Loading...'}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => { if (origin) { navigator.clipboard.writeText(`${origin}/booking_now/${venue_id}`); alert('Link berhasil disalin!'); } }}
                                        className="p-2 text-gray-500 hover:text-green-600 transition-colors"
                                        title="Salin Link"
                                    >
                                        <i className="fa-regular fa-copy text-xl"></i>
                                    </button>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Bagikan link ini kepada pelanggan untuk pemesanan online.</p>
                        </div>

                        <div>
                            <label htmlFor="venue-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alamat Lengkap</label>
                            <div className="flex items-center gap-3">
                                <i className="fa-solid fa-map-location-dot text-gray-400"></i>
                                <input id="venue-address" onChange={(e) => setAddress(e.target.value)} value={address} placeholder="Alamat lengkap venue" className="w-full p-2 bg-transparent dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lokasi di Peta</label>
                            <div className="h-64 w-full rounded-lg overflow-hidden bg-gray-300 dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
                                {isLoaded ? (
                                    <GoogleMap
                                        mapContainerStyle={{ width: '100%', height: '100%' }}
                                        center={{ lat: Number(latitude), lng: Number(longitude) }}
                                        zoom={15}
                                        onClick={handleMapClick}
                                    >
                                        <Marker position={{ lat: Number(latitude), lng: Number(longitude) }} />
                                    </GoogleMap>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <p>Memuat Peta...</p>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Klik pada peta untuk memperbarui lokasi venue Anda.</p>
                        </div>

                        <div>
                            <label htmlFor="venue-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nomor Telepon</label>
                            <div className="flex items-center gap-3">
                                <i className="fa-solid fa-phone text-gray-400"></i>
                                <input id="venue-phone" type='tel' onChange={(e) => setPhone(e.target.value)} value={phone} placeholder="Nomor telepon aktif" className="w-full p-2 bg-transparent dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="venue-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                            <div className="flex items-center gap-3">
                                <i className="fa-solid fa-envelope text-gray-400"></i>
                                <input id="venue-email" type='email' onChange={(e) => setEmail(e.target.value)} value={email} placeholder="Alamat email venue" className="w-full p-2 bg-transparent dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="venue-timezone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Timezone</label>
                            <div className="flex items-center gap-3">
                                <i className="fa-solid fa-clock text-gray-400"></i>
                                <select id="venue-timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full p-2 bg-transparent dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" required>
                                    {allTimezones.map(tz => (
                                        <option className="bg-white dark:bg-gray-800 text-black dark:text-white" key={tz} value={tz}>
                                            {tz}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="venue-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deskripsi CourtSpace</label>
                            <div className="flex items-start gap-3">
                                <i className="fa-solid fa-circle-info text-gray-400 mt-2"></i>
                                <textarea id="venue-description" onChange={(e) => setDescription(e.target.value)} value={description} rows="4" className="w-full p-2 bg-transparent dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" placeholder="Jelaskan tentang venue Anda..."></textarea>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status CourtSpace</label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Nonaktifkan jika venue sedang tidak beroperasi.</p>
                            </div>
                            <ToggleButton isActive={isActive} onClick={() => setIsActive(!isActive)} />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4 pt-6">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!changeOccured || isLoading}
                            className="px-4 py-2 text-sm text-white bg-green-600 rounded-lg font-extrabold transition-colors disabled:cursor-not-allowed disabled:bg-gray-500 hover:bg-green-700"
                        >
                            {isLoading ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </div>

            </div>
        </>
    );
};
