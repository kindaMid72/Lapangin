"use client"

import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Impor helper client yang baru Anda buat
import { createClient } from '../../utils/supabase/client';

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

        console.log(data);
        if (error) {
            setError(error.message); // Tampilkan pesan error ke pengguna
            return;
        } else if (data.user) {
            // Jika berhasil, arahkan ke halaman utama dan refresh
            const userId = data.user.id;
            router.push(`/${userId}`); // Ganti dengan rute tujuan Anda
            router.refresh(); // Penting: refresh untuk memberi tahu server tentang sesi baru
        }
        setEmail('');
        setPassword('');

    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="dark:bg-gray-900 bg-gray-300 dark:text-white text-black flex flex-col justify-center items-center w-[450px] border-2 border-transparent rounded-xl py-6 px-8 font-mono [box-shadow:0px_0px_50px_#3b474e]">
                <div> {/* welcome back section */}
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Welcome back!</h1>
                    <p className="text-gray-600 mt-3 dark:text-white">Log in to your account to continue</p>
                </div>
                {/* email login section */}
                <form onSubmit={handleLogin} className="w-full flex flex-col mt-5">
                    <p>Email</p>
                    <input type='email' value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@example.com" className="w-full border-2 border-gray-300 p-2 rounded-md mb-2" required />
                    <p>Password</p>
                    <input type='password' value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="w-full border-gray-300 border-2 p-2 rounded-md" required />

                    <div className="flex justify-between items-center mt-5"> {/* forgot password section */}
                        <div className="flex justify-start items-center">
                            <input type='checkbox' checked={remember} onChange={(e) => { setRemember(e.target.checked) }} className="mr-2"></input> {/* remember for 30 day*/}
                            <p>Remember me</p>
                        </div>
                        <button className="hover:underline" onClick={() => { }}>Forgot Password?</button>
                    </div>

                    {/* Tampilkan pesan error jika ada */}
                    {error && <p className="text-red-500 text-center mt-4">{error}</p>}

                    {/* login button */} {/* onClick auth */}
                    <button type="submit" className="w-full border-2 border-transparent bg-blue-600 rounded-lg py-2 mt-5 text-white font-[800] hover:bg-blue-700 transition-colors">Log in</button>
                </form>

                {/* sign up section */}
                <div>
                    <p className="text-center mt-7 text-gray-500">Don't have an account? <Link href="/register" className="text-blue-600 hover:underline font-extrabold">Sign up for free</Link></p>
                </div>

            </div>
        </div>
    );
}