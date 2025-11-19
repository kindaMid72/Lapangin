'use client'
import { useState } from 'react';

// utils
import api from '@/utils/axiosClient/axiosInterceptor.js';

// store
import useTeamStore from '@/shared/stores/teamStore';
import useVenueStore from '@/shared/stores/venueStore';

// components
import ConfirmationMessage from '../components/ConfirmationMessage';



export default function InviteMember({ onClose, setPopUpMessage }) {
    const { team, getTeam } = useTeamStore();
    const { venueMetadata, getVenueMetadata, activeVenue } = useVenueStore();

    // state
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('member'); // Default role

    // ui state
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [confirmInvite, setConfirmInvite] = useState(false);

    // handler
    async function handleSend() {
        setIsLoading(true);
        setError(null);

        setPopUpMessage(null);
        setTimeout(async () => {
            try {
                if (!email || !role) {
                    setError('Email dan Role tidak boleh kosong.');
                    setIsLoading(false);
                    return;
                }

                const response = await api.post(`/team/invite_member/${activeVenue.venueId || venueMetadata.id}`, {
                    email: email,
                    role: role,
                });
                if(response.status === 403){
                    setPopUpMessage({ title: 'Invitation Gagal di Kirim', message: 'kayaknya email ini udah ada di tim kamu, cek dulu deh!', titleColor: 'red' })
                }else{
                    setPopUpMessage({ title: 'Invitation Berhasil Dikirim', message: 'beritahu mereka untuk login dan terima invitenya!', titleColor: 'green' })
                }
                // Blok ini sekarang hanya akan berjalan jika response.status adalah 2xx
                await getTeam(); // Refresh data tim setelah berhasil mengundang
                onClose(); // Tutup modal
            } catch (err) {
                console.error('Gagal mengirim undangan:', err);
                setError(err.response?.data?.message || 'Gagal mengirim undangan.');
            } finally {
                setIsLoading(false);
            }

        }, 50)

    }

    return (<>
        {confirmInvite && <ConfirmationMessage
            title="Undang Anggota?"
            message={"Pengguna akan mendapat akses bedasarkan role yang sudah ditetapkan sebelumnya, semua undangan yang dikirim sebelumnya akan jadi tidak valid."}
            onConfirm={() => { setConfirmInvite(false); handleSend(); }}
            onCancel={() => { setConfirmInvite(false); }}
            delayConfirm={true}
            delaySecond={1}
            confirmColor='green'
            cancelColor='gray'
        />}
        <div className='fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-xs' onClick={onClose}></div>
        <div className="fixed z-45 top-1/2 left-1/2 overflow-auto scrollbar-hide -translate-x-1/2 -translate-y-1/2 bg-gray-800 text-white p-8 rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh]">
            <button onClick={onClose} disabled={isLoading} className="absolute top-4 right-6 text-4xl hover:text-red-500 transition-colors disabled:text-gray-500">&times;</button>
            <h2 className="text-2xl font-bold mb-6">Undang Anggota Baru</h2>
            <form onSubmit={handleSend} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="inviteMemberEmail" className="block mb-1 font-medium">Email</label>
                        <input id="inviteMemberEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 rounded bg-gray-700 border border-gray-600" placeholder="contoh@email.com" required />
                    </div>
                    <div>
                        <label htmlFor="inviteMemberRole" className="block mb-1 font-medium">Role</label>
                        <select id="inviteMemberRole" value={role} onChange={(e) => setRole(e.target.value)} className="w-full p-2 rounded bg-gray-700 border border-gray-600">
                            <option value="member">Staff</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>
            </form>
            {error && <p className="text-red-400 text-sm text-center mt-4">{error}</p>}
            <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-gray-700">
                <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 rounded-xl bg-gray-600 hover:bg-gray-500 cursor-pointer">Batal</button>
                <button type="submit" onClick={() => { setConfirmInvite(true); }} disabled={isLoading} className="px-4 py-2 cursor-pointer rounded-xl bg-green-700 hover:bg-green-600 disabled:bg-gray-500">
                    {isLoading ? 'Mengirim...' : 'Undang'}
                </button>
            </div>
        </div>
    </>)
}