
// components
import Navbar from '@/features/components/MainAppNavbar.jsx';

export default function NavBar({children}){
    return (
        <div className='flex flex-col'>
            <Navbar></Navbar>
            {children}
        </div>
    )
}