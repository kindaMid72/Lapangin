'use client'

// imports
import { useEffect, useState, useRef } from "react"
import minuteRestriction from "@/utils/inputRestriction/minuteRestriction"
import api from "@/utils/axiosClient/axiosInterceptor.js";
import {Temporal} from '@js-temporal/polyfill';

// stores
import useCourtStore from "@/shared/stores/courtStore"
import useVenueStore from "@/shared/stores/venueStore"

// components
import ConfirmationMessage from "@/features/components/ConfirmationMessage";

// return a componenet wher use can edit an existing slots

export default function SlotCard({selectedDate, courtId, schedule, onClose, onConfirm}) { // schedule is an object of selected schedule to edit
    const { courts } = useCourtStore();
    const { activeVenue, venueMetadata, getVenueMetadata } = useVenueStore();

    // state, assign value from schedule here
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [status, setStatus]= useState('');

    const [confirmDelete, setConfirmDelete] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if(schedule){ // set initial state from schedule
            setStartTime(schedule.start_time.toString().slice(11,16));
            setEndTime(schedule.end_time.toString().slice(11,16));
            setStatus(schedule.status);
        }
    }, [schedule])
    useEffect(() => {
        if(!venueMetadata) getVenueMetadata(activeVenue.venueId); // dapatkan id
    }, [])

    async function handleUpdateSchedule(){
        // TODO: config reqeust for update for given shedule id (slot_instances)
        if(!activeVenue && !venueMetadata){
            await getVenueMetadata(activeVenue.venueId);
            setError('Venue metadata not found, try refresh the page');
            return;
        }
        try{
            setIsLoading(true);
            setError(null);
            const readyStartTime = Temporal.PlainDateTime.from(`${selectedDate}T${startTime}`).toZonedDateTime(venueMetadata.timezone);
            const readyEndTime = Temporal.PlainDateTime.from(`${selectedDate}T${endTime}`).toZonedDateTime(venueMetadata.timezone);
            
            await api.put(`/courtAvailability/update_court_schedule/${activeVenue.venueId || venueMetadata.id}/${schedule.id}`,{
                startTime: readyStartTime,
                endTime: readyEndTime,
                status: status,
            })
            .then(() => {
                setIsLoading(false);
                onConfirm();
                onClose();
                setError(null);
            })
            .catch(err => {
                setError('update failed, please try again')
                console.error(err);
            })
            .finally(() => {
                setIsLoading(false);
            })
        }catch(err){
            console.error(err);
        }

    }
    async function handleDeleteSchedule(){
        // TODO: config reqeust for delete for given shedule id (slot_instances)
        if(!activeVenue && !venueMetadata){
            await getVenueMetadata(activeVenue.venueId);
            setError('Venue metadata not found, try refresh the page');
            return;
        }
        try{
            setIsLoading(true);
            setError(null);
            
            await api.delete(`/courtAvailability/delete_court_schedule/${activeVenue.venueId || venueMetadata.id}/${schedule.id}`)
            .then(() => {
                setIsLoading(false);
                onConfirm();
                onClose();
                setError(null);
            })
            .catch(err => {
                setError('update failed, please try again')
                console.error(err);
            })
            .finally(() => {
                setIsLoading(false);
            })
        }catch(err){
            console.error(err);
        }
    }


    

    return(<>
        {confirmDelete && <ConfirmationMessage // confirmation card for deletion
            onCancel={() => setConfirmDelete(false)}
            onConfirm={() => handleDeleteSchedule()}
            title={"Hapus Sesi Ini"}
            message={"Apakah anda yakin ingin menghapus sesi ini?"}
            confirmColor="red"
            delayConfirm={true}
            delaySecond={1}
            delayCancel={false}
            
        />}

        <div className='flex relative border-1 border-gray-600 flex-col gap-2 rounded-lg p-3 w-full z-46'>
            <i onClick={() => { onClose(); }} className='fa-solid fa-xmark absolute right-3 top-3 cursor-pointer hover:text-red-400 transition-colors duration-100 ease-in'></i>
            <h2 className="font-extrabold text-[0.9em]">Edit Sesi: </h2>
            <div className='flex w-fit gap-3'>
                <div className='flex gap-3 items-center'>
                    <label className='text-[0.9em]'>Mulai:</label>
                    <input value={startTime} onChange={(e) => { setStartTime(minuteRestriction(e.target.value)) }} type="time" className='px-3 py-1 rounded-lg border-1 border-gray-600'></input>
                </div>
                <div className='flex gap-3 items-center'>
                    <label className='text-[0.9em]'>Akhir:</label>
                    <input value={endTime} onChange={(e) => { setEndTime(minuteRestriction(e.target.value)) }} type="time" className='px-3 py-1 rounded-lg border-1 border-gray-600'></input>
                </div>
            </div>
            <div className='flex gap-3 items-center'>
                <label className='text-[0.9em]'>Status: </label>
                <select value={status} onChange={(e) => { setStatus(e.target.value) }} className='px-3 py-1 rounded-lg border-1 border-gray-600'>
                    <option className='bg-gray-700 text-white' value='held'>held</option>
                    <option className='bg-gray-700 text-white' value='booked'>booked</option>
                    <option className='bg-gray-700 text-white' value='blocked'>blocked</option>
                </select>
                <div className="flex-1 flex flex-col justify-end items-end">  
                    <p className="text-red-500 h-6">{error}</p>
                    <div className="flex-1 flex justify-end items-center gap-2">
                        <div className='flex justify-end items-center'>
                            <button type='button' disabled={isLoading} onClick={() => { setConfirmDelete(true); }} className='px-3 py-1 bg-red-800 rounded-lg hover:bg-red-700 cursor-pointer transition-colors font-extrabold duration-100'>{isLoading ? 'loading...' : 'Hapus'}</button>
                        </div>
                        <div className=' flex justify-end items-center'>
                            <button type='button' disabled={isLoading} onClick={() => {  handleUpdateSchedule(); }} className='px-3 py-1 bg-green-800 rounded-lg hover:bg-green-700 cursor-pointer transition-colors font-extrabold duration-100'>{isLoading ? 'loading...' : 'Simpan'}</button>
                        </div>
                    </div>
                </div>
                </div>
        </div>
    
    
    </>)
}