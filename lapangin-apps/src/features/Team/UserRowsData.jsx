'use client'

/**
 * 
 */

import { useEffect, useRef } from 'react';

export default ({ Anggota, Kontak, Role, Bergabung, Status, onEdit,  }) => {

    // state
    const clickFocus = useRef(null);
    const excludeFocusButton = useRef(null);

    // formatted date
    const date = new Date(Bergabung);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;


    // handler
    // click focus handler for edit dropdown menu
    function clickFocusHandler(e) {
        clickFocus.current.classList.toggle('hidden');
    }
    useEffect(() => {
        // 1. check if the current focus is the children or not
        // 2. if not, hide element
        // 3. if true, do nothing
        // 4. remove the event listener if the component is unmounted
        function checkFocus(e) {
            if (clickFocus.current && !clickFocus.current.contains(e.target) && !excludeFocusButton.current.contains(e.target)) { // prevent race condition
                clickFocus.current.classList.add('hidden');
            }
        }
        document.addEventListener('mousedown', checkFocus);
        return () => {
            document.removeEventListener('mousedown', checkFocus);
        }

    }, [clickFocus, excludeFocusButton])


    return (<>
        <tr key={Kontak.email} className="text-center [&_td]:border-b-1 [&_td]:border-b-gray-700 [&_td]:p-2">
            <td> {/** anggota */}
                {Anggota}
            </td>
            <td>{/* kontak */}
                <p><i className="fa-solid fa-envelope"></i> {Kontak.email}</p>
                <p><i className="fa-solid fa-phone"></i> {Kontak.phone || 'tidak ada'}</p>
            </td>
            <td>{/** role */}
                <div className="flex justify-center cursor-default">
                    <p className="font-bold text-white">{Role}</p>
                </div>
            </td>
            <td>{/**  Bergabung: tanggal */}
                <span className="flex justify-center gap-2 items-center">
                    <i className="fa-solid fa-calendar"></i>
                    <p>{formattedDate}</p>
                </span>
            </td>
            <td>{/* status */}
                <div className={''}>
                    {Status === true ? <i className='fa-solid fa-user-check text-blue-300'></i>: <i className='fa-solid fa-user-slash text-red-300'></i>}
                </div>
            </td>
            <td className='relative'>{/** aksi */}
                <div className="flex items-center justify-center">
                    <div  onClick={onEdit} className="p-2 rounded-full hover:bg-gray-600 w-fit h-fit cursor-pointer flex justify-center items-center">
                        <i className="fa-solid fa-pen-to-square"></i>
                    </div>
                </div>
                {/* dropdown menu */}
                <div  className="hidden absolute right-5 top-13 w-fit z-40 dark:bg-gray-800 bg-white">
                    <ol className='flex items-center flex-col border-1 p-1 bg-white dark:bg-gray-600 rounded-xl max-w-fit text-white dark:text-white  font-bold dark:[&_li]:hover:bg-yellow-300 [&_li]:hover:bg-yellow-500 border-transparent [&_li]:cursor-pointer [&_li]:p-1 [&_li]:rounded-lg [&_li]:w-full [&_li]:hover:text-black '>
                        <li className='flex gap-3 items-center min-w-fit'> <i className="fa-solid  fa-pen"></i><p className='flex-1 text-nowrap'>Edit</p></li>
                        <li className='flex gap-3 items-center min-w-fit'> <i className="fa-solid  fa-shield-halved"></i> <p className='flex-1 text-nowrap'>Kelola Akses</p></li>
                        <li className='flex gap-3 items-center min-w-fit'> <i className="fa-solid  fa-user-minus"></i> <p className='flex-1 text-nowrap'>Non-Aktifkan</p></li>
                        <li className='flex gap-3 items-center min-w-fit hover:[&_i]:text-red-700 hover:[&_p]:text-red-700'> <i className="fa-solid  fa-trash "></i> <p className='flex-1 text-nowrap'>Hapus</p></li>
                    </ol>
                </div>
            </td>
        </tr>

    </>)
}