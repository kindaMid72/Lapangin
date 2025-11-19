"use client";
// libs


import { useEffect, useState } from "react";

// store
import useAuthStore from "@/shared/stores/authStore.js";
import useVenueStore from "@/shared/stores/venueStore.js";

// utils
import api from "@/utils/axiosClient/axiosInterceptor.js";

export default function VenueInvite({ onClose }) {
    const { session, fetchSession } = useAuthStore();
    const { activeVenue, setActiveVenue, getVenueMetadata } = useVenueStore();



    // state
    const [invites, setInvites] = useState([]); // store active venues for that user
    const [isLoadingFetch, setIsLoadingFetch] = useState(true); // Tambahkan state loading
    const [isLoading, setIsLoading] = useState(false); // Tambahkan state loading
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!session) { // make sure there ia a valid session before fetching invites, because email is required for fetching invites
            fetchSession();
            return;
        }
        fetchInvites();
    }, [session]);

    // handler
    async function fetchInvites() {
        // fetch from venue_invites (venue_name, venue_id, role(user role)
        const email = session?.user.email;

        await api.get(`/user_venues/get_venue_invites/${email}`)
            .then((response) => {
                setInvites(response.data.data);
            })
            .catch((err) => {
                setError(err.message);
            })
            .finally(() => {
                setIsLoadingFetch(false);
            })

    }
    async function handleAcceptInvite(invited_token) {
        setIsLoading(true);
        await api.post(`/user_venues/accept_invite/${invited_token}`)
            .then(response => {
                if (response.status === 200) {
                    console.log('conrats, you now a part of the team');
                }
            })
            .catch(err => {
                setError(err.message);
            })
            .finally(() => {
                setIsLoading(false);
                fetchInvites();
            })

    }
    async function handleRejectInvite(invited_token) {
        setIsLoading(true);
        await api.put(`/user_venues/reject_invite/${invited_token}`)
            .then(response => {
                if (response.status === 200) {
                    console.log('conrats, you now a part of the team');
                }
            })
            .catch(err => {
                setError(err.message);
            })
            .finally(() => {
                setIsLoading(false);
                fetchInvites();
            })
    }

    if (error) return <div className="flex items-center justify-center min-h-screen text-red-500">Error: {error}</div>;

    return (
        <>
            <div onClick={() => { onClose(); }} className="fixed w-full h-full bg-gray-900/50 z-48"></div>
            <div className="flex flex-col fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-49 w-full max-w-md max-h-[80vh] dark:bg-gray-900 p-7 rounded-xl gap-4">
                <div className="flex items-center justify-end w-full"> {/* xmark button, back to main page, trigger onclose */}
                    <h1 className="flex-1 text-2xl font-extrabold">Invitation</h1>
                    <i onClick={() => onClose()} className="fa-solid fa-xmark dark:text-white text-xl hover:text-red-400 cursor-pointer transition-colors duration-100 ease-in-out"></i>
                </div>
                <h1 className="text-start w-full font-light text-sm dark:text-white text-black "> Undangan untuk Anda: </h1>
                <div className="flex flex-col gap-3 overflow-y-auto pr-2 -mr-2">
                    {isLoadingFetch ? <h2 className="w-full h-full text-center flex justify-center items-center"><p>Loading Invites...</p></h2> :
                        invites.map((item) => (
                            <div key={item.invited_token} className="border w-full cursor-pointer rounded-lg dark:border-gray-600  p-4 flex flex-col items-center hover:shadow-md transition-shadow">
                                <h2 className="text-xl font-bold text-nowrap text-ellipsis overflow-hidden w-full">{item.venue_name}</h2>
                                <h3 className="text-sm font-light ml-1 italic mb-4 text-nowrap text-ellipsis overflow-hidden w-full">sebagai {item.role}</h3>
                                <div className="flex gap-3 items-center w-full ">
                                    {/* <h3 className=" w-full pb-3 font-[100] font-gray-600 italic text-[0.9em] text-start">{item.role}</h3> */}
                                    <button
                                        onClick={() => { handleAcceptInvite(item.invited_token); }}
                                        disabled={isLoading}
                                        className="w-full flex-1 bg-green-700 cursor-pointer text-white py-2 px-4 rounded-lg hover:bg-green-800 transition-colors font-semibold"
                                    >
                                        Gabung
                                    </button>
                                    <button
                                        onClick={() => { handleRejectInvite(item.invited_token); }}
                                        disabled={isLoading}
                                        className="w-full flex-1 bg-red-800 cursor-pointer text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                                    >
                                        Tolak
                                    </button>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </>
    );
}