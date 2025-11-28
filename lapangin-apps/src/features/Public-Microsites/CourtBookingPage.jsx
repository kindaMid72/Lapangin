'use client'

import { Temporal } from '@js-temporal/polyfill';

import React, {useEffect, useRef, useState} from 'react';

// compontes
import SlotCard from './components/SlotCard';

// api
import { getSelectedDateException, getSlotsForSelectedDate } from '@/Apis/booking/courtMicrositeAvailability';
import { useParams } from 'next/navigation';

export default function BookingPage(){
    const params = useParams();

    
    const [isDateAvailable, setIsDateAvailable] = useState(true);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // data state    
    const [selectedDate, setSelectedDate] = useState((new Date()).toISOString().split('T')[0]);
    const [slots, setSlots] = useState([]); // array of object (object -> {start_time, end_time, status)
    

    // ui state
    const [mousePos, setMousePos] = useState({x: -9999999, y: -9999999})
    const [slotStatus, setSlotStatus] = useState('');
    /**
     * to create slot instance, fetch startTime, endTime, slotInstance
     */

    // components


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
        if(!dateAvailable) return;
        getSlotsForSelectedDate(params.venue_id, params.court_id, selectedDate)
            .then(res => {
                // TODO: set slots view based on data
                let {courtSchedules, openTime, closeTime, slotDuration, timezone} = res;

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
                courtSchedules = courtSchedules.sort((a, b) => {
                    return Temporal.PlainTime.compare(a.startTime, b.startTime);
                })
                let nonAvailPointer = 0; // this will point to a valid courtSchedules element 

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
                    const tempSlotStart = Temporal.PlainDateTime.from(`${selectedDate}T${startSlot.toString({ smallestUnit: 'second' })}`).toZonedDateTime(timezone);
                    const tempSlotEnd = Temporal.PlainDateTime.from(`${selectedDate}T${slotEnd.toString({ smallestUnit: 'second' })}`).toZonedDateTime(timezone);
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
                        startTime: startSlot,
                        endTime: slotEnd,
                        startTimeString: startSlot.toString().slice(0, 5),
                        endTimeString: slotEnd.toString().slice(0, 5),
                        isBooked: status === 'booked', // set slot status based on status been setted
                        isBlocked: status === 'blocked',
                        isHold: status === 'held'
                    })
                }
                console.log(slotTemp);
                setSlots(slotTemp);

                // set slot status based on nonAvailable slots

            })
            .catch(err => {
                setError(err);
            })
            .finally(() => {
                setIsLoading(false);
            })


    }, [selectedDate])

    // ui handler
    const mouseIn = (event) =>{
        setMousePos({x: event.clientX, y: event.clientY})
    }
    const mouseOut = (event) => {
        setMousePos({x: -9999999, y: -9999999});
    }

    
    return (<>
        <div className="[&_*]:text-black w-full min-h-screen flex flex-col items-center justify-start p-4 px-12 gap-5">
            <div className='w-full flex flex-col justify-between gap-4'> {/* navigation section */}
                <button className="flex items-center justify-start gap-2"><i className="fa-solid fa-arrow-left"></i>Kembali</button>
                <div>
                    <h1>Lapangan Futsal 1</h1>
                    <h3>Pilih tanggal dan sesi yang Anda inginkan.</h3>
                </div>
            </div>
            
            {/** date selection section */}
            <div className="w-full flex flex-col items-start justify-center p-4 rounded-2xl shadow-[0_0_25px_rgba(0,0,0,0.2)] bg-white gap-3"> {/* date selection */}
                <h1 className='px-2 '>Pilih Tanggal</h1> 
                <div className='w-full p-2 py-3 rounded-xl flex items-center justify-stretch border-1 border-gray-300 focus-within:border-green-800 '>
                    <input type={'date'} value={selectedDate} onChange={(e) => {setSelectedDate(e.target.value);}} className=' border-gray-500  rounded-xl'></input>
                </div>
            </div>

            {/** schedule selection section */}
            <div className="w-full flex flex-col items-start justify-center p-5 rounded-2xl shadow-[0_0_25px_rgba(0,0,0,0.2)] bg-white gap-3"> {/* date selection */}
                <h1 className='px-2 '>Pilih Sesi Waktu</h1> 
                <h2 className='flex gap-2 justify-start items-center px-2 py-3 rounded-xl border-[#fdeec6] border-[1px] bg-[#fefaef] w-full'>
                    <i className='fa-regular fa-clock'></i>
                    <p className=''>Slot akan di-hold selama <b>10 menit</b> setelah Anda masuk ke pembayaran.</p>
                </h2>
                {isLoading? <h1>loading...</h1>: 
                    <div>
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
                                <div className='fixed w-fit h-fit flex justify-center items-center rounded-xl overflow-hidden p-2 ' style={{left: mousePos.x, top: mousePos.y}}>
                                    <p  className={`text-center content-center rounded-xl p-2 ${slotStatus === 'booked' ? 'bg-orange-400 hover:bg-orange-300' : ''} ${slotStatus === 'blocked' ? 'bg-red-600 line-through hover:bg-red-500' : ''} ${slotStatus === 'held'? 'bg-yellow-400 hover:bg-yellow-300' : 'bg-gray-100 hover:bg-green-100 hover:shadow-[0px_0px_10px_rgba(0,0,0,0.5]'}`}
                                    >{slotStatus}</p>
                                </div>
                                {slots.length > 0 ? slots.map(slot => (
                                    <div key={slot.startTimeString} onMouseEnter={() => {
                                            const status = slot.isBooked ? 'booked' : slot.isBlocked ? 'blocked' : slot.isHold ? 'held' : 'free';
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
                                            className={`p-5 text-center rounded-lg cursor-pointer transition-all duration-200 ease-in-out ${slot.isBooked ? 'bg-orange-400 hover:bg-orange-300' : ''} ${slot.isBlocked ? 'bg-red-600 line-through hover:bg-red-500' : ''} ${slot.isHold ? 'bg-yellow-400 hover:bg-yellow-300' : 'bg-gray-100 hover:bg-green-100 hover:shadow-[0px_0px_10px_rgba(0,0,0,0.5]'}`}
                                        >
                                            {slot.startTimeString} - {slot.endTimeString}
                                        </div>
                                    </div>
                                )) : <p>Loading...</p>}

                            </div>
                        </>
                        }
                    
                    </div>
                }
            </div>
        </div>
    </>)
}