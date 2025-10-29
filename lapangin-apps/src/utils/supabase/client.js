'use client'
// supabase for client

// Impor `createBrowserClient` dari `@supabase/ssr` untuk client-side di Next.js App Router.
// Ini akan memastikan sesi dikelola melalui cookies.
import { createBrowserClient } from "@supabase/ssr";

export function createClientInstance() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
}