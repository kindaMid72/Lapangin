"use client";

import { useParams, useRouter } from "next/navigation";

export default function Venues() {
    const router = useRouter();
    const params = useParams();

    // TODO: replace this with real data fetching
    const venues = [
        { id: 1, name: "Futsal Hall A", imageUrl: "/placeholder.svg" },
        { id: 2, name: "Badminton Court 1", imageUrl: "/placeholder.svg" },
        { id: 3, name: "Basketball Arena", imageUrl: "/placeholder.svg" },
        { id: 4, name: "Tennis Court 3", imageUrl: "/placeholder.svg" },
    ];

    const handleSelectVenue = (venueId) => {
        console.log(`Venue ${venueId} selected`);
        const { user_id } = params;
        // Here you would typically store the selected venue in a global state (Context, Redux, Zustand)
        // and then navigate to the main dashboard or the next step.
        router.replace(`/${user_id}/dashboard`); // Example navigation
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-800 font-mono">
            <div className=" min-w-2xl p-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg flex flex-col">
                <h1 className="text-4xl font-extrabold text-center mb-2">Select Your Venue</h1>
                <p className="text-gray-600 text-center mb-8">Choose a venue to manage.<br></br>You can only enter an existed vanue by invitations.</p>

                <div className="flex flex-col items-center justify-center w-full gap-6">
                    {venues.map((venue) => (
                        <div key={venue.id} className="border w-full cursor-pointer rounded-lg dark:border-gray-600  p-4 flex flex-col items-center hover:shadow-md transition-shadow">
                            <h2 className="text-xl font-bold mb-4">{venue.name}</h2>
                            <button
                                onClick={() => handleSelectVenue(venue.id)}
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                            >
                                Select
                            </button>
                        </div>
                    ))}
                    <div onClick={() => {
                        router.push(`/${params.user_id}/new_vanue`)
                    }} className="border-1 border-gray-700 w-full font-extrabold cursor-pointer rounded-lg p-4 flex flex-col items-center hover:shadow-md hover:bg-green-800 hover:border-transparent transition-all duration-100 ease-in-out hover:text-white">
                        <p>Create New Values</p>
                    </div>
                </div>
            </div>
        </div>
    );
}