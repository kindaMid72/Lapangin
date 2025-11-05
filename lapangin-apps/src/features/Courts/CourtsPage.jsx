'use client';

// utils
import api from '@/utils/axiosClient/axiosInterceptor.js';

// store
import useVenueStore from '@/shared/stores/venueStore';
import useSessionStore from '@/shared/stores/authStore';

import axios from 'axios';
import { useEffect, useState } from 'react';

// components
import CourtCard from "@/features/Courts/components/CourtCard";
import NewCourtPage from "./NewCourtPage";
import EditCourtPage from './courtEditPage';
import CourtSchedulePage from './CourtSchedulePage.jsx';

export default function CourtsPage() {
    // stores
    const { activeVenue } = useVenueStore();
    const { session, fetchSession } = useSessionStore();

    // local state
    const [showNewCourtModal, setShowNewCourtModal] = useState(false);
    const [showEditCourtModal, setShowEditCourtModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [selectedCourt, setSelectedCourt] = useState(null);
    const [courts, setCourts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchCourts = async () => {
        // TODO: fetch court info for venues from database
        setIsLoading(false);
    };

    useEffect(() => {
        // fetch all court for this venue
        fetchSession(); // update the session for each request
        fetchCourts();
        
        async function fetchCourts(){
            // this function will return all court metadata for this venue
            /** ON EDIT, set:
             * 1. court name
             * 2. court duration (30, 60) hanya hari yang belum di generate slotnya yang akan bisa di edit, (slot yang sudah di generate berada paling lama 2 minggu)
             * 3. court capacity 
             * 4. court image (not yet)
             * 5. weekday slot price
             * 6. weekend slot price
             * 7. availability rules for every day of week (monday to sunday), user can config open and close time for each day
             * 8. court active (true or false, use toggle button)
             * 
             */

            /** ON ATUR JADWAL, set:
             * - show date selection
             *      - for every date, show availability from slots instance
             *      - if slot not yet genereated, return message, not yet generated
             * - add option to block date (and unblock) (no activity will accured that day), first check if there is a ordered slots there
             * -
             */
        }

    }, [activeVenue]);

    const handleEditClick = (court) => {
        setSelectedCourt(court);
        setShowEditCourtModal(true);
    };

    const handleScheduleClick = (court) => {
        setSelectedCourt(court);
        setShowScheduleModal(true);
    };




    if (isLoading) return <div className="p-6">Loading courts...</div>

    return (
        <>
            <div className="flex items-center justify-between pt-5 px-6 py-3">
                <h1 className="font-bold text-xl flex-1">Kelola Lapangan</h1>
                <button onClick={() => setShowNewCourtModal(true)} className="border-2 rounded-xl px-3 p-1 bg-green-800 font-extrabold border-transparent hover:bg-green-700 transition-colors duration-300 ease-in-out">+ Tambah Lapangan</button>
            </div>
            <div className="flex justify-start flex-wrap gap-4 m-4">
                {courts.map(court => (
                    <CourtCard
                        key={court.id}
                        court={court}
                        onEdit={handleEditClick}
                        onSchedule={handleScheduleClick}
                    />
                ))}
            </div>
            {showNewCourtModal && <NewCourtPage show={showNewCourtModal} onClose={() => setShowNewCourtModal(false)} onCourtAdded={fetchCourts} />}
            {showEditCourtModal && <EditCourtPage
                court={selectedCourt}
                show={showEditCourtModal}
                onClose={() => setShowEditCourtModal(false)}
                onCourtUpdated={fetchCourts} />}
            {showScheduleModal && <CourtSchedulePage
                court={selectedCourt}
                show={showScheduleModal}
                onClose={() => setShowScheduleModal(false)} />}
        </>
    );
}