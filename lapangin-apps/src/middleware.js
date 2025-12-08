import { updateSession } from './utils/supabase/middleware'

export async function middleware(request) {
    return await updateSession(request)
}

export const config = {
    // Jalankan middleware di semua path
    matcher: '/(.*)',
}