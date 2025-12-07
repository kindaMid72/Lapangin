'use client'
import api from '@/utils/axiosClient/axiosInterceptor.js';
import numberToRupiah from "@/utils/formatChanger/numberToRupiah.js";
import { Temporal } from '@js-temporal/polyfill';
import { useState } from "react";

import useVenueStore from '@/shared/stores/venueStore';

export default function EditBookingRow({ booking, onClose, onUpdateSuccess }) {

    const { venueMetadata } = useVenueStore();

    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState(null);

    const handleStatusUpdate = async (newStatus) => {
        setIsUpdating(true);
        setError(null);
        try {
            await api.patch(`/admin_booking/update_booking_status/${booking.id}`, { newStatus });
            onUpdateSuccess(); // Ini akan me-refresh halaman
            onClose(); // Tutup modal setelah berhasil
        } catch (err) {
            setError(err.response?.data?.message || "Gagal memperbarui status.");
            console.error(err);
        } finally {
            setIsUpdating(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return Temporal.Instant.from(dateString).toZonedDateTimeISO('Asia/Jakarta').toPlainDate().toString();
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity duration-300" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col md:flex-row overflow-hidden animate-fade-in-up" onClick={(e) => e.stopPropagation()}>

                {/* Left Side: Payment Proof */}
                <div className="w-full md:w-1/2 bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4 md:p-6">
                    {booking.payment_receipt_url ? (
                        <img src={booking.payment_receipt_url} alt="Bukti Pembayaran" className="max-h-[40vh] md:max-h-full object-contain rounded-lg shadow-lg" />
                    ) : (
                        <div className="text-center text-gray-500 p-8">
                            <i className="fa-solid fa-file-invoice-dollar text-5xl mb-4 opacity-50"></i>
                            <p className="font-semibold">Tidak ada bukti pembayaran.</p>
                        </div>
                    )}
                </div>

                {/* Right Side: Details & Actions */}
                <div className="w-full md:w-1/2 p-6 flex flex-col">
                    <div className="flex justify-between items-center border-b dark:border-gray-700 pb-4 mb-4">
                        <h2 className="text-2xl font-bold">Detail Booking</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors text-2xl">&times;</button>
                    </div>

                    {/* Booking Details */}
                    <div className="text-sm space-y-3 flex-grow overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                        <p><strong>Customer:</strong><br />{booking.guest_name} ({booking.guest_phone})</p>
                        <p><strong>Lapangan:</strong><br />{booking.court_name}</p>
                        <div>
                            <strong>Waktu:</strong>
                            {booking.slots && booking.slots.length > 0 ? (
                                <ul className="list-disc list-inside ml-2">
                                    {booking.slots.map((slot, index) => (
                                        <li key={index}>
                                            {formatDate(slot.start_time)}, {Temporal.Instant.from(slot.start_time).toZonedDateTimeISO(venueMetadata.timezone || 'Asia/Jakarta').toPlainTime().toString().slice(0, 5)} - {Temporal.Instant.from(slot.end_time).toZonedDateTimeISO(venueMetadata.timezone || 'Asia/Jakarta').toPlainTime().toString().slice(0, 5)}
                                        </li>
                                    ))}
                                </ul>
                            ) : ' N/A'}
                        </div>
                        <p><strong>Total Harga:</strong><br />{numberToRupiah(booking.price_total).split(',')[0]}</p>
                        <p><strong>Status Booking:</strong> <span className="font-bold uppercase">{booking.status}</span></p>
                        <p><strong>Status Pembayaran:</strong> <span className="font-bold uppercase">{booking.payment_status || 'N/A'}</span></p>
                        <p><strong>ID Booking:</strong><br /><span className="text-xs text-gray-500">{booking.id}</span></p>
                    </div>

                    {/* Action Buttons */}
                    <div className="border-t dark:border-gray-700 pt-4 mt-4">
                        <h3 className="font-semibold mb-3">Ubah Status Booking</h3>
                        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleStatusUpdate('confirmed')}
                                disabled={isUpdating || booking.status === 'confirmed'}
                                className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                {isUpdating ? <i className="fa-solid fa-spinner fa-spin"></i> : "Konfirmasi"}
                            </button>
                            <button
                                onClick={() => handleStatusUpdate('cancelled')}
                                disabled={isUpdating || booking.status === 'cancelled'}
                                className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg font-bold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                {isUpdating ? <i className="fa-solid fa-spinner fa-spin"></i> : "Batalkan"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}