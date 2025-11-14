'use client'

// imports
import React, {useState, useEffect, useRef} from 'react';

// library


//components
import InfoCard from "../components/InfoCard";
import UserRowsData from "./UserRowsData";
import ConfirmationMessage from "../components/ConfirmationMessage.jsx";

// utils
import api from '../../utils/axiosClient/axiosInterceptor.js';

// stores
import useVenueStore from "@/shared/stores/venueStore.js";
import useTeamStore from "@/shared/stores/teamStore.js";


export default function TeamPage() {
    // stores 
    const {venueMetadata, getVenueMetadata, activeVenue} = useVenueStore();
    const {team, getTeam} = useTeamStore();

    // state
    const [member, setMember] = useState([]); // store all member from this venue, this is local state
    
    
    // on mount handler
    useEffect(() => {
        if(team){
            setMember(team.allMemberData);
        }else{
            getTeam();
        }
    }, [venueMetadata, activeVenue])



    return (<div className="min-h-screen h-fit bg-white dark:bg-gray-800">
        {/* header section */}
        <div className="flex justify-start w-full p-4 h-fit dark:bg-gray-800"> {/** header */}
            <div className="flex-1">
                <h1 className="text-xl font-extrabold">Kelola Tim</h1>
                <p className="text-sm font-light">Atur anggota tim dan izin akses mereka</p>
            </div>
            <div className="flex gap-3 rounded-xl bg-green-800 hover:bg-green-700 px-4 py-2 h-fit justify-around items-center w-fit">
                <i className="fa-solid fa-user-plus"></i>
                <p>Tambah Anggota</p>
            </div>
        </div>

        {/* info view card section */}
        <div className="flex flex-wrap justify-evenly content-stretch gap-3 p-4 [&>*]:flex-1 ">
            <InfoCard title="Total Anggota" value={5} icon={<i className="fa-solid fa-users-rays text-green-300"></i>}/>
            <InfoCard title="Aktif" value={32} icon={<i className="fa-solid fa-user-check text-blue-300"></i>}/>
            <InfoCard title="Tidak Aktif" value={2} icon={<i className="fa-solid fa-user-slash text-red-300"></i>} />
        </div>

        {/* user list section */}
        <div className="p-3 w-full h-fit dark:bg-gray-800 bg-white">
        <table className="border-2 w-full h-fit dark:bg-gray-800 border-gray-700 rounded-xl border-separate border-spacing-0 [&_th]:p-2">
            <thead >
                {/* Anggota, role, status, action */}
                <tr className=" [&_th]:border-b-2 [&_th]:border-gray-700 [&_th]:text-center bg-gray-900 ">
                    <th className="rounded-tl-xl">Anggota</th>
                    <th>Kontak</th>
                    <th>Role</th>
                    <th>Bergabung</th>
                    <th>Status</th>
                    <th className="rounded-tr-xl">Aksi</th>
                </tr>
            </thead>
                
            <tbody className="h-fit bg-white dark:bg-gray-800">
                {member.map((member, index)=> {
                    return (
                        <UserRowsData 
                            Anggota={member}
                        />
                    )
                } )}
            </tbody>
        </table>
        </div>
    </div>)
}