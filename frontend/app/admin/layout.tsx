"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import AdminSidebar from "@/app/components/admin/Sidebar";
import AdminHeader from "@/app/components/admin/Header";
import { Loader2 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Default false supaya tidak sempat merender dashboard kosong
  const [authorized, setAuthorized] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    // 1. Kalau sedang di halaman Login, izinkan tampil
    if (pathname === "/admin/login") {
        setAuthorized(true);
        return;
    }

    // 2. Cek Token
    const token = localStorage.getItem("token");
    
    if (!token) {
        // Kalau tidak ada token, tendang ke login
        // Pakai 'replace' biar user gak bisa back ke halaman ini
        setAuthorized(false);
        router.replace("/admin/login");
    } else {
        // Kalau ada token, izinkan masuk
        setAuthorized(true);
    }
  }, [router, pathname]);

  // 3. TAMPILAN SAAT LOADING / BELUM AUTHORIZED
  // Ini "Satpam" nya. Selama authorized masih false, tampilkan loading.
  if (!authorized) {
      return (
        <div className="min-h-screen bg-navy-900 flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="animate-spin text-gold-500 mx-auto mb-2" size={40} />
                <p className="text-gold-500 text-sm font-bold animate-pulse">Checking Access...</p>
            </div>
        </div>
      );
  }

  // 4. RENDER HALAMAN LOGIN (Tanpa Sidebar/Header)
  if (pathname === "/admin/login") {
      return <main>{children}</main>;
  }

  // 5. RENDER DASHBOARD ADMIN (Lolos Satpam)
  return (
    <div className="min-h-screen bg-gray-50 font-sans flex">
      
      {/* Sidebar */}
      <AdminSidebar isOpen={isSidebarOpen} />

      {/* Wrapper Konten */}
      <div 
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        
        {/* Header */}
        <AdminHeader toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <main className="p-8 flex-1 overflow-y-auto">
            {children}
        </main>

        <footer className="p-6 text-center text-xs text-gray-400 border-t border-gray-200">
            &copy; 2026 GetCha Coffee Admin Panel. All rights reserved.
        </footer>
      </div>
    </div>
  );
}