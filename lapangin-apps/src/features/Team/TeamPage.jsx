'use client'

// imports
import { useEffect, useState } from 'react';
import { Temporal } from '@js-temporal/polyfill';

// library

// FIXME: fetch gagal


//components
import InfoCard from "../components/InfoCard";
import UserRowsData from "./UserRowsData";
import ConfirmationMessage from "../components/ConfirmationMessage";
import PopUpMessage from '../components/PopUpMessage';
// Pages component
import MemberEditPage from "./MemberEditPage.jsx";
import InviteMember from './InviteMember.jsx';

// utils

// stores
import useTeamStore from "@/shared/stores/teamStore.js";
import useVenueStore from "@/shared/stores/venueStore.js";


export default function TeamPage() {
    // stores 
    const { venueMetadata, getVenueMetadata, activeVenue } = useVenueStore();
    const { team, getTeam } = useTeamStore(); // team contain all medatadata for this team features
                                             // getTeam will fetch them, call this if update occured

    // state
    const [member, setMember] = useState([]); // store all member from this venue, this is local state
    const [totalMember, setTotalMember] = useState(0);
    const [totalActive, setTotalActive] = useState(0);
    const [selectedMember, setSelectedMember] = useState(null);
    const [totalNonActive, setTotalNonActive] = useState(0);

    const [showInviteMemberPage, setShowInviteMemberPage] = useState(false);
    const [showEditPage, setShowEditPage] = useState(false);

    const [popUpMessage, setPopUpMessage] = useState(null);

    // handler


    // on mount handler
    useEffect(() => {
        getTeam();
    }, [activeVenue]);

    // Update local member state when team data from the store changes
    useEffect(() => {
        if (team && team.allMemberData) {
            setMember(team.allMemberData);
            setTotalMember(team.totalMember);
            setTotalActive(team.totalActive);
            setTotalNonActive(team.totalNonActive);
        }
    }, [team]);

    return (
        <>
    {popUpMessage && <PopUpMessage 
        title={popUpMessage?.title}
        message={popUpMessage?.message }
        titleColor={popUpMessage?.titleColor}
        onClose={() => setPopUpMessage(null)} // un mount the element
    />}

    {showInviteMemberPage && <InviteMember 
        onClose={() => setShowInviteMemberPage(null)}
        setPopUpMessage={setPopUpMessage}
    />}
    {showEditPage && <MemberEditPage 
        selectedMember={selectedMember} 
        onClose={() => {setShowEditPage(false); setSelectedMember(null); }} // reset local state after edit page closed 
        setPopUpMessage={setPopUpMessage}
    />}


    <div className="min-h-screen h-fit bg-white dark:bg-gray-800">
        {/* header section */}
        <div className="flex justify-start w-full p-4 h-fit dark:bg-gray-800"> {/** header */}
            <div className="flex-1">
                <h1 className="text-xl font-extrabold">Kelola Tim</h1>
                <p className="text-sm font-light">Atur anggota tim dan izin akses mereka</p>
            </div>
            <div onClick={() => {setShowInviteMemberPage(true)}} className="flex cursor-pointer gap-3 rounded-xl bg-green-800 hover:bg-green-700 px-4 py-2 h-fit justify-around items-center w-fit">
                <i className="fa-solid fa-user-plus"></i>
                <p>Tambah Anggota</p>
            </div>
        </div>

        <div className="flex flex-wrap justify-evenly content-stretch gap-3 p-4 [&>*]:flex-1 ">
            <InfoCard title="Total Anggota" value={totalMember} icon={<i className="fa-solid fa-users-rays text-green-300"></i>} />
            <InfoCard title="Aktif" value={totalActive} icon={<i className="fa-solid fa-user-check text-blue-300"></i>} />
            <InfoCard title="Tidak Aktif" value={totalNonActive} icon={<i className="fa-solid fa-user-slash text-red-300"></i>} />
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
                    {member.map((member, index) => {
                        return (
                            <UserRowsData
                                key={member.email}
                                Anggota={member.name}
                                Kontak={{ email: member.email, phone: member.phone }}
                                Role={member.role}
                                Status={member.is_active}
                                Bergabung={member.join_at}
                                onEdit={() => {setShowEditPage(true); setSelectedMember(member)}}
                            />
                        )
                    })}
                </tbody>
            </table>
        </div>
    </div>
        </>)
}