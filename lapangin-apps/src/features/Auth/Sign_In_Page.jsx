"use client"

// imports
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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

        console.log(await supabase.auth.getSession());
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 relative dark:bg-gray-800">
            <div className="bg-gray-900 flex flex-col justify-center items-center w-[450px] border-2 border-transparent rounded-xl py-6 px-8 font-mono [box-shadow:0px_0px_20px_#3b474e]">
                <div> {/* welcome back section */}
                    <h1 className="text-4xl font-extrabold">Selamat Datang di <p className='text-green-500 inline'>Lapangin</p>!</h1>
                    <p className="text-gray-600 mt-3 dark:text-white">Sign in untuk melanjutkan.</p>
                </div>

                {/* or break line */}
                {/* <div className="flex justify-center items-center mt-8 w-full">
                    <div className="h-0 w-5 border-y-1 border-gray-300 flex-1"></div>
                    {/* <p className="px-2 text-gray-400">or</p>
                    <div className="h-0 w-5 border-y-1 border-gray-300 flex-1"></div>
                </div> */}

                {/* email login section */}
                <form onSubmit={handleSignin} className="w-full flex flex-col mt-5">
                    <p>Email</p>
                    <input name="email" value={email} onChange={(e) => { setEmail(e.target.value) }} type='text' placeholder="your@example.com" className=" w-full border-1 border-gray-600 p-2 rounded-md mb-2 outline-1 outline-gray-300"></input>
                    <p>Password</p>
                    <input name="password" value={password} onChange={(e) => { setPassword(e.target.value) }} type='password' placeholder="Enter your password" className="w-full border-gray-600 border-2 p-2 rounded-md mb-2 outline-1 outline-gray-300"></input>
                    <p>Confirm Password</p>
                    <input name="confirm_password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value) }} type='password' placeholder="Enter your password" className="w-full border-gray-600 border-2 p-2 rounded-md outline-1 outline-gray-300"></input>

                    {error && <p className="text-red-500 text-center mt-4">{error}</p>}
                    {/* sign in button */}
                    <button type='submit' className="w-full border-2 border-transparent bg-blue-600 rounded-lg py-2 mt-5 text-white font-[800] hover:bg-blue-800 transition-color duration-150 ease-in-out">Sign in</button>
                </form>

            </div>
        </div>
    )
}