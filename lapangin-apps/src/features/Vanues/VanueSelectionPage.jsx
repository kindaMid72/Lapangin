"use client";

import { useParams, useRouter } from "next/navigation";
import useAuthStore from "@/shared/stores/authStore";

export default function Venues() {
    const { session } = useAuthStore();
    console.log(session);

    const router = useRouter();
    const params = useParams();

    // TODO: replace this with real data fetching, and subscribe for changes from database
    const venues = [
        { id: 1, name: "Futsal Hall A", imageUrl: "/placeholder.svg" },
        { id: 2, name: "Badminton Court 1", imageUrl: "/placeholder.svg" },
        { id: 3, name: "Basketball Arena", imageUrl: "/placeholder.svg" },
        { id: 4, name: "Tennis Court 3", imageUrl: "/placeholder.svg" },
        { id: 5, name: "Tennis Court 3asdfasdfasdfasdfasdfasdfasdfasdfasdfsadfasdf", imageUrl: "/placeholder.svg" },
        { id: 6, name: "Tennis Court 3", imageUrl: "/placeholder.svg" },
        { id: 7, name: "Tennis Court 3", imageUrl: "/placeholder.svg" },
        { id: 8, name: "Tennis Court 3", imageUrl: "/placeholder.svg" },
        { id: 9, name: "Tennis Court 3", imageUrl: "/placeholder.svg" },
    ];

    const handleSelectVenue = (venueId) => {
        console.log(`Venue ${venueId} selected`);
        const { user_id } = params;
        // Here you would typically store the selected venue in a global state (Context, Redux, Zustand)
        // and then navigate to the main dashboard or the next step.
        router.replace(`/${user_id}/dashboard`); // Example navigation
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-800 font-mono p-1 md:p-0 md:rounded-none ">
            <div className="flex min-w-2xl p-8 md:p-0 md:w-full md:h-screen md:relative bg-white dark:bg-gray-900 dark:md:bg-gray-800 rounded-xl shadow-lg flex-col md:flex-row">
                <div className="flex flex-col md:w-2/3 md:px-4 md:rounded-r-2xl md:[box-shadow:0px_0px_10px_#3b474e] items-center md:justify-center w-fit md:bg-gray-900 ">
                    <h1 className="text-4xl font-extrabold text-center mb-2">Select Your Venue</h1>
                    <p className="text-gray-600 md:text-gray-400 text-center mb-8">Choose a venue to manage or create new.<br></br>You can only enter an existed vanue by invitations.</p>
                </div>

                <div className="flex flex-col md:py-5 md:flex-row md:flex-wrap md:items-center items-center justify-center w-full gap-6 md:h-full overflow-auto scrollbar-hide">
                    {venues.map((venue) => (
                        <div key={venue.id} className="border w-full md:w-1/3 cursor-pointer rounded-lg dark:border-gray-600  p-4 flex flex-col items-center hover:shadow-md transition-shadow">
                            <h2 className="text-xl font-bold mb-4 text-nowrap text-ellipsis overflow-hidden w-full">{venue.name}</h2>
                            <button
                                onClick={() => handleSelectVenue(venue.id)}
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