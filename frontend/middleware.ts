import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Ambil path yang sedang diakses
  const path = request.nextUrl.pathname;

  // Cek apakah user mau masuk ke halaman admin (selain halaman login itu sendiri)
  if (path.startsWith('/admin') && path !== '/admin/login') {
    
    // Cek apakah ada token? 
    // Catatan: Karena localStorage tidak bisa diakses di middleware (server side),
    // cara paling aman di Next.js murni adalah cek Cookie. 
    // Tapi untuk setup sederhana Headless, kita bisa handle redirect di Client Component (Layout).
    // NAMUN, middleware ini berguna jika nanti kamu simpan token di Cookie.
    
    // Untuk sekarang, kita biarkan middleware ini pass dulu, 
    // TAPI kita tambahkan proteksi di CLIENT SIDE (Step 4).
  }

  return NextResponse.next();
}

// Tentukan path mana yang kena middleware
export const config = {
  matcher: '/admin/:path*',
}