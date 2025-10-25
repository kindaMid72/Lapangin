"use client"
import { useRouter } from 'next/navigation';
import { act, useState } from 'react';


export default function NavBar() {

    const router = useRouter();

    // state
    const [selectedMenu, setSelectedMenu] = useState('dashboard');
        // class ui element
    const activeClass ='px-3 border-1 border-transparent py-1 bg-green-800 rounded-lg h-fit';
    const inactiveClass = 'px-3 py-1 border-1 border-gray-600 bg-transparent rounded-lg h-fit';



    return (
        <ul className="flex flex-wrap gap-4 light:bg-slate-100 items-center dark:bg-slate-900 [&_li]:hover:bg-green-700 [&_li]:cursor-pointer text-[1em] p-2 [&_li]:font-mono [&_li]:text-[1em] rounded-b-xl">
            <li className="px-3 py-1 hover:!bg-transparent text-green-500 rounded-lg !font-[900] !text-2xl ">Lapangin</li>
            <li className={selectedMenu === 'dashboard' ? activeClass : inactiveClass } onClick={() => {router.replace('/dashboard'); setSelectedMenu('dashboard')}}><i className="fa-solid fa-table mr-2 "></i>Dashboard</li>
            <li className={selectedMenu === 'bookings' ? activeClass : inactiveClass } onClick={() => {router.replace('/bookings'); setSelectedMenu('bookings')}}><i className="fa-solid fa-calendar mr-2 "></i>Bookings</li>
            <li className={selectedMenu === 'courts' ? activeClass : inactiveClass } onClick={() => {router.replace('/courts'); setSelectedMenu('courts')}}><i className="fa-solid fa-layer-group mr-2 "></i>Courts</li>
            <li className={selectedMenu === 'reports' ? activeClass : inactiveClass } onClick={() => {router.replace('/reports'); setSelectedMenu('reports');}}><i className="fa-solid fa-chart-simple mr-2 "></i>Report</li>
            <li className={selectedMenu === 'team' ? activeClass : inactiveClass } onClick={() => {router.replace('/team'); setSelectedMenu('team');}}><i className="fa-solid fa-people-group mr-2 "></i>Team</li>
            <li className={selectedMenu === 'settings' ? activeClass : inactiveClass } onClick={() => {router.replace('/settings'); setSelectedMenu('settings');}}><i className="fa-solid fa-gear mr-2 "></i>Settings</li>
            <div className='flex flex-1 justify-end items-center gap-2 mr-2'>
                <h3>{'Sosok Hitam'}</h3>
                <div className='overflow-hidden rounded-full size-[35px] bg-gray-200'>
                    <img src='/sosok_hitam.png' className='' ></img>
                </div>
            </div>
        </ul>
    )
}