"use client"
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

// store
import useSessionStore from '@/shared/stores/authStore.js';
import useVenueStore from '@/shared/stores/venueStore.js';

export default function NavBar() {

    // store
    const { session } = useSessionStore();

    const { activeVenue, setActiveVenue } = useVenueStore();
    // activeVenue: userRole
    const router = useRouter();
    const params = useParams();
    const { user_id } = params;

    // state
    const [selectedMenu, setSelectedMenu] = useState('bookings');
    const [showSiderBar, setShowSiderbar] = useState(false);

    // class ui element
    const activeClass = 'px-3 border-1 border-transparent py-1 bg-green-800 rounded-lg h-fit ';
    const inactiveClass = 'px-3 py-1 border-1 border-gray-600 bg-transparent hover:border-transparent rounded-lg h-fit ';

    // handler
    const handleNavigate = (path) => {
        router.push(`/${params.user_id}/${params.venue_id}/${path}`);
        setSelectedMenu(path);
    }

    return (<div className='sticky top-0 z-50 h-fit w-full'>
        <div className='flex items-center  flex-wrap sticky gap-4 light:bg-slate-100 dark:bg-slate-900 [&_li]:hover:bg-green-700 [&_li]:cursor-pointer text-[1em] p-2 [&_li]:font-mono [&_li]:text-[1em]'>
            <div className='flex items-center ml-4'>
                <i onClick={() => { setShowSiderbar(prev => !prev); }} className='fa-solid fa-bars text-xl hover:!text-green-400 cursor-pointer !text-green-200'></i>
            </div>
            <p className="px-3 py-1 hover:!bg-transparent text-green-500 rounded-lg !font-[900] !text-2xl ">Lapangin</p>
            <div className='flex flex-1 justify-end px-1 items-end gap-2 mr-2 w-full'>
                {session?.user ? ( // session bisajadi belum ada saat page di load, jadi gunakan implementasi ini
                    <div>
                        <h3 className='w-45 overflow-hidden text-ellipsis text-nowrap '>{session.user.email}</h3>
                        <h2 className='w-45 overflow-hidden text-ellipsis text-nowrap text-[0.8em] font-extralight'>{activeVenue?.userRole}</h2> {/* role section */}
                    </div>
                ) : (
                    <div className='w-20 h-6 bg-gray-700 rounded animate-pulse'></div> // Tampilkan skeleton loading jika sesi belum ada
                )}
            </div>
        </div>
        <div className='fixed h-full'>
            {showSiderBar &&
                <div className='w-fit min-w-40 md:min-w-60 min-h-full h-full z-45 '>
                    <ul className=" flex flex-col items-start px-5  gap-4 light:bg-slate-100 h-full  dark:bg-slate-900 [&_li]:hover:bg-green-700 [&_li]:cursor-pointer text-[1em] p-2 [&_li]:font-mono [&_li]:text-[1em] rounded-b-xl">
                        {/* <div className='flex items-center'>
                            <i onClick={() => {setShowSiderbar(prev => !prev);}} className='fa-solid fa-bars text-xl hover:!text-green-400 cursor-pointer !text-green-200'></i>
                            <p className="px-3 py-1 hover:!bg-transparent text-green-500 rounded-lg !font-[900] !text-2xl ">Lapangin</p>
                        </div> */}
                        {activeVenue?.userRole === 'admin' || activeVenue?.userRole === 'owner' &&
                        <>
                        {/* <li className={`w-full ${selectedMenu === 'dashboard' ? activeClass : inactiveClass} transition-color duration-100 ease-in-out`} onClick={() => handleNavigate('dashboard')}><i className="fa-solid fa-table mr-2 "></i>Dashboard</li> */}
                        <li className={`w-full ${selectedMenu === 'bookings' ? activeClass : inactiveClass} transition-color duration-100 ease-in-out`} onClick={() => handleNavigate('bookings')}><i className="fa-solid fa-calendar mr-2 "></i>Bookings</li>
                        <li className={`w-full ${selectedMenu === 'courts' ? activeClass : inactiveClass} transition-color duration-100 ease-in-out`} onClick={() => handleNavigate('courts')}><i className="fa-solid fa-layer-group mr-2 "></i>Courts</li>
                        {/* <li className={`w-full ${selectedMenu === 'reports' ? activeClass : inactiveClass} transition-color duration-100 ease-in-out`} onClick={() => handleNavigate('reports')}><i className="fa-solid fa-chart-simple mr-2 "></i>Report</li> */}
                        <li className={`w-full ${selectedMenu === 'team' ? activeClass : inactiveClass} transition-color duration-100 ease-in-out`} onClick={() => handleNavigate('team')}><i className="fa-solid fa-people-group mr-2 "></i>Team</li>
                        <li className={`w-full ${selectedMenu === 'settings' ? activeClass : inactiveClass} transition-color duration-100 ease-in-out`} onClick={() => handleNavigate('settings')}><i className="fa-solid fa-gear mr-2 "></i>Settings</li>
                        <li className={`w-full flex-1 relative hover:!bg-transparent `} onClick={() => { router.push(`/${params.user_id}`) }}>
                            <div className='flex gap-3 absolute items-center justify-center hover:!text-red-500 transition duration-100 ease-in bottom-17'>
                                <i className="fa-solid fa-arrow-right-from-bracket"></i> <p>keluar</p>
                            </div>
                        </li>
                        </>
                        }
                        {activeVenue?.userRole !== 'admin' && activeVenue?.userRole !== 'owner' &&
                        <>
                            <li className={`w-full ${selectedMenu === 'bookings' ? activeClass : inactiveClass} transition-color duration-100 ease-in-out`} onClick={() => handleNavigate('bookings')}><i className="fa-solid fa-calendar mr-2 "></i>Bookings</li>
                            <li className={`w-full ${selectedMenu === 'courts' ? activeClass : inactiveClass} transition-color duration-100 ease-in-out`} onClick={() => handleNavigate('courts')}><i className="fa-solid fa-layer-group mr-2 "></i>Courts</li>
                            <li className={`w-full flex-1 relative hover:!bg-transparent `} onClick={() => { router.push(`/${params.user_id}`) }}>
                                <div className='flex gap-3 absolute items-center justify-center hover:!text-red-500 transition duration-100 ease-in bottom-17'>
                                    <i className="fa-solid fa-arrow-right-from-bracket"></i> <p>keluar</p>
                                </div>
                            </li>
                        </>
                        
                        }
                    </ul>

                </div>
            }

        </div>

    </div>
    )
}