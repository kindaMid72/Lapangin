'use client'


/**
 * FIXME: error in current time comparison, issue occured after changes applied
 */
import { Temporal } from '@js-temporal/polyfill';

import { useEffect, useState } from 'react';

// compontess

// utils
import numberToRupiah from '@/utils/formatChanger/numberToRupiah.js';


// api
import { getSelectedDateException, getSlotsForSelectedDate } from '@/Apis/booking/courtMicrositeAvailability';
import { useParams, useRouter } from 'next/navigation';

export default function BookingPage() {
    const params = useParams();
    const router = useRouter();

    const [isDateAvailable, setIsDateAvailable] = useState(true);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // data state    
    const [selectedDate, setSelectedDate] = useState((new Date()).toISOString().split('T')[0]);
    const [slots, setSlots] = useState([]); // array of object (object -> {start_time, end_time, status)


    // ui state
    const [mousePos, setMousePos] = useState({ x: -9999999, y: -9999999 })
    const [slotStatus, setSlotStatus] = useState('');
    const [slotPrice, setSlotPrice] = useState(1000000000);

    const [selectedSlot, setSelectedSlot] = useState([]); // containt timestapmtz of each selected slot (startTime, endTime) <- this is havent set to dateteme, only time
    const [currentTime, setCurrentTime] = useState(() => Temporal.Now.instant());


    /**
     * to create slot instance, fetch startTime, endTime, slotInstance
     */

    // components

    // handler for currentTime
    useEffect(() => {
        // Set up an interval to update the current time every minute
        const intervalId = setInterval(() => {
            setCurrentTime(Temporal.Now.instant());
        }, 60000); // 60000 ms = 1 minute

        // Clean up the interval when the component unmounts to prevent memory leaks
        return () => clearInterval(intervalId);
    }, []); // Empty dependency array ensures this effect runs only once on mount

    useEffect(() => {
        let dateAvailable = true;
        // 1. check if selected date is available for booking, if not avail, return an error message
        getSelectedDateException(params.court_id, selectedDate)
            .then(res => {
                setIsDateAvailable(res);
                dateAvailable = res;
            })
            .catch(err => {
                setError(err);
            })

        // 2. check for exsited schedules (booked, held, blocked, or free(default))
        if (!dateAvailable) return;
        getSlotsForSelectedDate(params.venue_id, params.court_id, selectedDate)
            .then(res => {
                // TODO: set slots view based on data
                let { courtSchedules, openTime, closeTime, slotDuration, timezone, price } = res;

                // set price
                setSlotPrice(price);

                const startTime = Temporal.PlainTime.from(`${openTime}`);
                const endTime = Temporal.PlainTime.from(`${closeTime}`);
                const slotDurationMinutes = slotDuration;

                let slotTemp = []; // container for slots instant (temporary) before set to global state

                // add Temporal version of time to non available slots
                courtSchedules.forEach(item => {
                    // Convert start_time and end_time (which are likely ISO strings with timezone from the DB)
                    // directly to ZonedDateTime objects.
                    item.startTime = Temporal.Instant.from(item.start_time).toZonedDateTimeISO(timezone);
                    item.endTime = Temporal.Instant.from(item.end_time).toZonedDateTimeISO(timezone);
                });

                // sort courtSchedules asc
                courtSchedules.sort((a, b) => {// PASS
                    return Temporal.Instant.compare(a.startTime.toInstant(), b.startTime.toInstant());
                })
                let nonAvailPointer = 0; // this will point to a valid courtSchedules element 

                function checkIfOccupied(cStart, cEnd, sStart, sEnd) {
                    // c = current time, s = schedule time
                    // check if current time occupied
                    if (sStart <= cStart && sEnd >= cEnd) {
                        return true;
                    } else if (sStart <= cStart && sEnd > cStart) {
                        return true;
                    } else if (sStart <= cEnd && sEnd >= cEnd) {
                        return true;
                    }

                    return false; // return false if not
                }
                for (let startSlot = startTime; Temporal.PlainTime.compare(startSlot, endTime) < 0; startSlot = startSlot.add({ minutes: slotDurationMinutes })) {
                    const slotEnd = startSlot.add({ minutes: slotDurationMinutes });
                    let status = 'free';
                    // check if the nonAvailable candidate is in this current startSlot - endSlot time frame
                    // move pointer until the time range of element[ponter] didnt match the current time frame 
                    const tempSlotStart = Temporal.PlainDateTime.from(`${selectedDate}T${startSlot.toString({ smallestUnit: 'second' })}`).toZonedDateTime(timezone);
                    const tempSlotEnd = Temporal.PlainDateTime.from(`${selectedDate}T${slotEnd.toString({ smallestUnit: 'second' })}`).toZonedDateTime(timezone); // now containt only timestamptz
                    while (nonAvailPointer < courtSchedules.length &&
                        (courtSchedules[nonAvailPointer].startTime.epochMilliseconds < tempSlotEnd.epochMilliseconds)
                    ) {
                        // check if current slot endTime < nonAvail[pointer], if so
                        // check if its occupied the current time frame
                        if (checkIfOccupied(
                            tempSlotStart.epochMilliseconds, tempSlotEnd.epochMilliseconds,
                            courtSchedules[nonAvailPointer].startTime.epochMilliseconds, courtSchedules[nonAvailPointer].endTime.epochMilliseconds)
                        ) {
                            status = courtSchedules[nonAvailPointer].status;
                            break;
                        }
                        nonAvailPointer++; // continue checking until while condition didnt satisfied
                    }

                    if (Temporal.PlainTime.compare(slotEnd, endTime) > 0) break;
                    slotTemp.push({
                        startTime: tempSlotStart.toInstant(), // for comparation only, containt Temporal.Instant
                        endTime: tempSlotEnd.toInstant(),
                        startTimeString: startSlot.toString().slice(0, 5),
                        endTimeString: slotEnd.toString().slice(0, 5),
                        isBooked: (status === 'booked') || (Temporal.Instant.compare(tempSlotEnd.toInstant(), currentTime) < 0), // set the state to be blocked if the time have been passed
                        isBlocked: status === 'blocked',
                        isHold: status === 'held',
                        selected: false // for uis, true if element selected for bookings
                    })
                }
                console.log(slotTemp); // ga sampai sini
                setSlots(slotTemp);

                // set slot status based on nonAvailable slots

            })
            .catch(err => {
                setError(err);
            })
            .finally(() => {
                setSelectedSlot([]); // empty the selected state after selected date changing
                setIsLoading(false);
            })


    }, [selectedDate])


    // handler
    function handlePaymentPageButton() {
        router.push(`/booking_now/${params.venue_id}/${params.court_id}/payment`)
    }
    function handleBackButton() {
        router.push(`/booking_now/${params.venue_id}`)
    }
    function handleRefreshButton() {
        window.location.reload();
    }
    async function handleBookingButton(){
        // TODO: create slots hold for selected slots
        
    }

    // ui handler
    const mouseIn = (event) => {
        setMousePos({ x: event.clientX + 10, y: event.clientY - 30 })
    }
    const mouseOut = (event) => {
        setMousePos({ x: -9999999, y: -9999999 });
    }


    return (<>
        <div className="[&_*]:text-black w-full min-h-screen flex flex-col items-center justify-start p-4 px-12 gap-5 scrollbar-hide">
            <div className='w-full flex flex-col justify-between gap-4'> {/* navigation section */}
                <button type='button' onClick={() => { handleBackButton() }} className="flex group items-center justify-start gap-2 hover:!text-green-500 transition-colors duration-100 ease-in-out cursor-pointer"><i className="fa-solid fa-arrow-left group-hover:!text-green-500 transition-colors duration-100 ease-in-out"></i>Kembali</button>
                <div>
                    <h1>Lapangan Futsal 1</h1>
                    <h3>Pilih tanggal dan sesi yang Anda inginkan.</h3>
                </div>
            </div>

            {/** date selection section */}
            <div className="w-full flex flex-col items-start justify-center p-4 rounded-2xl shadow-[0_0_25px_rgba(0,0,0,0.2)] bg-white gap-3"> {/* date selection */}
                <h1 className='px-2 '>Pilih Tanggal</h1>
                <div className='w-full p-2 py-3 rounded-xl flex items-center justify-stretch border-1 border-gray-300 focus-within:border-green-800 '>
                    <input type={'date'} value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); }} className=' border-gray-500  rounded-xl'></input>
                </div>
            </div>

            {/** schedule selection section */}
            <div className="w-full flex flex-col items-start justify-center p-5 rounded-2xl shadow-[0_0_25px_rgba(0,0,0,0.2)] bg-white gap-3"> {/* date selection */}
                <div className='flex items-center justify-between w-full'>
                    <h1 className='px-2 '>Pilih Sesi Waktu</h1>
                    <button type='button' onClick={() => { handleRefreshButton() }}><i className='fa-solid fa-refresh !text-gray-500/50 hover:!text-gray-500 cursor-pointer transition-colors duration-100 ease-in-out'></i></button>
                </div>
                <h2 className='flex gap-2 justify-start items-center px-2 py-3 rounded-xl border-[#fdeec6] border-[1px] bg-[#fefaef] w-full'>
                    <i className='fa-regular fa-clock'></i>
                    <p className=''>Sesi akan di-hold selama <b>10 menit</b> setelah Anda masuk ke pembayaran.</p>
                </h2>
                {isLoading ? <h1>loading...</h1> :
                    <div className='w-full'>
                        {!isDateAvailable ?
                            <>
                                {/** create slot schedules instance here */}
                                {/* pesan tidak tersedia di sini */}
                                <h1 className='!text-red-600 p-4 opacity-70'>Lapangan tutup di tanggal ini, silahkan pilih tanggal lain.</h1>
                            </>
                            :
                            <>
                                {/* set slots di sini */}
                                <div className='relative grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2'>
                                    <div className='fixed w-fit h-fit flex justify-center items-center rounded-xl overflow-hidden px-2 ' style={{ left: mousePos.x, top: mousePos.y }}>
                                        <p className={`text-center content-center rounded-lg px-2  ${slotStatus !== 'available' ? 'bg-red-400/30 hover:bg-red-300' : 'bg-green-200/30 hover:bg-green-100 hover:shadow-[0px_0px_10px_rgba(0,0,0,0.5]'}`}
                                        >{slotStatus}</p>
                                    </div>
                                    {slots.length > 0 ? slots.map(slot => (
                                        <div
                                            onClick={() => {
                                                // TODO: set selected slot for booking
                                                const setSelect = !slot.selected;
                                                // set to global state
                                                setSlots(prevSelectedSlots => {
                                                    return prevSelectedSlots.map(item => {
                                                        if (item.startTimeString === slot.startTimeString) {
                                                            return { ...item, selected: setSelect };
                                                        }
                                                        return item;
                                                    });
                                                })

                                                if (slot.isBlocked || slot.isHold || slot.isBooked) return;
                                                setSelectedSlot(prevSelectedSlots => {
                                                    // Find index of the slot based on its startTime (assuming startTime is unique)
                                                    const existingIndex = prevSelectedSlots.findIndex(
                                                        item => Temporal.Instant.compare(item.startTime, slot.startTime) === 0
                                                    );

                                                    if (existingIndex > -1) {
                                                        // If it exists, return a new array without that slot
                                                        return prevSelectedSlots.filter((_, index) => index !== existingIndex);
                                                    }
                                                    // If it doesn't exist, return a new array with the new slot added
                                                    return [...prevSelectedSlots, { startTime: slot.startTime, endTime: slot.endTime }];
                                                })
                                            }}
                                            key={slot.startTimeString} onMouseEnter={() => {
                                                const status = slot.isBooked || slot.isHold || slot.isBlocked ? 'not-available' : 'available';
                                                setSlotStatus(status);
                                            }}>
                                            <div
                                                onMouseMove={(e) => {
                                                    mouseIn(e);
                                                }}
                                                onMouseLeave={(e) => {
                                                    mouseOut(e);
                                                }}
                                                key={slot.startTimeString}
                                                className={`p-5 text-center rounded-lg cursor-pointer transition-all border-2 duration-200 ease-in-out ${slot.selected ? 'border-green-500 bg-green-100' : 'border-gray-400'} ${slot.selected ? 'border-green-500' : 'border-gray-300'}  hover:border-green-500 hover:shadow-[0px_0px_10px_rgba(0,0,0,0.5]
                                                 ${slot.isBlocked || slot.isHold || slot.isBooked ? '!bg-gray-50 !border-gray-200 !hover:border-gray-400 !text-gray-500' : ''}`}
                                            >
                                                <p className={`${slot.isBlocked || slot.isHold || slot.isBooked ? '!text-gray-300' : '!text-gray-500'} font-extrabold `}>{slot.startTimeString} - {slot.endTimeString}</p>
                                                {!(slot.isBlocked || slot.isHold || slot.isBooked) ? <p className='text-sm !text-gray-500'>{numberToRupiah(String(slotPrice)).split(',')[0]}</p> : <p className='!text-gray-300 text-sm font-bold'>Terlewati</p>}
                                            </div>
                                        </div>
                                    )) : <p>Loading...</p>}

                                    {/* price section, show selected slot price and serve a payment button page if any available slot selected */}

                                </div>

                                {selectedSlot.length > 0 &&
                                    <div className='mt-3 z-39 px-7 py-4 rounded-xl bg-white shadow-[0px_0px_8px_rgba(0,0,0,0.1)] flex flex-col justify-between items-center '>
                                        <div className='flex justify-between items-center w-full'>
                                            <div> {/** slot taken info */}
                                                <h1 className='!text-gray-600'>Total Jadwal dipilih</h1>
                                                <h2 className='!text-green-500 text-lg font-bold'>{selectedSlot.length} Sesi</h2>
                                            </div>

                                            <div> {/* price info */}
                                                <h1 className='!text-gray-600'>Total harga</h1>
                                                <h2 className='!text-green-500 text-lg'>{numberToRupiah(String(selectedSlot.length * slotPrice)).split(',')[0]}</h2>
                                            </div>
                                        </div>

                                    </div>
                                }
                            </>
                        }

                    </div>
                }
            </div>
            {selectedSlot.length > 0 &&
                <div className='w-full flex justify-end items-center px-10'>
                    <button onClick={() => { handlePaymentPageButton() }} className='flex justify-end gap-2 !text-white font-bold  items-center p-2 px-3 w-fit rounded-xl bg-green-700 hover:bg-green-600 transition-color duration-150 cursor-pointer' type='button'> {/** payment button */}
                        Lanjut Pembayaran <i className='fa-solid fa-arrow-right !text-white '></i>
                    </button>
                </div>
            }
        </div>
    </>)
}