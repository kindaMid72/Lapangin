'use client'
import { useEffect, useState } from "react";

export default ({ title, message, onConfirm, onCancel, delayConfirm = false, delayCancel = false, confirmColor='red-600', cancelColor='gray-200', delaySecond=5}) => {
    const [timeLeft, setTimeLeft] = useState(delaySecond);

    useEffect(() => {
        // Jalankan hitung mundur hanya jika delayConfirm aktif dan waktu masih tersisa
        if (!delayConfirm || timeLeft <= 0) return;

        // Atur interval untuk mengurangi waktu setiap 1 detik
        const intervalId = setInterval(() => {
            setTimeLeft(prevTime => prevTime - 1);
        }, 1000);

        // Fungsi cleanup untuk membersihkan interval saat komponen di-unmount
        return () => clearInterval(intervalId);

    }, []);

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.1)] bg-opacity-50  backdrop-blur-sm">
                {/* Modal Card */}
                <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">{message}</p>
                    </div>

                    {/* Tombol Aksi */}
                    <div className="mt-6 flex justify-center gap-4">
                        <button
                            onClick={onCancel}
                            style={{backgroundColor: `${cancelColor}`}}
                            className="rounded-md bg-gray-200 px-4 py-2 font-semibold text-gray-800 transition-colors hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={onConfirm}
                            disabled={delayConfirm && timeLeft > 0}
                            style={{backgroundColor: `${confirmColor}`}}
                            className="rounded-md bg-red-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400 dark:disabled:bg-red-800"
                        >
                            {delayConfirm && timeLeft > 0 ? `Confirm (${timeLeft}s)` : 'Confirm'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}