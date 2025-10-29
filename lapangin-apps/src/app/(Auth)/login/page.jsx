

"use client"; // Jika ada interaksi form, jadikan Client Component

import Login_Page from "@/features/Auth/Login_Page";
// import { login } from './actions'; // Impor server action jika Anda membuatnya

export default () => {
    return (
        <>
            <Login_Page />
        </>
    )
}