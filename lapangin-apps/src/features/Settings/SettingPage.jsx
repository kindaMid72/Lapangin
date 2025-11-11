'use client'

// imports
import { useState } from 'react'


// dynamic setting page
import PaymentSetting from './PaymentSetting'
import VanueSetting from './VanueSetting'

// stores 
import useVenueStore from '@/shared/stores/venueStore';

export default function SettingPage() {

    const {getVenueMetadata} = useVenueStore();

    // state
    const [selectedSetting, setSelectedSetting] = useState('vanue');

    // ui handler

    function handleSetActiveSetting(e) {
        e.target.classList.add('active');
    }

    const baseTabClass = "border-1 border-gray-600 cursor-pointer hover:bg-green-700 hover:border-transparent transition-colors duration-75 ease-in px-3 py-1 rounded-xl";
    const activeTabClass = "bg-green-700 border-transparent";


    return (<>
        <div className="p-5">
            <h1 className="text-2xl font-extrabold">Pengaturan</h1>
            <p className="font-extralight text-sm">Kelola pengaturan vanue dan sistem anda.</p>
        </div>

        <div> {/* navbar section */}
            <ol className="flex flex-wrap justify-evenly items-center">
                <li onClick={() => {setSelectedSetting('vanue');}} className={`${baseTabClass} ${selectedSetting === 'vanue' ? activeTabClass : ''}`}>Vanue</li>
                <li onClick={() => setSelectedSetting('payment')} className={`${baseTabClass} ${selectedSetting === 'payment' ? activeTabClass : ''}`}>Pembayaran</li>
            </ol>
        </div>

        <div> {/* dynamic setting section */}
            {selectedSetting === 'vanue' && <VanueSetting />}
            {selectedSetting === 'payment' && <PaymentSetting />}
        </div>


    </>)
}