
'use client';
import api from '@/utils/axiosClient/axiosInterceptor.js'; // Menggunakan interceptor yang sudah dibuat
import { useEffect, useState } from 'react';
import ToggleButton from '../components/ToggleButton.jsx';

export default function EditCourtPage({ court, show, onClose, onCourtUpdated }) {
    // State untuk form
    const [name, setName] = useState('');
    const [capacity, setCapacity] = useState('');
    const [duration, setDuration] = useState(60);
    const [weekdayPrice, setWeekdayPrice] = useState('');
    const [weekendPrice, setWeekendPrice] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [availability, setAvailability] = useState([
        { day_of_week: 0, day_name: 'Senin', open_time: '08:00', close_time: '22:00' },
        { day_of_week: 1, day_name: 'Selasa', open_time: '08:00', close_time: '22:00' },
        { day_of_week: 2, day_name: 'Rabu', open_time: '08:00', close_time: '22:00' },
        { day_of_week: 3, day_name: 'Kamis', open_time: '08:00', close_time: '22:00' },
        { day_of_week: 4, day_name: 'Jumat', open_time: '08:00', close_time: '22:00' },
        { day_of_week: 5, day_name: 'Sabtu', open_time: '08:00', close_time: '23:00' },
        { day_of_week: 6, day_name: 'Minggu', open_time: '08:00', close_time: '23:00' },
    ]);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Mengisi form dengan data lapangan yang dipilih saat modal dibuka
    useEffect(() => {
        if (court) {
            setName(court.name || '');
            setCapacity(court.capacity?.toString() || '');
            setDuration(court.slot_duration_minutes || 60);
            setWeekdayPrice(court.weekday_slot_price?.toString() || '');
            setWeekendPrice(court.weekend_slot_price?.toString() || '');
            setIsActive(court.is_active ?? true);
            // TODO: Ganti dengan data availability rules dari API jika sudah ada
        }
    }, [court]);

    const handleTimeChange = (index, field, value) => {
        const newAvailability = [...availability];
        newAvailability[index][field] = value;
        setAvailability(newAvailability);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            // Anda perlu membuat endpoint PATCH/PUT ini di backend
            const response = await api.patch(`/court/update_court/${court.id}`, {
                name,
                capacity: parseInt(capacity, 10),
                slot_duration_minutes: parseInt(duration, 10),
                weekday_slot_price: parseFloat(weekdayPrice),
                weekend_slot_price: parseFloat(weekendPrice),
                is_active: isActive,
                availability_rules: availability,
            });

            if (response.status === 200) {
                onCourtUpdated(); // Refresh data di halaman utama
                onClose();
            }
        } catch (err) {
            setError(err.response?.data?.message || "Gagal memperbarui lapangan.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!show) return null;

    return (
        <>
            <div className='fixed inset-0 z-40 bg-gray-900 bg-opacity-60' onClick={onClose}></div>
            <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 text-white p-8 rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} disabled={isLoading} className="absolute top-4 right-6 text-4xl hover:text-red-500 transition-colors disabled:text-gray-500">&times;</button>
                <h2 className="text-2xl font-bold mb-6">Edit Lapangan: {court.name}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Informasi Dasar */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="editCourtName" className="block mb-1 font-medium">Nama Lapangan</label>
                            <input id="editCourtName" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 rounded bg-gray-700" required />
                        </div>
                        <div className="flex items-center gap-4">
                            <label className="font-medium">Status Lapangan</label>
                            <ToggleButton isActive={isActive} onClick={() => setIsActive(!isActive)} />
                            <span className={isActive ? 'text-green-400' : 'text-red-400'}>{isActive ? 'Aktif' : 'Non-Aktif'}</span>
                        </div>
                        <div>
                            <label htmlFor="editCapacity" className="block mb-1 font-medium">Kapasitas</label>
                            <input id="editCapacity" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} className="w-full p-2 rounded bg-gray-700" required />
                        </div>
                        <div>
                            <label htmlFor="editDuration" className="block mb-1 font-medium">Durasi Slot (menit)</label>
                            <select id="editDuration" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full p-2 rounded bg-gray-700">
                                <option value={30}>30 menit</option>
                                <option value={60}>60 menit</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="editWeekdayPrice" className="block mb-1 font-medium">Harga Hari Biasa (Rp)</label>
                            <input id="editWeekdayPrice" type="number" value={weekdayPrice} onChange={(e) => setWeekdayPrice(e.target.value)} className="w-full p-2 rounded bg-gray-700" required />
                        </div>
                        <div>
                            <label htmlFor="editWeekendPrice" className="block mb-1 font-medium">Harga Akhir Pekan (Rp)</label>
                            <input id="editWeekendPrice" type="number" value={weekendPrice} onChange={(e) => setWeekendPrice(e.target.value)} className="w-full p-2 rounded bg-gray-700" required />
                        </div>
                    </div>

                    {/* Jam Operasional */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3 border-t border-gray-600 pt-4">Jam Operasional</h3>
                        <div className="space-y-2">
                            {availability.map((item, index) => (
                                <div key={index} className="grid grid-cols-3 items-center gap-4">
                                    <label className="font-medium">{item.day_name}</label>
                                    <input type="time" value={item.open_time} onChange={(e) => handleTimeChange(index, 'open_time', e.target.value)} className="w-full p-2 rounded bg-gray-700" />
                                    <input type="time" value={item.close_time} onChange={(e) => handleTimeChange(index, 'close_time', e.target.value)} className="w-full p-2 rounded bg-gray-700" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                    {/* Tombol Aksi */}
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 rounded-xl bg-gray-600 hover:bg-gray-500">Batal</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 rounded-xl bg-green-700 hover:bg-green-600 disabled:bg-gray-500">
                            {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}