"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function VanueCreate() {
    const router = useRouter();
    const params = useParams();
    const { user_id } = params;

    // on save vanue, create a new vanue in database and track for changes from database in realtime by subscribing
    const [venueName, setVenueName] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");
    const [description, setDescription] = useState("");

    const handleCreateVenue = (e) => {
        e.preventDefault();
        // TODO: Implement API call to create the venue, and navigate to /[user_id]
        // then, trigger update for new vanue in database
        router.push(`/${user_id}`); // Navigate back to venue selection
    };

    return (
        <>
            <div>
                <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-800 font-mono">
                    <div className="w-full max-w-2xl p-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg">
                        <div className=" flex justify-start items-center">
                            <i className="fa-solid fa-xmark text-xl hover:text-red-400 cursor-pointer transition-colors duration-100 ease-in-out" onClick={() => router.push(`/${user_id}`)} ></i>
                        </div>
                        <h1 className="text-4xl font-extrabold text-center mb-2">Create a New Venue</h1>
                        <p className="text-gray-600 text-center mb-8">Fill in the details to get started.</p>

                        <form onSubmit={handleCreateVenue} className="space-y-6">
                            <div>
                                <label htmlFor="venueName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Venue Name</label>
                                <input type="text" id="venueName" value={venueName} onChange={(e) => setVenueName(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="e.g., Lapangan Futsal Ceria" required />
                            </div>
                            <div>
                                <label htmlFor="address" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Address</label>
                                <input type="text" id="address" value={address} onChange={(e) => setAddress(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="Full address of your venue" required />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Phone Number</label>
                                <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="e.g., 081234567890" required />
                            </div>
                            <div>
                                <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Description</label>
                                <textarea id="description" rows="4" value={description} onChange={(e) => setDescription(e.target.value)} className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="Write a brief description about your venue..."></textarea>
                            </div>
                            <button type="submit" className="w-full cursor-pointer text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 font-bold rounded-lg text-lg px-5 py-2.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 transition-colors">Create Venue</button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}