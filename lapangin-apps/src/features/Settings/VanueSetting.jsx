'use client'

/**
 * FIXME: timezone always set to 'Asia/Jakarta' even tho data fetched from database is different
 */

// imports
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

// components

// libs
import api from '@/utils/axiosClient/axiosInterceptor.js';

// stores
import useVenueStore from "@/shared/stores/venueStore";
import ToggleButton from "../components/ToggleButton";


export default function VanueSetting() {
    const { activeVenue, venueMetadata, setSelectedVenue, getVenueMetadata } = useVenueStore();
    const { venue_id, user_id } = useParams();

    // state
    const [isLoading, setLoading] = useState(false);

    const [name, setName] = useState(''); // fetch from database for all initial vanue credentials
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(false);
    const [timezone, setTimezone] = useState('');

    const allTimezones = Intl.supportedValuesOf('timeZone');

    const [changeOccured, setChangeOccured] = useState(false); // track changes and enable save button if changes occured

    // handler
    useEffect(() => {
        if (!activeVenue) return;
        getVenueMetadata(activeVenue.venueId);
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
        if (venueMetadata && (
            name !== (venueMetadata?.name ?? '') ||
            address !== (venueMetadata?.address ?? '') ||
            phone !== (venueMetadata?.phone ?? '') ||
            email !== (venueMetadata?.email ?? '') ||
            description !== (venueMetadata?.description ?? '') ||
            isActive !== (venueMetadata?.is_active ?? '')) ||
            timezone !== (venueMetadata?.timezone ?? '')
        ) {
            setChangeOccured(true);
        } else {
            setChangeOccured(false);
        }
    }, [name, address, phone, email, description, isActive, venueMetadata, timezone]);

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
                timezone: timezone
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
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Pengaturan Venue</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Kelola informasi detail untuk venue Anda.</p>
                    </div>

                    {/* Form */}
                    <div className="space-y-4 mt-6 text-gray-700 dark:text-gray-300">
                        <div>
                            <label htmlFor="venue-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Venue</label>
                            <div className="flex items-center gap-3">
                                <i className="fa-solid fa-store text-gray-400"></i>
                                <input id="venue-name" onChange={(e) => setName(e.target.value)} value={name} placeholder="Nama Usaha Anda" className="w-full p-2 bg-transparent dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="venue-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alamat Lengkap</label>
                            <div className="flex items-center gap-3">
                                <i className="fa-solid fa-map-location-dot text-gray-400"></i>
                                <input id="venue-address" onChange={(e) => setAddress(e.target.value)} value={address} placeholder="Alamat lengkap venue" className="w-full p-2 bg-transparent dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" />
                            </div>
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
                            <label htmlFor="venue-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deskripsi Venue</label>
                            <div className="flex items-start gap-3">
                                <i className="fa-solid fa-circle-info text-gray-400 mt-2"></i>
                                <textarea id="venue-description" onChange={(e) => setDescription(e.target.value)} value={description} rows="4" className="w-full p-2 bg-transparent dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" placeholder="Jelaskan tentang venue Anda..."></textarea>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status Venue</label>
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
