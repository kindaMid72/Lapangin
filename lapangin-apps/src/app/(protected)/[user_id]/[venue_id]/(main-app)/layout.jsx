
'use client';
import { useEffect } from 'react';

// store
import useSessionStore from '@/shared/stores/authStore.js';

// components
import Navbar from '@/features/components/MainAppNavbar.jsx';

export default function MainAppLayout({ children }) {
    const { session, fetchSession } = useSessionStore();

    useEffect(() => {
        fetchSession();
    }, [fetchSession]); // Dependency array memastikan ini hanya berjalan sekali saat komponen dimuat

    return (
        <div className='flex flex-col bg-white dark:bg-gray-800 min-h-screen h-fit'>
            <Navbar></Navbar>
            {children}
        </div>
    )
}