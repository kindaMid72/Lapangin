"use client"

// imports
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import Link from 'next/link';

import { createClient } from '../../utils/supabase/client';

// Memberi nama pada komponen adalah praktik yang baik untuk debugging.
export default function SignInPage() {
    // instance
    const supabase = createClient();

    // state
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);


    // handler
    async function handleSignin(e) {
        e.preventDefault();
        setError(null);

        // checker validator
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

        // check input
        if (!email || !password || !confirmPassword) {
            setError('Please fill all the fields');
            return;
        }
        if (password !== confirmPassword) {
            setError('Password does not match');
            return;
        }
        if (!passwordRegex.test(password)) {
            setError('Password must be 8+ characters, with uppercase, lowercase, and a number.');
            return;
        }
        if (!emailRegex.test(email)) {
            setError('Invalid email format');
            return;
        }
        // Panggil Supabase untuk mendaftarkan pengguna
        const { data, error: signUpError } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        console.log(data);
        if (signUpError) {
            // Tampilkan pesan error yang lebih spesifik dari Supabase
            setError(signUpError.message);
        } else if (data.user) {
            // Beri tahu pengguna untuk memeriksa email konfirmasi
            // (jika email confirmation diaktifkan di Supabase)
            alert('Registration successful! Please check your email to confirm your account.');
            router.push('/login'); // Arahkan ke halaman login
        }
        setEmail('');
        setPassword('');
        setConfirmPassword('');
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-mono">
            <div className="container mx-auto flex flex-col md:flex-row-reverse md:h-screen md:items-center">
                {/* Left Section / Header */}
                <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-12 text-center md:text-left">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">
                        Selamat Datang di <span className='text-green-500'>Lapangin</span>!
                    </h1>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                        Buat akun Anda dan mulai kelola CourtSpace dengan mudah.
                    </p>
                </div>

                {/* Right Section / Form */}
                <div className="w-full md:w-1/2 p-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8">
                        <form onSubmit={handleSignin} className="w-full flex flex-col space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                <input name="email" value={email} onChange={(e) => { setEmail(e.target.value) }} type='email' placeholder="your@example.com" className="w-full p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                                <input name="password" value={password} onChange={(e) => { setPassword(e.target.value) }} type='password' placeholder="Minimal 8 karakter" className="w-full p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
                                <input name="confirm_password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value) }} type='password' placeholder="Ulangi password Anda" className="w-full p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" required />
                            </div>

                            {error && <p className="text-red-500 text-center !mt-6">{error}</p>}

                            <button type='submit' className="w-full !mt-6 border-2 border-transparent bg-green-600 rounded-lg py-3 text-white font-bold hover:bg-green-700 transition-colors">Sign Up</button>
                        </form>
                        <div className="text-center mt-6">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Sudah punya akun? yaudah <Link href="/login" className="text-green-600 hover:underline font-bold">Log-in</Link> di sini</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}