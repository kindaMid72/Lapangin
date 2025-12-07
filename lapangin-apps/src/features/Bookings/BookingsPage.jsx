'use client'

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

// components
import BookingPageRow from "@/features/Bookings/components/BookingTableRowsView";

// api
import api from '@/utils/axiosClient/axiosInterceptor.js';

// stores
import useVenueStore from "@/shared/stores/venueStore";

export default function BookingPage() {
    // Global store
    const prmz = useParams();
    const { activeVenue } = useVenueStore();

    // state
    const [bookings, setBookings] = useState([]);
    const [meta, setMeta] = useState({
        prev_cursor: null,
        next_cursor: null,
        can_back: false,
        can_next: false,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter & Pagination state
    const [filters, setFilters] = useState({
        limit: 15,
        asc: 'false', // 'true' for ascending, 'false' for descending
        category: 'created_at', // e.g., 'created_at', 'status'
        cus_status: '', // All statuses by default
    });

    const fetchBookings = useCallback(async (direction = null, cursor = null) => {

        setIsLoading(true);
        setError(null);

        try {
            const params = {
                limit: filters.limit,
                asc: filters.asc,
                category: filters.category,
                ...(direction && { dir: direction }),
                ...(cursor && { cursor: cursor }),
                ...(filters.cus_status && { cus_status: filters.cus_status }),
            };

            const data = await api.get(`/admin_booking/get_booking_page/${prmz.venue_id}`, { params })
                .then(res => res.data)
            if (!data) throw new Error(data.message);
            setBookings(data.bookingInfo);
            setMeta(data.meta);
        } catch (err) {
            setError(err.response?.data?.message || "Gagal memuat data booking.");
        } finally {
            setIsLoading(false);
        }
    }, [activeVenue, filters]);

    // Initial fetch and re-fetch on filter change
    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleNextPage = () => {
        if (meta.can_next) {
            fetchBookings('next', meta.next_cursor);
        }
    };

    const handlePrevPage = () => {
        if (meta.can_back) {
            fetchBookings('prev', meta.prev_cursor);
        }
    };

    const handleRowUpdate = (updatedBooking) => {
        fetchBookings(); // Cukup panggil ulang fetchBookings untuk me-refresh data
    };

    const handleRowDelete = async (bookingId) => {
        try {
            // await api.delete(`/your-delete-endpoint/${bookingId}`);
            setBookings(currentBookings => currentBookings.filter(b => b.id !== bookingId));
        } catch (err) {
            console.log(err);
        }
    };

    return (<>
        <div className="flex flex-col px-10 py-3 h-full overflow-auto">
            <div className="flex justify-between items-center">
                <h1 className="font-bold text-xl">Semua Booking</h1>
                {/* Filter Controls */}
                <div className="flex items-center gap-4">
                    <select name="cus_status" value={filters.cus_status} onChange={handleFilterChange} className="p-2 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
                        <option value="">Semua Status</option>
                        <option value="initialized">Initialized</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <select name="asc" value={filters.asc} onChange={handleFilterChange} className="p-2 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
                        <option value="false">Terbaru</option>
                        <option value="true">Terlama</option>
                    </select>
                </div>
            </div>

            <table className="w-full border-1 bg-white dark:bg-gray-800 dark:border-gray-700 mt-4 text-center border-separate border-spacing-0 rounded-xl overflow-hidden">
                <thead className=" ">
                    <tr className=" border-1 border-b-white [&_th]:p-3 dark:bg-gray-900">
                        <th className="">Booking ID</th>
                        <th className="">Lapangan</th>
                        <th className="">Customer</th>
                        <th className="">Waktu</th>
                        <th className="">Harga</th>
                        <th className="">Status</th>
                        <th className="">Aksi</th>
                    </tr>
                </thead>
                <tbody className="">
                    {isLoading ? (
                        <tr>
                            <td colSpan="7" className="p-8 text-center text-gray-500">
                                <i className="fa-solid fa-spinner fa-spin text-2xl"></i> Memuat data...
                            </td>
                        </tr>
                    ) : error ? (
                        <tr>
                            <td colSpan="7" className="p-8 text-center text-red-500">{error}</td>
                        </tr>
                    ) : bookings.length > 0 ? (
                        bookings.map(booking => (
                            <BookingPageRow key={booking.id} Booking={booking} onUpdate={handleRowUpdate} />
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="p-8 text-center text-gray-500">Tidak ada data booking ditemukan.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="flex justify-end items-center gap-4 mt-4">
                <button onClick={handlePrevPage} disabled={!meta.can_back || isLoading} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    Sebelumnya
                </button>
                <button onClick={handleNextPage} disabled={!meta.can_next || isLoading} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    Selanjutnya
                </button>
            </div>
        </div>

    </>)
}