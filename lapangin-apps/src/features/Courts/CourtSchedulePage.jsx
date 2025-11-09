'use client';
import { useState, useEffect } from 'react';
import api from '@/utils/axiosClient/axiosInterceptor.js';

// components
import ConfirmationMessage from '../components/ConfirmationMessage.jsx';

// stores
import useCourtStore from '@/shared/stores/courtStore';
import useVenueStore from '@/shared/stores/venueStore';

export default function CourtSchedulePage({ court, show, onClose }) {

    // stores
    const { courts } = useCourtStore();
    const { activeVenue } = useVenueStore();


    // states
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [isBlocked, setIsBlocked] = useState(false); // exception for that date
    const [slots, setSlots] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);

    const [error, setError] = useState(null);

    const [confirmBlockDate, setConfirmBlockDate] = useState(false);

    useEffect(() => {
        // TODO: fetch not-free slot for selected date (default todays date)
        /**
         * 0. first check if date not blocked, by check if availability exception for this date is not exist
         * 1. availability rules (for that day): open hour and close hour
         * 1. slot_instance: status != 'free'
         * 2. slot_template: for slot creation
         * 3. 
         */
        getSelectedDateException();
        

    }, [court, isBlocked, selectedDate]);

    async function handleBlockDate() {
        try{
            setIsLoading(true);
            await api.post('/availabilityException/upsert_selected_date_exception',{
                court_id: court.id,
                venue_id: activeVenue.venueId,
                date: selectedDate,
                is_closed: !isBlocked // change prev values
            })
            .then(res => {
                setIsBlocked(prev => !prev);
            })
            .catch(err => {
                console.log(err);
                setError(err.message)
            }).finally(() => {
                setIsLoading(false);
            })
        }catch(err){
            console.log(err);
            setError(err.message);
        }
    }
    async function getSelectedDateException() {
        try{
            // fetch exception date for selected date
            setIsLoading(true);
            await api.post('/availabilityException/get_selected_date_exception', {
                venue_id: activeVenue.venue_id,
                court_id: court.id,
                date: selectedDate
            })
            .then(response => {
                return response?.data?.data;
            })
            .then(data => {
                if(!data) { // if there is no exception that been made for this date before
                    setIsBlocked(false);
                }else{
                    setIsBlocked(data.is_closed); // set blocked status
                }
            })
            .catch(err => {
                console.error(err);
                setError(err.message);
            })
            .finally(() => {
                setIsLoading(false);
            })
        }catch(err){
            console.error(err);
            setError(err.message);
        }
    }

    if (!show) return null;

    return (
        <>
            {confirmBlockDate && <ConfirmationMessage
                    title="Tutup Lapangan di Tanggal ini?"
                    message="Pelanggan tidak dapat memesan di tanggal ini sampai dibuka kembali."
                    onConfirm={() => {handleBlockDate(); setConfirmBlockDate(false);}}
                    onCancel={() => {setConfirmBlockDate(false)}} // hilangkan tampilan confirmation
                    delayConfirm={isBlocked? false: true} // if current state is blocked, dont show delayed confirmation
                    delayCancel={false}
                    confirmColor={isBlocked? 'green': 'red'}
                    delaySecond={3}
                ></ConfirmationMessage>
            }
            <div className='fixed inset-0 z-40 bg-gray-900 opacity-50' onClick={onClose}></div>
            <div className="fixed z-44 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 text-white p-8 rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
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
                        onClick={() => setConfirmBlockDate(true)}
                        className={isLoading? "px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600": (isBlocked? "px-4 py-2 rounded-xl bg-green-700 hover:bg-green-600": "px-4 py-2 rounded-xl bg-red-700 hover:bg-red-600")}
                    >
                        {isBlocked ? (isLoading? 'loading...' : 'Buka Tanggal') : (isLoading? 'loading...' : 'Blokir Tanggal')} {/* TODO: ini bakal dinamis, jika tanggal sudah diblock, tampilkan buka tanggal, sebaliknya berlaku */}
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