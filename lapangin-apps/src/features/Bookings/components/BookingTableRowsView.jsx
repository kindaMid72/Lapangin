'use client'
import useVenueStore from "@/shared/stores/venueStore";
import numberToRupiah from "@/utils/formatChanger/numberToRupiah.js";
import { Temporal } from "@js-temporal/polyfill";
import { useState } from "react";
import EditBookingRow from "./EditTabelRow"; // Impor komponen edit

export default function BookingPageRow({ Booking, onUpdate }) {
    const { venueMetadata } = useVenueStore();

    const [showEditModal, setShowEditModal] = useState(false);

    if (!Booking) return null;

    const formatTime = (timeString) => {
        if (!timeString) return 'N/A';
        if (timeString === 'N/A') return ('N/A');
        return Temporal.Instant.from(timeString).toZonedDateTimeISO(venueMetadata.timezone || 'Asia/Jakarta').toPlainTime().toString().slice(0, 5);
    };

    const statusColorMap = {
        pending: 'bg-yellow-500',
        confirmed: 'bg-green-500',
        cancelled: 'bg-red-500',
        initialized: 'bg-blue-500',
    };

    return (
        <>
            {showEditModal && (
                <EditBookingRow
                    booking={Booking}
                    onClose={() => setShowEditModal(false)}
                    onUpdateSuccess={onUpdate}
                />
            )}
            <tr className="[&_td]:border-b dark:[&_td]:border-gray-700 [&_td]:border-gray-300 w-fit text-sm">
                <td className="p-3 truncate max-w-xs">{Booking.id ?? "null"}</td>
                <td className="p-3">{Booking.court_name ?? "lapangan x"}</td>
                <td className="p-3">{Booking.guest_name ?? "Customers Name"}<br /><span className="text-xs text-gray-500">{Booking.guest_phone ?? '08XXXXXXXX'}</span></td>
                <td className="p-3">{Booking.slots?.length > 0 ? `${formatTime(Booking.slots[0].start_time)} - ${formatTime(Booking.slots[Booking.slots.length - 1].end_time)}` : 'N/A'}</td>
                <td className="p-3">{numberToRupiah(Booking.price_total).split(',')[0] ?? "Rp. xxx.xxx"}</td>
                <td className="p-3">
                    <span className={`rounded-lg px-2 py-1 text-white text-xs font-bold uppercase ${statusColorMap[Booking.status] || 'bg-gray-500'}`}>{Booking.status ?? "Undefined"}</span>
                </td>
                <td className="p-3">
                    <button onClick={() => setShowEditModal(true)} className="hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-full w-8 h-8 flex items-center justify-center">
                        <i className="fa-solid fa-ellipsis-vertical"></i>
                    </button>
                </td>
            </tr>
        </>
    );
}