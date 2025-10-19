"use client"
import { useRouter } from 'next/navigation';


export default function NavBar() {

    const router = useRouter();


    return (
        <ul className="flex flex-wrap gap-4 light:bg-slate-100 items-center dark:bg-slate-900 [&_li]:hover:bg-green-700 [&_li]:cursor-pointer text-[1em] p-2 [&_li]:font-mono [&_li]:text-[1em] rounded-b-xl">
            <li className="px-3 py-1 hover:!bg-transparent text-green-500 rounded-lg !font-[900] !text-2xl ">Lapangin</li>
            <li className="px-3 py-1 bg-green-800 rounded-lg h-fit" onClick={() => router.replace('/dashboard')}><i className="fa-solid fa-table mr-2 "></i>Dashboard</li>
            <li className="px-3 py-1 bg-green-800 rounded-lg h-fit" onClick={() => router.replace('/bookings')}><i className="fa-solid fa-calendar mr-2 "></i>Bookings</li>
            <li className="px-3 py-1 bg-green-800 rounded-lg h-fit" onClick={() => router.replace('/courts')}><i className="fa-solid fa-layer-group mr-2 "></i>Courts</li>
            <li className="px-3 py-1 bg-green-800 rounded-lg h-fit" onClick={() => router.replace('/reports')}><i className="fa-solid fa-chart-simple mr-2 "></i>Report</li>
            <li className="px-3 py-1 bg-green-800 rounded-lg h-fit" onClick={() => router.replace('/team')}><i className="fa-solid fa-user-plus mr-2 "></i>Team</li>
            <div className='flex flex-1 justify-end items-center gap-2 mr-2'>
                <h3>{'Sosok Hitam'}</h3>
                <div className='overflow-hidden rounded-full size-[35px] bg-gray-200'>
                    <img src='/sosok_hitam.png' className='' ></img>
                </div>
            </div>
        </ul>
    )
}