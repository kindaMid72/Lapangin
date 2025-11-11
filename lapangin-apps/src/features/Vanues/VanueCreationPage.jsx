"use client";

import useSessionStore from "@/shared/stores/authStore"; // Impor store Zustand
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import api from "@/utils/axiosClient/axiosInterceptor.js";


// utils

export default function VanueCreate() {
    // Ambil sesi dan fungsi fetch dari store global
    const { session, fetchSession, isLoading } = useSessionStore();

    useEffect(() => {
        // Jika sesi belum ada di store, panggil fungsi untuk mengambilnya.
        if (!session) {
            fetchSession();
        }
    }, []);


    // env varible
    const apiURL = process.env.NEXT_PUBLIC_SERVER_API_URL;

    const router = useRouter();
    const params = useParams();
    const { user_id } = params;

    // on save vanue, create a new vanue in database and track for changes from database in realtime by subscribing
    const [venueName, setVenueName] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");
    // Mendeteksi zona waktu pengguna atau default ke 'Asia/Jakarta'
    const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Jakarta");

    const allTimezones = Intl.supportedValuesOf('timeZone');

    const handleCreateVenue = async (e) => {
        e.preventDefault();
        setError("");
        try {
            // Tampilkan loading atau nonaktifkan tombol jika sesi masih dimuat
            if (isLoading) {
                alert("Please wait, session is loading...");
                return;
            }

            // Pastikan sesi (dan token) sudah ada sebelum mengirim request
            if (!session || !session.access_token) {
                alert("Authentication session not found. Please log in again.");
                return;
            }
            // TODO: Implement API call to create the venue, and navigate to /[user_id]
            // then, trigger update for new vanue in database

            // 1. check for valid input, vanue_name, address, and phone number must be not null
            const response = await api.post(`/venue/create_new_venue`,
                {
                    vanueName: venueName,
                    address: address,
                    phoneNumber: phone,
                    timezone: timezone,
                    description: description
                }
            )
            // debug section
            console.log(response);

            router.push(`/${user_id}`); // Navigate back to venue selection

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <>
            <div>
                <div className="flex flex-col items-center justify-center min-h-screen md:w-full bg-gray-100 dark:bg-gray-800 font-mono">
                    <div className="w-full max-w-2xl md:min-w-full p-8 md:p-0 bg-white md:h-screen dark:bg-gray-900 dark:md:bg-gray-800 rounded-xl shadow-lg md:flex md:rounded-none md:justify-between md:shadow-none ">
                        {/* escape button */}
                        <div className="flex flex-col md:items-center md:min-w-[400px] md:p-8 dark:md:bg-gray-900 md:rounded-r-2xl md:[box-shadow:0px_0px_10px_#3b474e]">
                            <div className=" flex justify-start items-center md:w-full">
                                <i className="fa-solid fa-xmark text-xl hover:text-red-400 cursor-pointer transition-colors duration-100 ease-in-out" onClick={() => router.push(`/${user_id}`)} ></i>
                            </div>
                            <div className="flex flex-col items-center justify-center md:flex-1 md:mx-10">
                                <h1 className="text-4xl font-extrabold text-center mb-2">Create a New Venue</h1>
                                <p className="text-gray-600 text-center mb-8">Fill in the details to get started.</p>
                            </div>
                        </div>

                        <form onSubmit={(e) => { handleCreateVenue(e) }} className="space-y-6 md:p-8 md:flex md:flex-col md:items-center md:justify-start md:w-full md:[&>div]:w-full overflow-auto scrollbar-hide ">
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
                                <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="use a valid country code. e.g., +62xxxxxxxx" required />
                            </div>
                            {/* timezone picker */}
                            <div>
                                <label htmlFor="timezone" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Timezone</label>
                                <select id="timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required>
                                    {allTimezones.map(tz => (
                                        <option key={tz} value={tz}>
                                            {tz}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Description</label>
                                <textarea id="description" rows="4" value={description} onChange={(e) => setDescription(e.target.value)} className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="Write a brief description about your venue..."></textarea>
                            </div>
                            {error && <p className="text-red-500 text-center mt-4">{error}</p>}
                            <button type="submit" className="w-full cursor-pointer text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 font-bold rounded-lg text-lg px-5 py-2.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 transition-colors">Create Venue</button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}