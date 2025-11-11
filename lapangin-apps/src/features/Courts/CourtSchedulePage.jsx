'use client';
import api from '@/utils/axiosClient/axiosInterceptor.js';
import { Temporal } from '@js-temporal/polyfill';
import { useEffect, useState } from 'react';

// components
import ConfirmationMessage from '../components/ConfirmationMessage.jsx';

// stores
import useCourtStore from '@/shared/stores/courtStore';
import useVenueStore from '@/shared/stores/venueStore';

export default function CourtSchedulePage({ court, show, onClose }) {

    // stores
    const { courts } = useCourtStore();
    const { activeVenue, venueMetadata, getVenueMetadata } = useVenueStore();


    // states
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [isBlocked, setIsBlocked] = useState(false); // exception for that date
    const [slots, setSlots] = useState([]); // array of object (object -> {start_time, end_time, status)
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

        // check current exception for selected date
        getSelectedDateException();

        // fetch slots for selected date

        getSlotsForSelectedDate();

    }, [court, selectedDate]);

    async function getSlotsForSelectedDate() {
        try {
            setIsLoadingSlots(true);
            // pastikan ada venueId sebelum melakukan request
            if (!activeVenue || !activeVenue.venueId) return;
            if (!venueMetadata) await getVenueMetadata(activeVenue.venueId);
            console.log({ activeVenue, venueMetadata });
            await api.post('/courtAvailability/get_court_availability_for_given_date', {
                courtId: court.id,
                venueId: activeVenue.venueId,
                date: selectedDate
            })
                .then(response => {
                    if (!response?.data?.data) return;
                    // TODO: set slot di sini
                    return response?.data?.data;
                })
                .then(data => {
                    /**
                     * data: 
                     * nonAvailableSlots: [], <-- {start_time, end_time, status ('free','held','booked','blocked')}
                     * openTime: "08:00:00",
                     * closeTime: "20:00:00,
                     * slotDurationMinutes: 30 or 60, (int)
                     */

                    let { nonAvailableSlots, openTime, closeTime, slotDurationMinutes } = data; // extract data from response

                    // buat slot berdasarkan template slotDurationMinutes
                    // 1. kalkulasi banyak slot yang akan di buat di tanggal itu
                    const openHour = (openTime.split(':')[0]);
                    const closeHour = (closeTime.split(':')[0]);
                    let totalMaximumSlots = (parseInt(closeHour) - parseInt(openHour)) * 2; // if we assume each slots is 30minutes

                    const openMinutes = (openTime.split(':')[1]);
                    const closeMinutes = (closeTime.split(':')[1]);

                    if (openMinutes == '30' && closeMinutes == '00') {
                        totalMaximumSlots -= 1;
                    } else if (openMinutes == '00' && closeMinutes == '30') {
                        totalMaximumSlots += 1;
                    }
                    // TODO: debug vneue
                    console.log({ activeVenue });

                    // 2. set slot kosong ke dalam slots
                    const totalSlots = Math.floor(totalMaximumSlots / (slotDurationMinutes / 30)); // div by 1 if 30, div by 2 if 60

                    let temp = [];
                    for (let i = parseInt(openHour); i <= parseInt(closeHour); i++) {
                        let start = 0;
                        // untuk yang pertama, check dulu apakah jadwal buka mulai dari 30 menit, jika iya, set start ke 30
                        if ((openMinutes === '30' && slotDurationMinutes === 60) || (openMinutes === '30' && i === parseInt(openHour))) {
                            start = 30;
                        }
                        for (let j = start; j < 60; j += slotDurationMinutes) {
                            const endMinute = j + slotDurationMinutes;
                            let startTime = `${String(i).padStart(2, '0')}:${String(j).padStart(2, '0')}`;
                            let endTime = `${j + slotDurationMinutes < 60 ? String(i).padStart(2, '0') : String(i + 1).padStart(2, '0')}:${j + slotDurationMinutes < 60 ? String(j + slotDurationMinutes).padStart(2, '0') : (openMinutes === '30' && slotDurationMinutes === 60 ? '30' : '00')}`;
                            startTime = Temporal.PlainDateTime.from(`${selectedDate}T${startTime}`).toZonedDateTime(venueMetadata.timezone);
                            endTime = Temporal.PlainDateTime.from(`${selectedDate}T${endTime}`).toZonedDateTime(venueMetadata.timezone);

                            temp.push({
                                startTimeString: `${String(i).padStart(2, '0')}:${String(j).padStart(2, '0')}`,
                                endTimeString: `${j + slotDurationMinutes < 60 ? String(i).padStart(2, '0') : String(i + 1).padStart(2, '0')}:${j + slotDurationMinutes < 60 ? String(j + slotDurationMinutes).padStart(2, '0') : (openMinutes === '30' && slotDurationMinutes === 60 ? '30' : '00')}`,
                                // cek jika penambahan menit menyebabkan perubahan jam, jika iya, tambahkan 1 jam di i
                                // dan untuk menitnya, jika j menciptakan jam baru (j + lompatan >= 60menit), check tempat awal (30 atau 00), dan set di, set 00 jika 30lompatan, set 30 jika 60lompatan                        kondisi jam jadi x:30 setelah lompatan hanya mungkin di step 60 menit
                                isBooked: false,
                                isBlocked: false,
                                isHold: false,
                                startTime: startTime,
                                endTime: endTime
                            })
                        }
                    }
                    // hapus jadwal yang kelebihan
                    if (temp.length > totalSlots) {
                        temp.splice(totalSlots);
                    }
                    setSlots(temp);

                    // 3. set nonAvailableSlots ke dalam slots, dan berikan mark
                    //nonAvailableSlots: [], <-- {start_time, end_time, status ('free','held','booked','blocked')}
                    // buat object date 
                    let pointer = 0; // pointer of nonAvailableSlots
                    // TODO: make sure nonAvail is sorted in asc order
                    nonAvailableSlots = nonAvailableSlots.map(item => { // jadikan object temporal
                        item.start_time = Temporal.PlainDateTime.from(`${item.start_time}`).toZonedDateTime(venueMetadata.timezone);
                        item.end_time = Temporal.PlainDateTime.from(`${item.end_time}`).toZonedDateTime(venueMetadata.timezone);
                        return item;
                    })
                    nonAvailableSlots.sort((a, b) => {
                        if (a.start_time.epochMilliseconds < b.start_time.epochMilliseconds) {
                            return -1;
                        } else if (a.start_time.epochMilliseconds > b.start_time.epochMilliseconds) {
                            return 1;
                        } else {
                            return 0;
                        }
                    })
                    
                    // Cara yang lebih baik untuk debugging: Gunakan forEach atau map ke objek baru
                    console.log("Non-available slots (sorted):", nonAvailableSlots.map(item => ({
                        start: item.start_time.toString(),
                        end: item.end_time.toString()
                    })));
                    
                    function checkIfOccupied(aStart, aEnd, bStart, bEnd) {
                        // check if one or all this condition were match
                        if(bStart === aStart && bEnd === aEnd){ // if they are equal
                            return true;
                        }else if(bStart <= aStart && bEnd > aStart){ // based on aStart
                            return true;
                        }else if(bStart < aEnd && bEnd >= aEnd){ // based on aEnd
                            return true;
                        }
                        return false;
                    }
                    for (let i = 0; i < temp.length; i++) {
                        if (nonAvailableSlots.length > pointer) {
                            const occupied = checkIfOccupied(temp[i].startTime.epochMilliseconds, temp[i].endTime.epochMilliseconds, nonAvailableSlots[pointer].start_time.epochMilliseconds, nonAvailableSlots[pointer].end_time.epochMilliseconds);
                            if (occupied) {
                                if (nonAvailableSlots[pointer].status === 'held') {
                                    temp[i].isHold = true;
                                } else if (nonAvailableSlots[pointer].status === 'booked') {
                                    temp[i].isBooked = true;
                                } else if (nonAvailableSlots[pointer].status === 'blocked') {
                                    temp[i].isBlocked = true;
                                }
                            }
                            if (temp[i].startTime.epochMilliseconds > nonAvailableSlots[pointer].end_time.epochMilliseconds) { // increase pointer if nonAvail[pointer] is been passed
                                pointer++;
                            }

                        }
                    }
                })
                .catch(err => {
                    console.log(err);
                    setError(err.message);
                })
                .finally(() => {
                    setIsLoadingSlots(false);
                })
        } catch (err) {
            console.log(err);
        }
    }

    async function handleSlotChanges() {
        try {

        } catch (err) {
            console.log(err);
        }
    }

    async function handleExceptionChanges() {
        try {
            setIsLoading(true);
            if (!activeVenue || !activeVenue.venueId) return;
            await api.post('/availabilityException/upsert_selected_date_exception', {
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
        } catch (err) {
            console.log(err);
            setError(err.message);
        }
    }
    async function getSelectedDateException() {
        try {
            // fetch exception date for selected date
            setIsLoading(true);
            await api.post('/availabilityException/get_selected_date_exception', {
                venue_id: activeVenue.venueId,
                court_id: court.id,
                date: selectedDate
            })
                .then(response => {
                    return response?.data?.data;
                })
                .then(data => {
                    if (!data) { // if there is no exception that been made for this date before
                        setIsBlocked(false);
                    } else {
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
        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    }

    if (!show) return null;

    return (
        <>
            {confirmBlockDate && <ConfirmationMessage
                title={isBlocked ? "Buka Tanggal Ini?" : "Tutup Lapangan di Tanggal ini?"}
                message={isBlocked ? "Pelanggan dapat memesan di tanggal ini." : "Pelanggan tidak dapat memesan di tanggal ini sampai dibuka kembali."}
                onConfirm={() => { handleExceptionChanges(); setConfirmBlockDate(false); }}
                onCancel={() => { setConfirmBlockDate(false) }} // hilangkan tampilan confirmation
                delayConfirm={isBlocked ? false : true} // if current state is blocked, dont show delayed confirmation
                delayCancel={false}
                confirmColor={isBlocked ? 'green' : 'red'}
                delaySecond={1}
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
                        className={isLoading ? "px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600" : (isBlocked ? "px-4 py-2 rounded-xl bg-green-700 hover:bg-green-600" : "px-4 py-2 rounded-xl bg-red-700 hover:bg-red-600")}
                    >
                        {isBlocked ? (isLoading ? 'loading...' : 'Buka Tanggal') : (isLoading ? 'loading...' : 'Blokir Tanggal')} {/* TODO: ini bakal dinamis, jika tanggal sudah diblock, tampilkan buka tanggal, sebaliknya berlaku */}
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto scrollbar-hide p-2">
                    {isLoadingSlots && <p>Memuat jadwal...</p>}
                    {error && <p className="text-red-400">{error}</p>}
                    {!isLoadingSlots && !error && ( // each slot will have a color indicating its availability (gray-free, yellow-hold(waiting for confirmation),  orange-booked, red-blocked)
                        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                            {slots.length > 0 ? slots.map(slot => (
                                <div
                                    key={slot.startTimeString}
                                    className={`p-2 text-center rounded-lg cursor-pointer ${slot.isBooked ? 'bg-orange-600 hover:bg-orange-500' : ''} ${slot.isBlocked ? 'bg-red-800 line-through hover:bg-red-700' : ''} ${slot.isHold ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-gray-700 hover:bg-gray-600'}`}
                                >
                                    {slot.startTimeString}-{slot.endTimeString}
                                </div>
                            )) : <p>Loading...</p>}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}