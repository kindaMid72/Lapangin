"use client";
// libs
import api from "@/utils/axiosClient/axiosInterceptor.js";


/**
 * TODO: create a button to go to venues invites page
 */
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// components
import VenueInvitePage from "./VenueInvitePage.jsx";


// store
import useAuthStore from "@/shared/stores/authStore.js";
import useVenueStore from "@/shared/stores/venueStore.js";

export default function Venues() {
    const { session, fetchSession } = useAuthStore();
    const { activeVenue, setActiveVenue, getVenueMetadata } = useVenueStore();


    const router = useRouter();
    const params = useParams();

    // state
    const [venues, setVenues] = useState([]); // store active venues for that user
    const [isLoading, setIsLoading] = useState(true); // Tambahkan state loading
    const [error, setError] = useState(null);

    const [showInvite, setShowInvite] = useState(false);
    const [thereIsAnInvite, setThereIsAnInvite] = useState(false);

    // fetching handler
    useEffect(() => {
        // fetch (venue_name, venue_id, role(user role))
        // AbortController untuk membatalkan request jika komponen unmount
        const controller = new AbortController();

        async function checkForInvites() {
            if (!session) return;
            try {
                await api.get('/user_venues/check_invite')
                    .then(res => res.data.result)
                    .then(result => setThereIsAnInvite(result))
            } catch (err) {
                console.error(err)
            }
        }

        async function fetchVenues() {
            if (session) {
                setIsLoading(true);
                setError(null);
                try {
                    const response = await api.get(`/user_venues/get_all_user_venues`, {
                        signal: controller.signal // Kaitkan AbortController
                    })
                        .then(response => {
                            const venuesData = Object.values(response?.data?.data || {});
                            setVenues(venuesData);
                        })
                } catch (err) {
                    if (axios.isCancel(err)) {
                        console.log('Request canceled:', err.message);
                    } else {
                        setError(err.message || "Failed to fetch venues.");
                        console.error(err);
                    }
                } finally {
                    setIsLoading(false);
                }
            } else {
                fetchSession(); // update session, dan biarkan session baru trigger fetching baru
            }
        }

        checkForInvites();
        fetchVenues();

        // Cleanup function
        return () => controller.abort();

    }, [session]); // TODO: subscribe to that user_venues tabel for changes

    const handleSelectVenue = (venueId, venueName, role) => {
        const { user_id } = params;
        // Here you would typically store the selected venue in a global state (Context, Redux, Zustand)
        // and then navigate to the main dashboard or the next step.
        setActiveVenue({
            venueId: venueId,
            venueName: venueName,
            userRole: role,
            userId: user_id,
            userEmail: session.user.email
        });
        getVenueMetadata(venueId);

        router.replace(`/${user_id}/${venueId}/dashboard`);
    };

    if (isLoading) return <div className="flex items-center justify-center min-h-screen opacity-30">Loading venues...</div>;
    if (error) return <div className="flex items-center justify-center min-h-screen text-red-500">Error: {error}</div>;

    return (
        <>
            {showInvite && <VenueInvitePage onClose={() => setShowInvite(false)} />}
            {/* invite section */}
            <div onClick={() => { setShowInvite(true); }} className="cursor-pointer size-10 z-50 fixed top-3 right-3 rounded-full group flex justify-center items-center dark:bg-gray-700 bg-gray-400 ">
                <div className="relative">
                    {thereIsAnInvite && <div className="size-2 absolute bg-red-400 z-39 rounded-full -top-[10px] -right-[26px]"> </div>}
                </div>
                <i className={`fa-solid fa-envelope text-xl text-gray-400 group-hover:text-green-400 transition-colors duration-100 ease-in `}></i>
            </div>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-mono">
                <div className="container mx-auto flex flex-col md:flex-row md:h-screen">
                    {/* Left Section / Header */}
                    <div className="w-full md:w-1/3 flex flex-col justify-center items-center p-8 text-center bg-white dark:bg-gray-800 md:bg-gray-900 md:text-white rounded-b-2xl md:rounded-none shadow-lg md:shadow-none">
                        <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Pilih CourtSpace</h1>
                        <p className="text-gray-600 dark:text-gray-400">Pilih tempat untuk dikelola.<br />Anda hanya bisa bergabung dengan invitasi.</p>
                    </div>

                    {/* Right Section / Venue List */}
                    <div className="w-full md:w-2/3 p-6 md:p-10 flex flex-col">
                        <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto scrollbar-hide">
                            {venues.map((item) => (
                                <div key={item.venue_id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col justify-between shadow hover:shadow-lg transition-shadow">
                                    <div>
                                        <h2 className="text-xl font-bold mb-1 text-gray-900 dark:text-white truncate">{item.venue_name}</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Peran Anda: {item.role}</p>
                                    </div>
                                    <button
                                        onClick={() => handleSelectVenue(item.venue_id, item.venue_name, item.role)}
                                        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg cursor-pointer hover:bg-green-700 transition-colors font-semibold"
                                    >
                                        Pilih
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 text-center">
                            <button onClick={() => router.push(`/${params.user_id}/new_vanue`)} className="w-full md:w-auto bg-transparent border-2 cursor-pointer border-green-600 text-green-600 dark:text-green-400 dark:border-green-400 px-8 py-3 rounded-lg font-bold hover:bg-green-600 hover:text-white dark:hover:bg-green-400 dark:hover:text-gray-900 transition-all duration-150">
                                + Buat CourtSpace Baru
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}