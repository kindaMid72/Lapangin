import createUserInstance from "./user.js";

export default async function checkUserTokenAndReturnId(authorization) { // accept authorization headers ('bearer <TOKEN>')
    const supabase = await createUserInstance(authorization);
    const { data, error } = await supabase.auth.getUser();

    // Jika ada error ATAU tidak ada user yang ditemukan, token tidak valid.
    if (error || !data?.user) {
        return false;
    }
    return data.user.id;
}