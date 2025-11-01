
// supabase for client

// Impor `createBrowserClient` dari `@supabase/ssr` untuk client-side di Next.js App Router.
// Ini akan memastikan sesi dikelola melalui cookies.
import { createClient } from "@supabase/supabase-js";

export default function createUserInstance(authorization) { // accept whole request as a parameters, then extract token from headers
    return createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY,
        {
            global: {
                headers: {
                    Authorization: authorization
                }
            }
        }
    );
}