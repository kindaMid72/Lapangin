import { getUserSession } from '@/utils/supabase/client.js';
import { create } from 'zustand';

/**
 *  This store will containt session of an active user, and will fetch session for 'that' active user
 */

// Gunakan nama yang lebih deskriptif, sesuai dengan yang Anda gunakan di komponen lain.
const useAuthStore = create((set, get) => ({
    session: null,
    isLoading: false, // Tambahkan state untuk loading

    // Buat fungsi async untuk mengambil sesi
    fetchSession: async () => {
        try {
            // Panggil dan tunggu hasil dari getUserSession
            const { data, error } = await getUserSession();
            if(error) throw error;
            // Simpan data sesi yang sebenarnya, bukan Promise
            set({ session: data.session, isLoading: false });
        } catch (error) {
            console.error("Failed to fetch session:", error);
            // Jika gagal, pastikan sesi null dan loading selesai
            set({ session: null, isLoading: false });
        }
    },

    // Fungsi untuk membersihkan sesi saat logout
    clearSession: () => set({ session: null }),
}))

export default useAuthStore;