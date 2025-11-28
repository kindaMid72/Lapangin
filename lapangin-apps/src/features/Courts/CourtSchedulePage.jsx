'use client';
import api from '@/utils/axiosClient/axiosInterceptor.js';
import { Temporal } from '@js-temporal/polyfill';
import { useEffect, useRef, useState } from 'react';

// components
import ConfirmationMessage from '../components/ConfirmationMessage.jsx';
import ScheduleEditPage from './components/ScheduleEditPage.jsx';

// stores
import useCourtStore from '@/shared/stores/courtStore';
import useVenueStore from '@/shared/stores/venueStore';

// utils 
import minuteRestriction from '@/utils/inputRestriction/minuteRestriction.js';

/**
 * TODO:
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
                     * nonAvailableSlots: [], <-- {
                     *                                  start_time (timezoneset), end_time (timezoneset), 
                     *                                  status ('free','held','booked','blocked'), 
                     *                                  id (for slots instance manipulation purposes) <-- nonAvailability Id
                     *                             }
                     * openTime: "08:00:00",
                     * closeTime: "20:00:00",
                     * slotDurationMinutes: 30 or 60, (int)
                     */

                    let { nonAvailableSlots, openTime, closeTime, slotDurationMinutes } = data; // extract data from response
                    // console.log('raw nonAvailable (utc): ', nonAvailableSlots); // kembalikan dateString UTC format
                    // 1. buat slot instance sesuai jam buka dan tutup, pakai object date mentah
                    // 2. set status for each slot
                    if(!venueMetadata) return;


                    const startTime = Temporal.PlainTime.from(openTime);
                    const endTime = Temporal.PlainTime.from(closeTime);

                    let slotTemp = []; // container for slots instant (temporary) before set to global state

                    // add Temporal version of time to non available slots
                    nonAvailableSlots.forEach(item => {
                        // Convert start_time and end_time (which are likely ISO strings with timezone from the DB)
                        // directly to ZonedDateTime objects.
                        item.startTime = Temporal.Instant.from(item.start_time).toZonedDateTimeISO(venueMetadata.timezone);
                        item.endTime = Temporal.Instant.from(item.end_time).toZonedDateTimeISO(venueMetadata.timezone);
                    });
                    // sort nonAvailableSlots asc
                    nonAvailableSlots = nonAvailableSlots.sort((a, b) => {
                        return Temporal.PlainTime.compare(a.startTime, b.startTime);
                    })
                    let nonAvailPointer = 0; // this will point to a valid nonAvailableSlots element 

                    function checkIfOccupied(cStart, cEnd, sStart, sEnd) {
                        // c = current time, s = schedule time
                        // check if current time occupied
                        if (sStart <= cStart && sEnd >= cEnd) {
                            return true;
                        }else if(sStart <= cStart && sEnd > cStart){
                            return true;
                        }else if ( sStart <= cEnd && sEnd >= cEnd) {
                            return true;
                        }

                        return false; // return false if not
                    }
                    for (let startSlot = startTime; Temporal.PlainTime.compare(startSlot, endTime) < 0; startSlot = startSlot.add({ minutes: slotDurationMinutes })) {
                        const slotEnd = startSlot.add({ minutes: slotDurationMinutes });
                        let status = 'free';
                        // check if the nonAvailable candidate is in this current startSlot - endSlot time frame
                        // move pointer until the time range of element[ponter] didnt match the current time frame 
                        const tempSlotStart = Temporal.PlainDateTime.from(`${selectedDate}T${startSlot.toString({ smallestUnit: 'second' })}`).toZonedDateTime(venueMetadata.timezone);
                        const tempSlotEnd = Temporal.PlainDateTime.from(`${selectedDate}T${slotEnd.toString({ smallestUnit: 'second' })}`).toZonedDateTime(venueMetadata.timezone);
                        while (nonAvailPointer < nonAvailableSlots.length &&
                            (nonAvailableSlots[nonAvailPointer].startTime.epochMilliseconds < tempSlotEnd.epochMilliseconds)
                        ) {
                            // check if current slot endTime < nonAvail[pointer], if so
                            // check if its occupied the current time frame
                            if (checkIfOccupied(
                                tempSlotStart.epochMilliseconds, tempSlotEnd.epochMilliseconds,
                                nonAvailableSlots[nonAvailPointer].startTime.epochMilliseconds, nonAvailableSlots[nonAvailPointer].endTime.epochMilliseconds)
                            ) {
                                status = nonAvailableSlots[nonAvailPointer].status;
                                break;
                            }
                            nonAvailPointer++; // continue checking until while condition didnt satisfied
                        }

                        if (Temporal.PlainTime.compare(slotEnd, endTime) > 0) break;
                        slotTemp.push({
                            startTime: startSlot,
                            endTime: slotEnd,
                            startTimeString: startSlot.toString().slice(0, 5),
                            endTimeString: slotEnd.toString().slice(0, 5),
                            isBooked: status === 'booked', // set slot status based on status been setted
                            isBlocked: status === 'blocked',
                            isHold: status === 'held'
                        })
                    }

                    setSlots(slotTemp);
                    setNonAvailable(nonAvailableSlots);

                    // set slot status based on nonAvailable slots

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

    async function handleNewSchedules() {
        try {
            // validate input

            const venueId = activeVenue.venueId;
            const courtId = court.id;
            const status = newStatus ?? 'booked';
            const startTime = Temporal.PlainDateTime.from(`${selectedDate}T${newStartTime}`).toZonedDateTime(venueMetadata.timezone); // set local time by plaindateTime, then assign timezone from venue metadata
            const endTime = Temporal.PlainDateTime.from(`${selectedDate}T${newEndTime}`).toZonedDateTime(venueMetadata.timezone);
            const slotDate = selectedDate;
            setNewScheduleError(null);

            if (!(status === 'held' || status === 'booked' || status === 'blocked')) {
                setNewScheduleError('Invalid status');
                return;
            }
            if (!(startTime.epochMilliseconds < endTime.epochMilliseconds)) {
                setNewScheduleError('Invalid time range');
                return;
            }
            setNewScheduleLoading(true);

            setTimeout( async () => {
                await api.post('/courtAvailability/insert_new_court_schedule', {
                    venueId: venueId,
                    courtId: courtId,
                    startTime: startTime,
                    endTime: endTime,
                    status: status,
                    slotDate: slotDate
                }) 
                    .then(res => {
                        console.log(res);
                        if(res.status === 400){
                            setNewScheduleError(res.data?.message ?? 'Something went wrong')
                        }
                    })
                    .catch(err => {
                        setNewScheduleError(err.message)
                    })
                    .finally(res => {
                        getSlotsForSelectedDate(); // trigger update for given date
                        setNewStartTime('');
                        setNewEndTime('');
                        setNewStatus('booked');
    
                        setNewScheduleLoading(false); // return to default state, regardless the result
                    })
                
            }, 20);
        } catch (err) {
            console.error('handle new schedules error: ', err);
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
            <div className='fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-xs' onClick={onClose}></div>
            <div className="fixed z-40 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 text-white p-8 rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
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
                        {isBlocked ? (isLoading ? 'loading...' : 'Buka Tanggal') : (isLoading ? 'loading...' : 'Blokir Tanggal')}
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
                                    return (
                                        <li key={item.id} className='relative border-1 flex flex-col border-gray-600 rounded-lg p-2 w-full z-40'>
                                            <div className='relative flex w-full'>
                                                <div className='flex flex-col flex-1'>
                                                    <p className='font-extrabold'>{item.start_time.toString().slice(11, 16)} - {item.end_time.toString().slice(11, 16)}</p>
                                                    <p className={`font-extralight text-[0.9em] ${item.status === 'held' ? 'text-yellow-400' : item.status === 'booked' ? 'text-orange-400' : 'text-red-500'}`}>{item.status}</p>
                                                </div> {/* TODO: add edit page to this section */}
                                                <div onClick={() => { }} className=' size-10 rounded-full flex justify-center items-center hover:bg-gray-500 transition-colors duration-100 ease-in cursor-pointer'>
                                                    <i className='fa-solid fa-pen-to-square' onClick={() => { showEditOccupied ? setShowEditOccupied(false) : setShowEditOccupied(item.id) }}></i>
                                                </div>
                                            </div>
                                            {/* TODO: edit component wil goes here */}
                                            {showEditOccupied && item.id === showEditOccupied && // show component if id match & showEditOccupied is true (button clicked)
                                                <ScheduleEditPage
                                                    selectedDate={selectedDate}
                                                    schedule={item}
                                                    onClose={() => { setShowEditOccupied(false) }}
                                                    onConfirm={() => { getSlotsForSelectedDate(); }} // if update occured, trigger update for given date
                                                />
                                            }
                                        </li>
                                    )
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