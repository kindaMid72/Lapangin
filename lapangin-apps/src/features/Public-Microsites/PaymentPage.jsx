'use client'
import { useEffect, useState } from "react";

export default function PaymentPage() {


    // state
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [notes, setNotes] = useState('');

    // handler
    



    return (
        <div className="bg-slate-50 min-h-screen font-sans text-gray-800">
            <div className="container mx-auto px-4 py-8 lg:py-12">
                {/* Header */}
                <div className="text-center lg:text-left mb-8">
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Checkout</h1>
                    <p className="mt-2 text-md text-gray-600">Lengkapi data Anda untuk menyelesaikan booking.</p>
                </div>

                {/* Timer Section */}
                <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-800 p-4 rounded-md flex items-center gap-4 mb-8 shadow-sm">
                    <i className="fa-solid fa-clock fa-spin text-2xl"></i>
                    <div>
                        <h2 className="font-bold">Selesaikan dalam 10:00</h2>
                        <p className="text-sm">Slot akan otomatis dilepas jika pembayaran tidak diselesaikan sebelum waktu habis.</p>
                    </div>
                </div>

                {/* Main Content: Two-column layout */}
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

                    {/* Left Column: Form and Payment */}
                    <div className="w-full lg:w-2/3 space-y-8">
                        {/* Customer Info Card */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-4">Informasi Pemesan</h2>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                                    <input type="text" id="fullName" className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" placeholder="Masukkan nama lengkap Anda" />
                                </div>
                                <div>
                                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
                                    <input type="tel" id="phoneNumber" className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" placeholder="+62 8XX-XXXX-XXXX" />
                                </div>
                                <div>
                                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Catatan (Opsional)</label>
                                    <textarea id="notes" rows="3" className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition" placeholder="Tambah catatan untuk penyedia lapangan..."></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method Card */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-4">Metode Pembayaran</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Example Payment Option */}
                                <div className="border-2 border-green-500 bg-green-50 p-4 rounded-lg flex items-center justify-between cursor-pointer">
                                    <span className="font-medium">Virtual Account</span>
                                    <i className="fa-solid fa-university text-green-600"></i>
                                </div>
                                <div className="border border-gray-300 hover:border-green-500 p-4 rounded-lg flex items-center justify-between cursor-pointer transition">
                                    <span className="font-medium">E-Wallet</span>
                                    <i className="fa-solid fa-wallet text-gray-500"></i>
                                </div>
                                <div className="border border-gray-300 hover:border-green-500 p-4 rounded-lg flex items-center justify-between cursor-pointer transition">
                                    <span className="font-medium">Kartu Kredit/Debit</span>
                                    <i className="fa-regular fa-credit-card text-gray-500"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Order Summary (Sticky) */}
                    <div className="w-full lg:w-1/3">
                        <div className="bg-white p-6 rounded-lg shadow-md lg:sticky lg:top-8">
                            <h2 className="text-xl font-semibold mb-4 border-b pb-3">Ringkasan Pesanan</h2>
                            <div className="space-y-3 mt-4 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Lapangan</span>
                                    <span className="font-medium">Futsal Halim 1</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tanggal</span>
                                    <span className="font-medium">30 November 2025</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Waktu</span>
                                    <div className="text-right font-medium">
                                        <p>10:00 - 11:00</p>
                                        <p>11:00 - 12:00</p>
                                    </div>
                                </div>
                                <hr className="pt-2" />
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal (2 Sesi)</span>
                                    <span className="font-medium">Rp 200.000</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Pajak & Layanan</span>
                                    <span className="font-medium">Rp 20.000</span>
                                </div>
                                <hr className="pt-2" />
                                <div className="flex justify-between items-center text-base font-bold">
                                    <span>Total</span>
                                    <span className="text-xl text-green-600">Rp 220.000</span>
                                </div>
                            </div>

                            {/* CTA Button */}
                            <button className="w-full mt-6 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-300">
                                Bayar Sekarang
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

}