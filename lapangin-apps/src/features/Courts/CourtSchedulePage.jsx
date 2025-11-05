'use client';
import { useState, useEffect } from 'react';
import api from '@/utils/axiosClient/axiosInterceptor.js';

export default function CourtSchedulePage({ court, show, onClose }) {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [slots, setSlots] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // TODO: fetch availability 
    }, [court, selectedDate]);

    const handleBlockDate = async () => {
        if (!confirm(`Apakah Anda yakin ingin memblokir semua jadwal untuk tanggal ${selectedDate}? Aksi ini tidak dapat dibatalkan jika sudah ada pesanan.`)) return;

        // TODO: Panggil API untuk memblokir tanggal
        alert(`API untuk memblokir tanggal ${selectedDate} dipanggil.`);
    };

    if (!show) return null;

    return (
        <>
            <div className='fixed inset-0 z-40 bg-gray-900 bg-opacity-60' onClick={onClose}></div>
            <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 text-white p-8 rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
                <button onClick={onClose} className="absolute top-4 right-6 text-4xl hover:text-red-500">&times;</button>
                <h2 className="text-2xl font-bold mb-4">Atur Jadwal: {court.name}</h2>

                <div className="flex items-center gap-4 mb-4">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="p-2 rounded bg-gray-700"
                    />
                    <button
                        onClick={handleBlockDate}
                        className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-600"
                    >
                        Blokir Tanggal Ini
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto">
                    {isLoading && <p>Memuat jadwal...</p>}
                    {error && <p className="text-red-400">{error}</p>}
                    {!isLoading && !error && (
                        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                            {slots.length > 0 ? slots.map(slot => (
                                <div
                                    key={slot.id}
                                    className={`p-2 text-center rounded ${slot.is_booked ? 'bg-yellow-600' : 'bg-green-600'} ${slot.is_blocked ? 'bg-red-800 line-through' : ''}`}
                                >
                                    {new Date(slot.start_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            )) : <p>Tidak ada slot untuk tanggal ini atau belum digenerate.</p>}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}