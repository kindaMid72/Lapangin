
// components
import Navbar from '@/features/components/MainAppNavbar.jsx';

export default function NavBar({children}){
    return (
        <div className='flex flex-col bg-white dark:bg-gray-800 min-h-screen h-fit'>
            <Navbar></Navbar>
            {children}
        </div>
    )
}