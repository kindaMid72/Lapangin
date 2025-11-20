'use client'

import { useRouter, usePathname, useParams } from 'next/navigation';

import defaultCourtImage from '../../../shared/assets/CourtPictureDefault.png';
export default function CourtViewCard({ props }) {
    /**
     * court name
     * slot duration
     * type (not yet configure)
     * price (select lowest)
     *  
    */
    const router = useRouter();
    const params = useParams();
    const path = usePathname();


    const id = props?.id;
    const courtName = props?.name;
    const slotDuration = props?.slotDuration;
    const type = props.type || 'sport'; // config this later
    const price = props.startPrice;
    
    const courtPicture = props.picture || defaultCourtImage.src; // not yet configure (urls of a pictures, default stock image)

    // handler
    function handleOpenCourtSchedules(courtId) {
        router.push(`${path}/${courtId}`); // navigate ke halaman booking court
    }
    

    return (<>
        <div className="bg-white [&_*]:text-black dark:text-black dark:bg-g rounded-lg shadow-lg overflow-hidden transform transition-all hover:drop-shadow-2xl w-80 m-4">
            {courtPicture && <img src={courtPicture} alt={`Picture of ${courtName}`} className="w-full h-48 object-cover"></img>}

            <div className="p-4">
                <h1 className="text-2xl font-bold text-gray-900 truncate">{courtName}</h1>
                <p className="text-sm text-gray-700  capitalize mb-2">Tipe: {type}</p>

                <div className="flex items-center text-gray-700 dark:text-gray-300 mb-4">
                    <i className="fa-solid fa-stopwatch mr-2"></i>
                    <span>Durasi per sesi: {slotDuration} Menit</span>
                </div>

                <div className="flex justify-between items-center">
                    <div className='flex flex-col'>
                        <h3 className='font-extralight text-sm'>Mulai dari</h3>
                        <h3 className="text-xl text-emerald-900 font-semibold ">Rp {price.toLocaleString('id-ID')}</h3>
                    </div>
                    <button onClick={() => { handleOpenCourtSchedules(id);}} className="cursor-pointer rounded-lg px-4 py-2 bg-green-800 !text-white font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-opacity-50 transition-colors">
                        Lihat Jadwal
                    </button>
                </div>
            </div>
        </div>
    </>)
}