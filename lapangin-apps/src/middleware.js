import { updateSession } from './utils/supabase/middleware'

export async function middleware(request) {
    // return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * Cocokkan semua path request kecuali untuk:
         * - _next/static (file statis)
         * - _next/image (file optimasi gambar)
         * - favicon.ico (file favicon)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}