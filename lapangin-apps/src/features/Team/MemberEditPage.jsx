'use client'
import { useEffect, useState } from 'react';

/**
 * 
*/
// utils
import api from '@/utils/axiosClient/axiosInterceptor.js'

// store
import useVenueStore from '@/shared/stores/venueStore';
import useTeamStore from '@/shared/stores/teamStore';
import ConfirmationMessage from '../components/ConfirmationMessage';

// components
import ToggleButton from '../components/ToggleButton';

export default function MemberEditPage({ selectedMember, onClose }) {
    const { team, getTeam } = useTeamStore();
    const { venueMetadata, getVenueMetadata, activeVenue } = useVenueStore();

    // State untuk data anggota
    const [member, setMember] = useState(null);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('');
    const [isActive, setIsActive] = useState(false);

    // State untuk UI
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [changesOccured, setChangesOccured] = useState(false); // track for changes, true if changes occured
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [confirmDeactivate, setConfirmDeactivate] = useState(false);

    
    // set state after the component is mounted, and tract forchanges
    useEffect(() => {
        if (team && selectedMember && ( // makesure this session only triggred once
            name === '' &&
            phone === '' &&
            role === '' && // this all is a init values
            isActive === false
        )) {
            //setMember(memberData);
            setName(selectedMember.name || '');
            setPhone(selectedMember.phone || '');
            setRole(selectedMember.role || '');
            setIsActive(selectedMember.is_active);
            return;
        }
        if(selectedMember &&
           ( name !== (selectedMember.name ?? '') ||
            phone !== (selectedMember.phone ?? '') ||
            role !== (selectedMember.role ?? '')  ||
            isActive !== (selectedMember.is_active ?? false))
        ) { // if changes occured, set changesOccured to true to enable save button
            setChangesOccured(true);
        }
    }, [name, phone, role, isActive, team, selectedMember]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            // check input 
            if(name.length === 0 || phone.length === 0 || role.length !== 0) {
                setError('please enter all fields');
                setIsLoading(false);
                return;
            }

            await api.put(`/team/update_member/${activeVenue.venueId || venueMetadata.id}/${selectedMember.email}`, {
                name: name,
                phone: phone,
                role: role,
                isActive: isActive
            })
            .catch(err => {
                console.log(err);
            })
            await getTeam(); // refresh team data after update, ensure data is up to date after editing
            onClose(); // close edit page after save changes
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menyimpan perubahan.');
        } finally {
            setIsLoading(false);
        }
    };
    const deleteUser = async () => {
        setIsLoading(true);
        setError(null);
        try{
            await api.delete(`/team/delete_member/${activeVenue.venueId || venueMetadata.id}/${selectedMember.email}`)
            await getTeam(); // refresh team data after update, ensure data is up to date after editing
            onClose(); // close edit page after save changes
        }catch(err){
            setError(err.response?.data?.message || 'Gagal menghapus anggota.');
        }finally{
            setIsLoading(false);
        }
    }

    if (!selectedMember) {
        return (
            <>
                <div className='fixed inset-0 z-45 bg-gray-900/50 backdrop-blur-xs' onClick={onClose}></div>
                <div className="fixed z-48 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 text-white p-8 rounded-xl shadow-lg w-full max-w-md">
                    <p>{error || 'Memuat data anggota...'}</p>
                </div>
            </>
        );
    }

    return (
        <>
        {confirmDelete && <ConfirmationMessage
            title="Hapus Akses Pengguna?"
            message={"Menghapus berarti pengguna ini tidak akan lagi mendapat akses."}
            onConfirm={() => {deleteUser(); setConfirmDelete(false);}}
            onCancel={() => setConfirmDelete(false)}
            delayConfirm={true}
            delaySecond={3}
        />}
            <div className='fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-xs' onClick={onClose}></div>
            <div className="fixed z-45 top-1/2 left-1/2 overflow-auto scrollbar-hide -translate-x-1/2 -translate-y-1/2 bg-gray-800 text-white p-8 rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh]">
                <button onClick={onClose} disabled={isLoading} className="absolute top-4 right-6 text-4xl hover:text-red-500 transition-colors disabled:text-gray-500">&times;</button>
                <h2 className="text-2xl font-bold mb-6">Edit Anggota: {selectedMember.name}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="editMemberName" className="block mb-1 font-medium">Nama Anggota</label>
                            <input id="editMemberName" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 rounded bg-gray-700 border border-gray-600" required />
                        </div>
                        <div>
                            <label htmlFor="editMemberEmail" className="block mb-1 font-medium">Email</label>
                            <input id="editMemberEmail" type="email" value={selectedMember.email} className="w-full p-2 rounded bg-gray-900 border border-gray-700 cursor-not-allowed" disabled />
                        </div>
                        <div>
                            <label htmlFor="editMemberPhone" className="block mb-1 font-medium">Nomor Telepon</label>
                            <input id="editMemberPhone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-2 rounded bg-gray-700 border border-gray-600" />
                        </div>
                        <div>
                            <label htmlFor="editMemberRole" className="block mb-1 font-medium">Role</label>
                            <select id="editMemberRole" value={role} onChange={(e) => setRole(e.target.value)} className="w-full p-2 rounded bg-gray-700 border border-gray-600">
                                <option value="member">Staff</option>
                                <option value="admin">Admin</option>
                                <option value="owner">Owner</option>
                            </select>
                        </div>
                        <div className="flex flex-col items-start gap-4">
                            <label className="font-medium">Status Anggota</label>
                            <div className='flex gap-3 justify-start items-center'>
                                <ToggleButton isActive={isActive} onClick={() => setIsActive(!isActive)} />
                                <span className={isActive ? 'text-green-400' : 'text-red-400'}>{isActive ? 'Aktif' : 'Tidak Aktif'}</span>
                            </div>
                        </div>
                        <div className='flex flex-col gap-3 justify-start'>
                            <label className="font-medium">Hapus akses pengguna: </label>
                            <div className='flex gap-2'>
                                <button type='button' onClick={() => setConfirmDelete(true)} disabled={isLoading} className={`px-3 py-1 cursor-pointer bg-${isLoading? 'gray' : 'red'}-700 hover:bg-${isLoading? 'gray' : 'red'}-600 rounded-lg w-fit font-bold`}>Hapus</button>
                            </div>
                        </div>
                    </div>
                </form>
                {error && <p className="text-red-400 text-sm text-center mt-4">{error}</p>}
                <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-gray-700">
                    <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 rounded-xl bg-gray-600 hover:bg-gray-500 cursor-pointer">Batal</button>
                    <button type="submit" disabled={!changesOccured || isLoading} onClick={(e) => { if(changesOccured) handleSubmit(e); }} className={`px-4 py-2 rounded-xl bg-${changesOccured ? 'green' : 'gray'}-700 hover:bg-${changesOccured ? 'green' : 'gray'}-600 disabled:bg-gray-500 ${isLoading? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                        {isLoading ? 'Menyimpan...' : 'Simpan'}
                    </button>
                </div>
            </div>
        </>
    );
}