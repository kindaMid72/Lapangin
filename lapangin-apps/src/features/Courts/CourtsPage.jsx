

'use client';
// store
import useVenueStore from '@/shared/stores/venueStore';
import useSessionStore from '@/shared/stores/authStore';

import axios from 'axios';
import { useEffect, useState } from 'react';

// components
import CourtCard from "@/features/Courts/components/CourtCard";
import NewCourtPage from "./NewCourtPage";

export default function CourtsPage() {
    // stores
    const { activeVenue } = useVenueStore();
    const { session, fetchSession } = useSessionStore();

    // local state
    const [showNewCourtModal, setShowNewCourtModal] = useState(false);
    const [courts, setCourts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchCourts = async () => {
        // TODO: fetch court info for venues from database
        setIsLoading(false);
    };

    useEffect(() => {

    }, []);


    if (isLoading) return <div className="p-6">Loading courts...</div>

    return (
        <>
            <div className="flex items-center justify-between pt-5 px-6 py-3">
                <h1 className="font-bold text-xl flex-1">Kelola Lapangan</h1>
                <button onClick={() => setShowNewCourtModal(true)} className="border-2 rounded-xl px-3 p-1 bg-green-800 font-extrabold border-transparent hover:bg-green-700 transition-colors duration-300 ease-in-out">+ Tambah Lapangan</button>
            </div>
            <div className="flex justify-start flex-wrap gap-4 m-4">
                {courts.map(court => (
                    <CourtCard key={court.court_id} namaLapangan={court.name} durasiSlot={court.slot_duration} />
                ))}
            </div>
            {showNewCourtModal && <NewCourtPage show={showNewCourtModal} onClose={() => setShowNewCourtModal(false)} onCourtAdded={fetchCourts} />}
        </>
    );
}