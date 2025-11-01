'use client'
// supabase for client

// Impor `createBrowserClient` dari `@supabase/ssr` untuk client-side di Next.js App Router.
// Ini akan memastikan sesi dikelola melalui cookies.
import { createBrowserClient } from "@supabase/ssr";

export async function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
}
export async function getUserSession() {
    return await createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ).auth.getSession();
}