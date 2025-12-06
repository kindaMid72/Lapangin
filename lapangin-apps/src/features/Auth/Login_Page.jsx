"use client"
/**
 * FIXME: login fa
 */

import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Impor createBrowserClient langsung dari @supabase/ssr untuk komponen klien
import { createClient } from "@/utils/supabase/client";

// store
import useSessionStore from "@/shared/stores/authStore";

export default function Login_Page() {
    // store
    const { session, fetchSession } = useSessionStore();

    const router = useRouter();
    // Panggil fungsi untuk mendapatkan instance Supabase
    const supabase = createClient();
    // state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState(null);

    // handler
    const handleLogin = async (e) => {
        e.preventDefault(); // Mencegah form me-reload halaman
        setError(null); // Reset error setiap kali mencoba login

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            setError(error.message); // Tampilkan pesan error ke pengguna
            return;
        } else if (data.user) {
            // Jika berhasil, arahkan ke halaman utama dan refresh
            const userId = data.user.id;
            router.push(`/${userId}`); // Ganti dengan rute tujuan Anda
            router.refresh(); // Penting: refresh untuk memberi tahu server tentang sesi baru
        }
        fetchSession();
        setEmail('');
        setPassword('');

    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-mono">
            <div className="container mx-auto flex flex-col md:flex-row md:h-screen md:items-center">
                {/* Left Section / Header */}
                <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-12 text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">
                        Selamat Datang Kembali di <span className='text-green-500'>Lapangin</span>!
                    </h1>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                        Log-in ke akunmu untuk melanjutkan.
                    </p>
                </div>

                {/* Right Section / Form */}
                <div className="w-full md:w-1/2 p-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8">
                        <form onSubmit={handleLogin} className="w-full flex flex-col space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                <input type='email' value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@example.com" className="w-full p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                                <input type='password' value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="w-full p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" required />
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <button type="button" className="font-medium text-green-600 hover:underline dark:text-green-400">Forgot Password?</button>
                            </div>

                            {error && <p className="text-red-500 text-center !mt-6">{error}</p>}

                            <button type="submit" className="w-full !mt-6 border-2 border-transparent bg-green-600 rounded-lg py-3 text-white font-bold hover:bg-green-700 transition-colors">Log In</button>
                        </form>
                        <div className="text-center mt-6">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Ga punya akun?  <Link href="/sign_in" className="text-green-600 hover:underline font-bold">sign-up disini</Link> dulu yah!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}