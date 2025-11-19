'use client'
import { useEffect, useState } from "react";

const colorMap = {
    red: {
        bg: 'bg-red-600',
        hover: 'hover:bg-red-700',
        disabled: 'disabled:bg-red-300',
        darkDisabled: 'dark:disabled:bg-red-800',
        text: 'text-white'
    },
    green: {
        bg: 'bg-green-600',
        hover: 'hover:bg-green-700',
        disabled: 'disabled:bg-green-300',
        darkDisabled: 'dark:disabled:bg-green-800',
        text: 'text-white'
    },
    gray: {
        bg: 'bg-gray-200',
        hover: 'hover:bg-gray-300',
        darkBg: 'dark:bg-gray-600',
        darkHover: 'dark:hover:bg-gray-500',
        text: 'text-gray-800',
        darkText: 'dark:text-gray-100'
    }
    // Anda bisa menambahkan warna lain di sini, misalnya 'green', 'blue', dll.
};

export default ({ title, message, onConfirm, onCancel, delayConfirm = false, delayCancel = false, confirmColor = 'red', cancelColor = 'gray', delaySecond = 5, backgroundClass = '' }) => {
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
            <div onClick={() => { onCancel }} className={backgroundClass.length > 0 ? backgroundClass : "fixed w-full h-full inset-0 z-49 flex items-center justify-center bg-gray-900/50 backdrop-blur-xs"}></div>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-xs">
                {/* Modal Card */}
                <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">{message}</p>
                    </div>

                    {/* Tombol Aksi */}
                    <div className="mt-6 flex justify-center gap-4">
                        <button
                            onClick={onCancel}
                            disabled={delayCancel && timeLeft > 0}
                            className={`cursor-pointer rounded-md px-4 py-2 font-semibold transition-colors ${colorMap[cancelColor]?.bg} ${colorMap[cancelColor]?.hover} ${colorMap[cancelColor]?.darkBg} ${colorMap[cancelColor]?.darkHover} ${colorMap[cancelColor]?.text} ${colorMap[cancelColor]?.darkText}`}
                        >
                            Cancel
                        </button>

                        <button
                            onClick={onConfirm}
                            disabled={delayConfirm && timeLeft > 0}
                            className={`cursor-pointer rounded-md px-4 py-2 font-semibold transition-colors disabled:cursor-not-allowed ${colorMap[confirmColor]?.bg} ${colorMap[confirmColor]?.hover} ${colorMap[confirmColor]?.disabled} ${colorMap[confirmColor]?.darkDisabled} ${colorMap[confirmColor]?.text}`}
                        >
                            {delayConfirm && timeLeft > 0 ? `Confirm (${timeLeft}s)` : 'Confirm'}
                        </button>
                    </div>
                </div>

            </div>
        </>
    )
}