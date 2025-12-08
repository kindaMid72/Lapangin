// src/utils/supabase/middleware.js
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function updateSession(request) {
  // 1. Buat response awal
  let supabaseResponse = NextResponse.next({
    request,
  })

  try {
    // 2. Cek apakah Env Var ada (untuk debugging)
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
       console.error("Supabase Env Vars missing!");
       return supabaseResponse; // Biarkan lolos jika config error, agar tidak 404/500
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // 3. Ambil user dengan aman
    const {
      data: { user },
      error // Ambil error juga
    } = await supabase.auth.getUser()
    
    if (error) {
        // Jika ada error auth (misal token expired), anggap user null
        // console.error("Auth error:", error.message); 
    }

    // --- LOGIKA PROTEKSI RUTE ---
    const publicRoutes = [
      '/', 
      '/login',
      '/sign_in',
      '/register',
      '/auth',
      '/error',
      '/home',
      '/About',
      '/Features',
    ];

    // Cek apakah URL diawali dengan publicRoutes
    const isPublicRoute = publicRoutes.some(path => 
        request.nextUrl.pathname === path || 
        (path !== '/' && request.nextUrl.pathname.startsWith(path))
    );

    // Jika user TIDAK login dan BUKAN rute publik -> Redirect ke Login
    if (!user && !isPublicRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    
    // Jika user SUDAH login dan mencoba akses login/register -> Redirect ke Dashboard (Opsional)
    if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/sign_in')) {
        const url = request.nextUrl.clone()
        url.pathname = `/${user.id}` // Redirect ke halaman user
        return NextResponse.redirect(url)
    }

  } catch (err) {
    console.error("Middleware Error:", err);
    // Jika terjadi error fatal di middleware, biarkan request lewat agar tidak 500/404
    return NextResponse.next({ request });
  }

  return supabaseResponse
}