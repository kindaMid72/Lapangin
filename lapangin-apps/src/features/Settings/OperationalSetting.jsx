'use client'

//imports
import React, {useState, useEffect} from 'react';


// components
import ToggleButton from './components/ToggleButton';

export default function OperationalSetting(){

    const [weekdays, setWeekdays] = useState(true);
    const [weekend, setWeekend] = useState(false);

    return(<>
    <div className="p-3 ">
        <div className="rounded-xl bg-gray-300 text-black dark:text-white dark:bg-gray-900 p-4">
            <h1 className='text-xl font-extrabold p-3'>Jam Operasional</h1>
            <div className='flex flex-col justify-between items-center p-3'>
                <div className='w-full flex justify-between items-center'>
                    <div className=''>
                        <p className='font-bold'>Hari Kerja (Senin- Jumat)</p>
                        <p className='font-extralight text-sm'>Atur jam operasional hari kerja</p>
                    </div>
                    <ToggleButton isActive={weekdays} onClick={() => {setWeekdays(!weekdays)}} className=''/>
                </div>
                {/* hour section  */}
                <div className='flex w-full flex-wrap justify-evenly gap-2 p-4'>
                    <div className='flex flex-col flex-1'>
                        <p>Jam buka</p>
                        <input type='time' value={''} onChange={() => {}} className='outline-1 outline-gray-500 rounded-lg p-1 w-full'></input>
                    </div>
                    <div className='flex flex-col flex-1  '>
                        <p>Jam buka</p>
                        <input type='time' value={''} onChange={() => {}} className='outline-1 outline-gray-500 rounded-lg p-1 w-full'></input>
                    </div>
                </div>
            </div>
            <hr className='text-gray-400 my-5'></hr>
            <div className='flex justify-between items-center p-3'>
                <div>
                    <p className='font-bold'>Akhir Pekan (Sabtu - Minggu)</p>
                    <p className='font-extralight text-sm'>Atur jam operasional akhir pekan</p>
                </div>
                <ToggleButton isActive={weekend} onClick={() => {setWeekend(!weekend)}} className=''/>
            </div>
            {/* hour section  */}
            <div className='flex w-full flex-wrap justify-evenly gap-2 p-4'>
                <div className='flex flex-col flex-1'>
                    <p>Jam buka</p>
                    <input type='time' value={''} onChange={() => {}} className='outline-1 outline-gray-500 rounded-lg p-1 w-full'></input>
                </div>
                <div className='flex flex-col flex-1  '>
                    <p>Jam buka</p>
                    <input type='time' value={''} onChange={() => {}} className='outline-1 outline-gray-500 rounded-lg p-1 w-full'></input>
                </div>
            </div>
        </div>
    </div>
        
    </>)
}