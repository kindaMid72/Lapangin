
'use client';
import api from '@/utils/axiosClient/axiosInterceptor.js'; // Menggunakan interceptor yang sudah dibuat
import { useEffect, useState } from 'react';
import ToggleButton from '../components/ToggleButton.jsx';
import thousandNumberSeparator from '@/utils/formatChanger/thousandNumberSeparator.js';

// utils
import numberToRupiah from '@/utils/formatChanger/thousandNumberSeparator.js';
import minuteRestriction from '@/utils/inputRestriction/minuteRestriction.js';


// stores
import useVenueStore from '@/shared/stores/venueStore';
import useSessionStore from '@/shared/stores/authStore';
import useCourtStore from '@/shared/stores/courtStore';

// components
import ConfirmationMessage from '../components/ConfirmationMessage.jsx';


export default function EditCourtPage({ court, show, onClose, onCourtUpdated }) {

    // stores
    const { activeVenue } = useVenueStore();
    const { session, fetchSession } = useSessionStore();
    const { courts, setCourt, setAllCourt } = useCourtStore();

    // State untuk form
    const [name, setName] = useState('');
    const [capacity, setCapacity] = useState('');
    const [duration, setDuration] = useState(60);
    const [weekdayPrice, setWeekdayPrice] = useState('');
    const [weekendPrice, setWeekendPrice] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [availability, setAvailability] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(false);

    // Mengisi form dengan data lapangan yang dipilih saat modal dibuka
    useEffect(() => {
        if (court) {
            setName(court.name || '');
            setCapacity(court.capacity?.toString() || '');
            setDuration(court.slot_duration_minutes || 60);
            setWeekdayPrice(court.weekday_slot_price?.toString() || '');
            setWeekendPrice(court.weekend_slot_price?.toString() || '');
            setIsActive(court.is_active ?? true);
            setAvailability(court.availability_rules || []);
        }
    }, [court]);

    const handleTimeChange = (index, field, value) => {
        const newAvailability = [...availability];
        newAvailability[index][field] = minuteRestriction(value);
        setAvailability(newAvailability);
    };

    async function deleteCourtById() {
        try{
            setIsLoading(true);
            await api.delete(`/court/delete_court_by_id/${activeVenue.venueId}/${court.id}`);
            onCourtUpdated(); // Refresh data di halaman utama
            setConfirmDelete(false);
            onClose();// tutup halaman edit
        }catch(err){
            console.error(err);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            // Anda perlu membuat endpoint PATCH/PUT ini di backend
            const response = await api.post(`/court/update_court_by_id/${court.id}`, {
                venue_id: activeVenue.venueId,
                name,
                capacity: Math.round(capacity),
                slot_duration_minutes: duration,
                weekday_slot_price: weekdayPrice,
                weekend_slot_price: weekendPrice,
                is_active: isActive,
                availability_rules: availability.map(item => {
                    delete item.day_name; // delete property day_name, because its not a property of any table in database
                    return {
                        ...item
                    }
                }),
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
            {confirmDelete && <ConfirmationMessage
                title="Konfirmasi Hapus Lapangan"
                message="Apakah Anda yakin ingin menghapus lapangan ini?"
                onConfirm={() => {deleteCourtById();}}
                onCancel={() => {setConfirmDelete(false);}}
                delayConfirm={true}
                delayCancel={false}
            />}
            <div className='fixed inset-0 z-40 bg-gray-900 opacity-50' onClick={onClose}></div>
            <div className="fixed z-48 top-1/2 left-1/2 overflow-auto scrollbar-hide -translate-x-1/2 -translate-y-1/2 bg-gray-800 text-white p-8 rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} disabled={isLoading} className="absolute top-4 right-6 text-4xl hover:text-red-500 transition-colors disabled:text-gray-500">&times;</button>
                <h2 className="text-2xl font-bold mb-6">Edit Lapangan: {court.name}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Informasi Dasar */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="editCourtName" className="block mb-1 font-medium">Nama Lapangan</label>
                            <input id="editCourtName" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 rounded bg-gray-700" required />
                        </div>
                        <div className="flex flex-row items-start gap-4">
                            <div className='flex flex-col items-start gap-4'>
                                <label className="font-medium">Status Lapangan</label>
                                <div className='flex gap-3 justify-start'>
                                    <ToggleButton isActive={isActive} onClick={() => setIsActive(!isActive)} />
                                    <span className={isActive ? 'text-green-400' : 'text-red-400'}>{isActive ? 'Aktif' : 'Non-Aktif'}</span>
                                </div>
                            </div>
                            {/* delete button */}
                            <div className='flex flex-col gap-3 justify-start'> {/* delete session */}
                                <label className="font-medium">Hapus Lapangan</label>
                                <button type={'button'} onClick={() => setConfirmDelete(true)} disabled={isLoading} className='px-3 bg-red-700 hover:bg-red-600 rounded-lg w-fit font-extrabold '>Hapus</button>
                            </div>
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
                            <label htmlFor="editWeekdayPrice" className="block mb-1 font-medium">Harga Hari Biasa <p className='font-extralight text-sm inline italic'>(Rp. {numberToRupiah(weekdayPrice)})</p></label>
                            <input id="editWeekdayPrice" type="number" value={weekdayPrice} onChange={(e) => {
                                setWeekdayPrice(e.target.value);
                            }} className="w-full p-2 rounded bg-gray-700" required />
                        </div>
                        <div>
                            <label htmlFor="editWeekendPrice" className="block mb-1 font-medium">Harga Akhir Pekan <p className='font-extralight text-sm inline italic'>(Rp. {numberToRupiah(weekendPrice)})</p></label>
                            <input id="editWeekendPrice" type="number" value={weekendPrice} onChange={(e) => {
                                setWeekendPrice(e.target.value);
                            }} className="w-full p-2 rounded bg-gray-700" required />
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