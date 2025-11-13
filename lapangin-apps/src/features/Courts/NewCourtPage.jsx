'use client';
import useAuthStore from '@/shared/stores/authStore';
import useVenueStore from '@/shared/stores/venueStore';
import { useEffect, useRef, useState } from 'react';


import api from '@/utils/axiosClient/axiosInterceptor.js';

export default function NewCourtPage({ show, onClose, onCourtAdded, type }) {
    /**
     * 1. court name
     * 2. court duration (30, 60)
     * 3. court capacity
     * 4. court image (not yet)
     * 5. weekday slot price
     * 6. weekend slot price
     */

    // Global state
    const { activeVenue } = useVenueStore();
    const { session, fetchSession } = useAuthStore();
    const focusRef = useRef(null);

    // state
    const [courtName, setCourtName] = useState('');
    const [duration, setDuration] = useState(30);
    const [capacity, setCapacity] = useState('');
    const [weekdayPrice, setWeekdayPrice] = useState('');
    const [weekendPrice, setWeekendPrice] = useState('');
    const [weekdayOpenTime, setWeekdayOpenTime] = useState('08:00');
    const [weekdayCloseTime, setWeekdayCloseTime] = useState('22:00');
    const [weekendOpenTime, setWeekendOpenTime] = useState('08:00');
    const [weekendCloseTime, setWeekendCloseTime] = useState('23:00');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // handler
    useEffect(() => {
        function handleClickOutside(event) {
            if (focusRef.current && !focusRef.current.contains(event.target)) {
                onClose(); // check if the focus in between the ref children or its self, if not, navigate close
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [focusRef]);

    const handleTimeChange = (setter, value) => {
        if (!value) {
            setter(value);
            return;
        }
        const [hours, minutes] = value.split(':');
        const minutesNum = parseInt(minutes, 10);

        // Bulatkan menit ke 00 atau 30
        const newMinutes = minutesNum < 30 ? '00' : '30';

        setter(`${hours}:${newMinutes}`);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        await fetchSession(); // make sure session has a valid token for request
        // Validasi input dasar
        if (!courtName || !capacity || !weekdayPrice.length === 0 || !weekendPrice.length === 0 || !weekdayOpenTime || !weekdayCloseTime || !weekendOpenTime || !weekendCloseTime) {
            setError('Harap isi semua field yang wajib diisi.');
            return;
        }
        setIsLoading(true);
        try {
            const response = await api.post(`/court/create_new_court`,
                {
                    venue_id: activeVenue.venueId,
                    name: courtName,
                    capacity: parseInt(capacity, 10),
                    slot_duration_minutes: parseInt(duration, 10),
                    weekday_slot_price: weekdayPrice,
                    weekend_slot_price: weekendPrice,
                    open_time: weekdayOpenTime, // Menggunakan satu format untuk semua hari
                    close_time: weekdayCloseTime, // ini akan bisa di ubah kedepannya, edit custom open time di edit di page edit court
                }
            );

            if (response.status === 201) {
                onCourtAdded(); // Panggil callback untuk refresh data di halaman induk
                onClose();      // Tutup modal
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Terjadi kesalahan tak terduga.");
        } finally {
            setIsLoading(false);
        }
    };


    if (!show) return null;

    return (<>
        <div className='fixed z-45 inset-0 h-full w-full bg-gray-900/50 backdrop-blur-xs' onClick={onClose}>
            {/* this is for background overlay */}
        </div>
        <div className="fixed z-46 pb-5 inset-0 w-full h-full overflow-auto bg-gray-transparent flex justify-center items-center ">
            <div ref={focusRef} className='bg-gray-800 min-w-fit text-white p-8 rounded-xl shadow-lg w-full max-w-md relative'>
                <button onClick={onClose} disabled={isLoading} className="absolute top-4 right-6 text-4xl hover:text-red-500 transition-colors disabled:text-gray-500">&times;</button>
                <h2 className="flex text-2xl font-bold mb-6 text-center">Tambah Lapangan Baru</h2>
                <form onSubmit={handleSubmit} className="space-y-4 flex flex-col md:flex-row md:gap-5">
                    <div className=''>
                        <div> {/* nama lapangan */}
                            <label htmlFor="courtName" className="block mb-1 font-medium">Nama Lapangan</label>
                            <input id="courtName" type="text" value={courtName} onChange={(e) => setCourtName(e.target.value)} className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g., Lapangan A" required />
                        </div>
                        <div className='flex flex-row gap-4'>
                            <div className="flex flex-col ">
                                <div className="flex-1">
                                    <label htmlFor="duration" className="block mb-1 font-medium">Durasi Slot (menit)</label>
                                    <select id="duration" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500">
                                        <option value={30}>30 menit</option>
                                        <option value={60}>60 menit</option>
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label htmlFor="capacity" className="block mb-1 font-medium">Kapasitas</label>
                                    <input id="capacity" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g., 10" required />
                                </div>
                            </div>
                            <div className='flex flex-col'>
                                <div>
                                    <label htmlFor="weekdayPrice" className="block mb-1 font-medium text-nowrap">Harga Hari Biasa (Rp)</label>
                                    <input id="weekdayPrice" type="number" value={weekdayPrice} onChange={(e) => {
                                        setWeekdayPrice(e.target.value);
                                    }} className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g., 100000" required />
                                </div>
                                <div>
                                    <label htmlFor="weekendPrice" className="block mb-1 font-medium text-nowrap">Harga Akhir Pekan (Rp)</label>
                                    <input id="weekendPrice" type="number" value={weekendPrice} onChange={(e) => {
                                        setWeekendPrice(e.target.value);
                                    }} className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g., 150000" required />
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* availability section */}
                    <div className='flex-1 flex flex-col'>
                        <div className="border-t md:border-t-0 border-gray-600 p-0">
                            <h3 className="text-lg font-semibold mb-3 text-center md:hidden">Jam Operasional</h3>
                            <div className="space-y-2">
                                <p className="text-sm font-medium md:hidden">Semua Hari</p>
                                <h3 className='md:inline-block hidden '>Jam Operasional</h3>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label htmlFor="openTime" className="block mb-1 text-xs">Buka</label>
                                        <input id="openTime" type="time" value={weekdayOpenTime} onChange={(e) => handleTimeChange(setWeekdayOpenTime, e.target.value)} className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500" required />
                                    </div>
                                    <div className="flex-1">
                                        <label htmlFor="closeTime" className="block mb-1 text-xs">Tutup</label>
                                        <input id="closeTime" type="time" value={weekdayCloseTime} onChange={(e) => handleTimeChange(setWeekdayCloseTime, e.target.value)} className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500" required />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='flex-1 flex flex-col justify-center items-end'>
                            <div className='pt-0 flex-1 flex flex-col'>
                                <div className='flex-1 flex items-end justify-center min-h-8'>
                                    {error && <p className="text-red-400 text-sm text-center py-2">{error}</p>}
                                </div>
                                <div className=" flex  justify-center gap-4 pb-4">
                                    <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 rounded-xl bg-gray-600 hover:bg-gray-500 transition-colors">Batal</button>
                                    <button type="submit" disabled={isLoading} className="px-4 py-2 rounded-xl bg-green-700 hover:bg-green-600 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                                        {isLoading ? 'Menyimpan...' : 'Simpan Lapangan'}
                                    </button>
                                </div>

                            </div>
                        </div>

                    </div>
                </form>
            </div>
        </div>
    </>
    );
}