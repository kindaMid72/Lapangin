'use client'
import { useEffect, useState } from "react";

export default ({ title, message, onConfirm, onCancel, delayConfirm = false, delayCancel = false, confirmColor='red', cancelColor='gray', delaySecond=5, backgroundClass=''}) => {
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
            <div onClick={onCancel} className={backgroundClass ? backgroundClass : "fixed w-full h-full inset-0 z-49 flex items-center justify-center bg-gray-900/50 backdrop-blur-xs"}></div>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-xs">
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
                            className={`rounded-md bg-${cancelColor}-500 px-4 py-2 font-semibold text-${cancelColor}-800 transition-colors hover:bg-${cancelColor}-500 dark:bg-${cancelColor}-600 dark:text-${cancelColor}-100 dark:hover:bg-${cancelColor}-500`}
                        >
                            Cancel
                        </button>

                        <button
                            onClick={onConfirm}
                            disabled={delayConfirm && timeLeft > 0}
                            className={`rounded-md bg-${confirmColor}-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-${confirmColor}-700 disabled:cursor-not-allowed disabled:bg-${confirmColor}-400 dark:disabled:bg-${confirmColor}-800`}
                        >
                            {delayConfirm && timeLeft > 0 ? `Confirm (${timeLeft}s)` : 'Confirm'}
                        </button>
                    </div>
                </div>

            </div>
        </>
    )
}