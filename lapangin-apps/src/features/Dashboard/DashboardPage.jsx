
// components
import ShowCard from "@/features/Dashboard/components/ShowCard";
import BookingPageRow from "../components/BookingTableRowsView.jsx";


export default function Dashboard() {

    return (<div>
        <div className="p-5">
            <h1 className="font-extrabold text-2xl">Dashboard</h1>
            <p className="font-extralight">Ringkasan performa vanue anda.</p>
        </div>
        
        <div className="flex flex-nowrap gap-3 p-4 justify-evenly items-stretch"> {/* infomation card section */}
            <ShowCard title="Booking Hari ini" value="12" statisticValue={"12% from yesterday"} icon={<i class="fa-solid fa-calendar text-[3em] text-green-500"></i>}/>
            <ShowCard title='Pendapatan Mingguan' value="Rp 8.000.000" statisticValue={"8% dari minggu lalu"} icon={<i class="fa-solid fa-dollar-sign text-[3em] text-green-500"></i>}/>
            <ShowCard title='Rasio Terisi' value="69%" statisticValue={"8% dari minggu lalu"} icon={<i class="fa-solid fa-percent text-[3em] text-green-500"></i>}/>
            <ShowCard title='Pendapatan Mingguan' value="Rp. 8.000.000" statisticValue={"8% dari minggu lalu"} icon={<i class="fa-solid fa-chart-line text-[3em] text-green-500"></i>}/>
        </div>

        <div className="flex flex-col p-5 py-3 h-full overflow-auto">
            <h1 className="font-bold text-xl">Booking Hari ini</h1>
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
                </tbody>
            </table>
        </div>

        
    </div>)
}