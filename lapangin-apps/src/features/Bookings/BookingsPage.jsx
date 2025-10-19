

import BookingPageRow from "@/features/Bookings/components/BookingTableRowsView";


export default function BookingPage() {
    return (<>
        <div className="flex flex-col px-10 py-3 h-full overflow-auto">
            <h1 className="font-bold text-xl">Semua Booking</h1>
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
                    <BookingPageRow />
                    <BookingPageRow />
                    <BookingPageRow />
                    <BookingPageRow />
                    <BookingPageRow />
                    <BookingPageRow />
                    <BookingPageRow />
                    <BookingPageRow />
                    <BookingPageRow />
                    <BookingPageRow />
                    <BookingPageRow />
                    <BookingPageRow />
                    <BookingPageRow />
                    <BookingPageRow />
                    <BookingPageRow />
                </tbody>
            </table>
        </div>

    </>)
}