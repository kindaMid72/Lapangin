"use client";
// libs
/**
 * TODO: add skeleton loading to the loading element
 * TODO: add subscribe to user_venue table for changes
 * TODO: config new routing system that accept venue ids as part of its path
 */
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";


// store
import useAuthStore from "@/shared/stores/authStore.js";
import useVenueStore from "@/shared/stores/venueStore.js";

export default function Venues() {
    const { session, fetchSession } = useAuthStore();
    const { activeVenue, setActiveVenue } = useVenueStore();


    const router = useRouter();
    const params = useParams();

    // state
    const [venues, setVenues] = useState([]); // store active venues for that user
    const [isLoading, setIsLoading] = useState(true); // Tambahkan state loading
    const [error, setError] = useState(null);

    // fetching handler
    useEffect(() => {
        // fetch (venue_name, venue_id, role(user role))
        // AbortController untuk membatalkan request jika komponen unmount
        const controller = new AbortController();

        const token = session?.access_token;

        async function fetchVenues() {
            if (token) {
                setIsLoading(true);
                setError(null);
                try {
                    const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_API_URL}/user_venues/get_all_user_venues`, {
                        headers: { 'Authorization': `Bearer ${token}` },
                        signal: controller.signal // Kaitkan AbortController
                    });
                    const venuesData = Object.values(response?.data.data || {});
                    setVenues(venuesData);
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

        fetchVenues();

        // Cleanup function
        return () => controller.abort();

    }, [session]); // TODO: subscribe to that user_venues tabel for changes

    const handleSelectVenue = (venueId, venueName, role, userId) => {
        const { user_id } = params;
        console.log(session);
        // Here you would typically store the selected venue in a global state (Context, Redux, Zustand)
        // and then navigate to the main dashboard or the next step.
        setActiveVenue({ venueId: venueId, venueName: venueName, userRole: role, userId: user_id });

        router.replace(`/${user_id}/${venueId}/dashboard`);
    };

    if (isLoading) return <div className="flex items-center justify-center min-h-screen opacity-30">Loading venues...</div>;
    if (error) return <div className="flex items-center justify-center min-h-screen text-red-500">Error: {error}</div>;

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-800 font-mono p-1 md:p-0 md:rounded-none ">
            <div className="flex min-w-2xl p-8 md:p-0 md:w-full md:h-screen md:relative bg-white dark:bg-gray-900 dark:md:bg-gray-800 rounded-xl shadow-lg flex-col md:flex-row">
                <div className="flex flex-col md:w-2/3 md:px-4 md:rounded-r-2xl md:[box-shadow:0px_0px_10px_#3b474e] items-center md:justify-center w-fit md:bg-gray-900 ">
                    <h1 className="text-4xl font-extrabold text-center mb-2">Select Your Venue</h1>
                    <p className="text-gray-600 md:text-gray-400 text-center mb-8">Choose a venue to manage or create new.<br></br>You can only enter an existed vanue by invitations.</p>
                </div>

                <div className="flex flex-col md:py-5 md:flex-row md:flex-wrap md:items-start content-start items-center justify-center w-full gap-6 md:h-full overflow-auto scrollbar-hide">
                    {venues.map((item) => (
                        <div key={item.venue_id} className="border w-full md:w-1/3 cursor-pointer rounded-lg dark:border-gray-600  p-4 flex flex-col items-center hover:shadow-md transition-shadow">
                            <h2 className="text-xl font-bold mb-4 text-nowrap text-ellipsis overflow-hidden w-full">{item.venue_name}</h2>
                            {/* <h3 className=" w-full pb-3 font-[100] font-gray-600 italic text-[0.9em] text-start">{item.role}</h3> */}
                            <button
                                onClick={() => handleSelectVenue(item.venue_id, item.venue_name, item.role)}
                                className="w-full bg-green-700 cursor-pointer text-white py-2 px-4 rounded-lg hover:bg-green-800 transition-colors font-semibold"
                            >
                                Select
                            </button>
                        </div>
                    ))}

                    <div onClick={() => {
                        router.push(`/${params.user_id}/new_vanue`)
                    }} className=" md:absolute md:bottom-30 md:left-28 md:w-fit border-1 border-gray-700 w-full text-xl font-extrabold cursor-pointer rounded-lg p-4 flex flex-col items-center hover:shadow-md hover:bg-green-800 hover:border-transparent transition-all duration-100 ease-in-out hover:text-white">
                        <p>Create New Vanue</p>
                    </div>
                </div>
            </div>
        </div>
    );
}