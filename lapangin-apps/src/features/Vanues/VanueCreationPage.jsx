"use client";

import useSessionStore from "@/shared/stores/authStore"; // Impor store Zustand
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
        <div className="min-h-screen relative bg-gray-100 dark:bg-gray-900 font-mono">
            <div className="hidden md:block top-8 left-8 md:fixed md:w-full md:mb-4 ">
                <i className="fa-solid fa-arrow-left text-xl hover:text-green-400 cursor-pointer transition-colors duration-100 ease-in-out" onClick={() => router.push(`/${user_id}`)} ></i>
            </div>
            <div className="container mx-auto flex flex-col md:flex-row md:h-screen">
                {/* Left Section / Header */}
                <div className="w-full md:w-1/3 flex flex-col justify-center items-start h-full md:items-center p-8 text-center bg-white dark:bg-gray-800 md:bg-gray-900 md:dark:bg-gray-900 md:text-white rounded-b-2xl md:rounded-none shadow-lg md:shadow-none relative">
                    <div className="absolute top-8 left-8 md:hidden md:w-full md:mb-4 ">
                        <i className="fa-solid fa-arrow-left text-xl hover:text-green-400 cursor-pointer transition-colors duration-100 ease-in-out" onClick={() => router.push(`/${user_id}`)} ></i>
                    </div>
                    <div className="w-full mt-8 md:mt-0">
                        <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Buat CourtSpace Baru</h1>
                        <p className="text-gray-600 dark:text-gray-400">Isi detail untuk memulai mengelola CourtSpace Anda.</p>
                    </div>
                </div>

                {/* Right Section / Form */}
                <div className="w-full md:w-2/3 px-6 md:px-10 pt-6 md:pt-10 flex flex-col justify-center ">
                    <form onSubmit={handleCreateVenue} className="space-y-4 flex-grow overflow-y-auto scrollbar-hide pr-2">
                        <div>
                            <label htmlFor="venueName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nama Venue</label>
                            <input type="text" id="venueName" value={venueName} onChange={(e) => setVenueName(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="e.g., Lapangan Futsal Ceria" required />
                        </div>
                        <div>
                            <label htmlFor="address" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Alamat</label>
                            <input type="text" id="address" value={address} onChange={(e) => setAddress(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="Alamat lengkap venue Anda" required />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nomor Telepon</label>
                            <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="Gunakan kode negara, cth: +62812xxxx" required />
                        </div>
                        <div>
                            <label htmlFor="timezone" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Zona Waktu</label>
                            <select id="timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" required>
                                {allTimezones.map(tz => (
                                    <option key={tz} value={tz}>
                                        {tz}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Deskripsi</label>
                            <textarea id="description" rows="4" value={description} onChange={(e) => setDescription(e.target.value)} className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="Tulis deskripsi singkat tentang venue Anda..."></textarea>
                        </div>
                        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
                        <div className="mt-8 text-center">
                            <button type="submit" className="w-full md:w-auto cursor-pointer bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition-all duration-150 focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800">
                                Buat CourtSpace
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}