import createUserInstance from "../../libs/supabase/user.js";
import createAdminInstance from "../../libs/supabase/admin.js";

// this function will check if token(user) given has access to protected resources as member
export default async function checkUserAccess(authorization, venue_id) {
    const sbAdmin = await createAdminInstance();
    const thatUser = await createUserInstance(authorization);

    const { data: { user }, error: userError } = await thatUser.auth.getUser();

    if (userError || !user) {
        return false; // or throw some error
        // for now, just return false that indicate that user didnt have that access
    }

    // check if the user have access by checking if the role for that venue if either admin or manager
    const { data, error } = await sbAdmin 
        .from('user_venues')
        .select('role', { count: 'exact' }) // Minta Supabase menghitung jumlah baris
        .eq('venue_id', venue_id)
        .eq('user_id', user.id) // Gunakan user.id yang sudah divalidasi
        .in('role', ['owner', 'admin', 'member', 'staff']); // Periksa apakah perannya adalah admin, owner, atau member

    // Jika ada error saat query atau tidak ada baris yang cocok (count === 0), maka tidak punya akses
    return !error && data && data.length > 0;
}