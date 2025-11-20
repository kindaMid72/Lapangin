'use client'
import React, {useEffect, useRef, useState} from 'react';

// compontes
import SlotCard from './components/SlotCard';

// api
import { getSelectedDateException } from '@/Apis/booking/courtMicrositeAvailability';
import { useParams } from 'next/navigation';

export default function BookingPage(){
    const params = useParams();

    const [selectedDate, setSelectedDate] = useState((new Date()).toISOString().split('T')[0]); // TODO: venue timezome, config later, fetch timezone from database

    const [isDateAvailable, setIsDateAvailable] = useState(true);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    /**
     * to create slot instance, fetch startTime, endTime, slotInstance
     */

    // components


    useEffect(() => {
        // 1. check if selected date is available for booking, if not avail, return an error message
        getSelectedDateException(params.court_id, selectedDate)
            .then(res => {
                setIsDateAvailable(res);
            })
            .catch(err => {
                setError(err);
            })
            .finally(() => {
                setIsLoading(false);
            })

        // 2. check for exsited schedules (booked, held, blocked, or free(default))


    }, [selectedDate])

    
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
                        {!isDateAvailable ? <h1>not available</h1>:
                            <div> yes, this avail</div>
                        
                        }
                        {/** create slot schedules instance here */}

                    </div>
                }
            </div>
        </div>
    </>)
}