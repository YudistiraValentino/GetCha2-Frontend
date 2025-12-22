"use client"; 

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import AdminSidebar from "@/app/components/admin/Sidebar"; 
import AdminHeader from "@/app/components/admin/Header";   
import { Loader2 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [authorized, setAuthorized] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // 👈 State baru

  useEffect(() => {
    if (pathname === "/admin/login") {
        setAuthorized(true);
        return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
        router.push("/admin/login");
    } else {
        setAuthorized(true);
    }
  }, [router, pathname]);

  if (!authorized) {
      return (
        <div className="min-h-screen bg-navy-900 flex items-center justify-center">
            <Loader2 className="animate-spin text-gold-500" size={40} />
        </div>
      );
  }

  if (pathname === "/admin/login") {
      return <main>{children}</main>;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex">
      
      {/* 1. SIDEBAR (Kirim props isOpen) */}
      <AdminSidebar isOpen={isSidebarOpen} />

      {/* 2. WRAPPER KONTEN (Margin Kiri Dinamis) */}
      <div 
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        
        {/* 3. HEADER (Kirim fungsi toggle) */}
        <AdminHeader toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <main className="p-8 flex-1 overflow-y-auto">
            {children}
        </main>

        <footer className="p-6 text-center text-xs text-gray-400 border-t border-gray-200">
            &copy; 2025 GetCha Coffee Admin Panel. All rights reserved.
        </footer>
      </div>
    </div>
  );
}