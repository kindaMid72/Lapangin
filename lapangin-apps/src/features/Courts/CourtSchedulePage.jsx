'use client';
import api from '@/utils/axiosClient/axiosInterceptor.js';
import { Temporal } from '@js-temporal/polyfill';
import { useEffect, useRef, useState } from 'react';

// components
import ConfirmationMessage from '../components/ConfirmationMessage.jsx';

// stores
import useCourtStore from '@/shared/stores/courtStore';
import useVenueStore from '@/shared/stores/venueStore';

// utils 
import minuteRestriction from '@/utils/inputRestriction/minuteRestriction.js';

/**
 * FIXME: time format after fetch from database didnt match the correct venue timezone
 * 
 */

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
    const [nonAvailable, setNonAvailable] = useState([]);

    // add new schedule state
    const [newStartTime, setNewStartTime] = useState('');
    const [newEndTime, setNewEndTime] = useState('');
    const [newStatus, setNewStatus] = useState('booked');

    // ui state
    const [error, setError] = useState(null);
    const [confirmBlockDate, setConfirmBlockDate] = useState(false);
    const [showEditOccupied, setShowEditOccupied] = useState(false);
    const [showAddNewSchedule, setShowAddNewSchedule] = useState(false);
    const [newScheduleError, setNewScheduleError] = useState(null);
    const [newScheduleLoading, setNewScheduleLoading] = useState(false);

    const focusEditAvailability = useRef(null);
    const buttonFocus = useRef(null);

    useEffect(() => {
        // fetch not-free slot for selected date (default todays date)
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


    // fetcher function 
    async function getSlotsForSelectedDate() {
        try {
            setIsLoadingSlots(true);
            // pastikan ada venueId sebelum melakukan request
            if (!activeVenue || !activeVenue.venueId) return;
            if (!venueMetadata) await getVenueMetadata(activeVenue.venueId);
            await api.post('/courtAvailability/get_court_availability_for_given_date', {
                courtId: court.id,
                venueId: activeVenue.venueId,
                date: selectedDate
            })
                .then(response => {
                    if (!response?.data?.data) return;
                    return response?.data?.data;
                })
                .then(data => {
                    /**
                     * data: 
                     * nonAvailableSlots: [], <-- {start_time, end_time, status ('free','held','booked','blocked'), id (for slots instance manipulation purposes)}
                     * openTime: "08:00:00",
                     * closeTime: "20:00:00,
                     * slotDurationMinutes: 30 or 60, (int)
                     */

                    let { nonAvailableSlots, openTime, closeTime, slotDurationMinutes } = data; // extract data from response
                    console.log('raw nonAvailable (utc): ', nonAvailableSlots); // kembalikan dateString UTC format

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
                    // // TODO: debug vneue
                    // console.log({ activeVenue });

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
                    //nonAvailableSlots: [], <-- {start_time, end_time, status ('free','held','booked','blocked'), id}
                    // buat object date FIXME: error my occured here
                    let pointer = 0; // pointer of nonAvailableSlots
                    nonAvailableSlots = nonAvailableSlots.map(item => {
                        item.start_time = Temporal.Instant.from(`${item.start_time}`).toZonedDateTimeISO(venueMetadata?.timezone); // convert utc to date, then convert utc to venue timezone
                        item.end_time = Temporal.Instant.from(`${item.end_time}`).toZonedDateTimeISO(venueMetadata?.timezone);
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
                    // set global state nonAvailable
                    
                    // Cara yang lebih baik untuk debugging: Gunakan forEach atau map ke objek baru TODO: debug, erase this later on
                    
                    function checkIfOccupied(aStart, aEnd, bStart, bEnd) {
                        // check if one or all this condition were match
                        if (bStart === aStart && bEnd === aEnd) { // if they are equal
                            return true;
                        } else if (bStart <= aStart && bEnd > aStart) { // based on aStart
                            return true;
                        } else if (bStart < aEnd && bEnd >= aEnd) { // based on aEnd
                            return true;
                        }
                        return false;
                    }
                    // set status for all nonAvailableSlots
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
                    console.log("Non-available slots (sorted):", nonAvailableSlots.map(item => ({
                        start: item.start_time.toString() ,
                        end: item.end_time.toString()
                    })));
                    setNonAvailable(nonAvailableSlots); // [{start_time, end_time, status, id}, ...]
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


    // handler function
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
    // TODO: create handler for new schedule creation, make sure to trigger update for changes
    async function handleNewSchedules() {
        try {
            // validate input

            const venueId = activeVenue.venueId;
            const courtId = court.id;
            const status = newStatus ?? 'booked';
            const startTime = Temporal.PlainDateTime.from(`${selectedDate}T${newStartTime}`).toZonedDateTime(venueMetadata.timezone); // set local time by plaindateTime, then assign timezone from venue metadata
            const endTime = Temporal.PlainDateTime.from(`${selectedDate}T${newEndTime}`).toZonedDateTime(venueMetadata.timezone);
            const slotDate = selectedDate;

            if (!(status === 'held' || status === 'booked' || status === 'blocked')) {
                setNewScheduleError('Invalid status');
                return;
            }
            if (!(startTime.epochMilliseconds < endTime.epochMilliseconds)) {
                setNewScheduleError('Invalid time range');
                return;
            }
            setNewScheduleLoading(true);


            await api.post('/courtAvailability/insert_new_court_schedule', {
                venueId: venueId,
                courtId: courtId,
                startTime: startTime,
                endTime: endTime,
                status: status,
                slotDate: slotDate
            })
                .catch(err => {
                    console.error(err);
                })
                .finally(res => {
                    getSlotsForSelectedDate(); // trigger update for given date
                    setNewStartTime('');
                    setNewEndTime('');
                    setNewStatus('booked');
                    setNewScheduleError(null); // close new schedule form

                    setNewScheduleLoading(false); // return to default state, regardless the result
                })
        } catch (err) {
            console.error('handle new schedules error: ', err);
        }
    }
    async function handleSchedulesUpdate() {
        try {

        } catch (err) {
            console.error(err);
        }
    }


    // ui handler
    useEffect(() => {
        function handleClickOutside(event) {
            if (buttonFocus.current && buttonFocus.current.contains(event.target)) {
                return; // exclude the toggle button ref
            }
            if (focusEditAvailability.current && !focusEditAvailability.current.contains(event.target)) {
                setShowEditOccupied(false); // check if the focus in between the ref children or its self, if not, navigate close
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [focusEditAvailability]);


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
                                    onClick={() => { }}
                                    key={slot.startTimeString}
                                    className={`p-2 text-center rounded-lg cursor-pointer ${slot.isBooked ? 'bg-orange-600 hover:bg-orange-500' : ''} ${slot.isBlocked ? 'bg-red-800 line-through hover:bg-red-700' : ''} ${slot.isHold ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-gray-700 hover:bg-gray-600'}`}
                                >
                                    {slot.startTimeString}-{slot.endTimeString}
                                </div>
                            )) : <p>Loading...</p>}
                        </div>
                    )}

                    <ol className='flex flex-col gap-2 pt-5 justify-center items-start w-full'>
                        <li className='font-extrabold flex justify-between items-center w-full'>
                            <h3>Semua Sesi ({nonAvailable.length}): </h3>
                            <button type='button' onClick={() => { setShowAddNewSchedule(prev => !prev) }} className='px-3 py-1 bg-green-800 rounded-lg hover:bg-green-700 cursor-pointer transition-colors font-extrabold duration-100'>Atur Sesi</button>
                        </li>
                        {newScheduleError && <li className='text-red-400'>{newScheduleError}</li>}
                        {
                            showAddNewSchedule &&
                            <li className='flex relative flex-col gap-2 border-1 border-gray-600 rounded-lg p-3 w-full'>
                                <i onClick={() => { setShowAddNewSchedule(false) }} className='fa-solid fa-xmark absolute right-3 top-3 cursor-pointer hover:text-red-400 transition-colors duration-100 ease-in'></i>
                                <div className='flex w-fit gap-3'>
                                    <div className='flex gap-3 items-center'>
                                        <label className='text-[0.9em]'>Mulai:</label>
                                        <input value={newStartTime} onChange={(e) => { setNewStartTime(minuteRestriction(e.target.value)) }} type="time" className='px-3 py-1 rounded-lg border-1 border-gray-600'></input>
                                    </div>
                                    <div className='flex gap-3 items-center'>
                                        <label className='text-[0.9em]'>Akhir:</label>
                                        <input value={newEndTime} onChange={(e) => { setNewEndTime(minuteRestriction(e.target.value)) }} type="time" className='px-3 py-1 rounded-lg border-1 border-gray-600'></input>
                                    </div>
                                </div>
                                <div className='flex gap-3 items-center'>
                                    <label className='text-[0.9em]'>Status: </label>
                                    <select value={newStatus} onChange={(e) => { setNewStatus(e.target.value) }} className='px-3 py-1 rounded-lg border-1 border-gray-600'>
                                        <option className='bg-gray-700 text-white' value='held'>held</option>
                                        <option className='bg-gray-700 text-white' value='booked'>booked</option>
                                        <option className='bg-gray-700 text-white' value='blocked'>blocked</option>
                                    </select>
                                    <div className='flex-1 flex justify-end items-center'>
                                        <button type='button' disabled={newScheduleLoading} onClick={() => { { handleNewSchedules(); } }} className='px-3 py-1 bg-green-800 rounded-lg hover:bg-green-700 cursor-pointer transition-colors font-extrabold duration-100'>{newScheduleLoading ? 'loading...' : 'Simpan'}</button>
                                    </div>
                                </div>
                            </li>
                        }
                        {
                            nonAvailable.length > 0 ?
                                nonAvailable.map(item => {
                                    return (<>
                                        <li key={item.id} className='relative border-1 flex border-gray-600 rounded-lg p-2 w-full'>
                                            <div className='flex flex-col flex-1'>
                                                <p className='font-extrabold'>{item.start_time.toString().slice(11, 16)} - {item.end_time.toString().slice(11, 16)}</p>
                                                <p className={`font-extralight text-[0.9em] ${item.status === 'held' ? 'text-yellow-400' : item.status === 'booked' ? 'text-orange-400' : 'text-red-500'}`}>{item.status}</p>
                                            </div>
                                            <div ref={buttonFocus} onClick={() => { }} className=' size-10 rounded-full flex justify-center items-center hover:bg-gray-500 transition-colors duration-100 ease-in cursor-pointer'>
                                                <i className='fa-solid fa-pen-to-square' onClick={() => { showEditOccupied ? setShowEditOccupied(false) : setShowEditOccupied(item.id) }}></i>
                                            </div>
                                            <div ref={focusEditAvailability} className={`${showEditOccupied === item.id ? 'block' : 'hidden'} absolute right-15 -top-20 w-fit z-40 dark:bg-gray-800 bg-white`}>
                                                <ol className='flex items-center flex-col border-1 p-1 bg-white dark:bg-gray-600 rounded-xl max-w-fit text-white dark:text-white  font-bold dark:[&_li]:hover:bg-yellow-300 [&_li]:hover:bg-yellow-500 border-transparent [&_li]:cursor-pointer [&_li]:p-1 [&_li]:rounded-lg [&_li]:w-full [&_li]:hover:text-black '>
                                                    <li className='flex gap-3 items-center min-w-fit'> <i className="fa-solid  fa-pen"></i><p className='flex-1 text-nowrap'>Edit</p></li>
                                                    <li className='flex gap-3 items-center min-w-fit'> <i className="fa-solid  fa-shield-halved"></i> <p className='flex-1 text-nowrap'>Kelola Akses</p></li>
                                                    <li className='flex gap-3 items-center min-w-fit'> <i className="fa-solid  fa-user-minus"></i> <p className='flex-1 text-nowrap'>Delete</p></li>
                                                    <li className='flex gap-3 items-center min-w-fit hover:[&_i]:text-red-700 hover:[&_p]:text-red-700'> <i className="fa-solid  fa-trash "></i> <p className='flex-1 text-nowrap'>Hapus</p></li>
                                                </ol>
                                            </div>
                                        </li>
                                    </>)
                                }
                                )
                                : <p className='text-gray-400 italic'>No occupied slots found.</p>
                        }
                    </ol>

                </div>
            </div>
        </>
    );
}