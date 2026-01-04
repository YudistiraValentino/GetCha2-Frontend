"use client";

import React from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Coffee, 
  ShoppingBag, 
  Ticket, 
  Users, 
  Map, 
  LogOut 
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { name: "Products", href: "/admin/products", icon: Coffee },
  { name: "Deals / Promos", href: "/admin/promos", icon: Ticket },
  { name: "Customers", href: "/admin/users", icon: Users },
  { name: "Map Manager", href: "/admin/maps", icon: Map },
];

// 👇 Menerima props isOpen dari Layout
export default function AdminSidebar({ isOpen }: { isOpen: boolean }) {
  const pathname = usePathname();

  const handleLogout = async () => {
      if(!confirm("Logout Admin?")) return;
      
      // Hapus token & redirect
      localStorage.removeItem("token");
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      window.location.href = "/admin/login";
  };

  return (
    <aside 
      className={`bg-navy-900 text-white h-screen fixed left-0 top-0 flex flex-col shadow-2xl z-50 transition-all duration-300 ease-in-out border-r border-white/5 ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      {/* 1. Logo Area */}
      <div className="h-20 flex items-center justify-center border-b border-white/10 overflow-hidden whitespace-nowrap bg-navy-950/50">
        {isOpen ? (
            <h1 className="text-2xl font-serif font-bold text-gold-500 flex items-center gap-2 animate-in fade-in duration-300">
                <Coffee size={28} /> GetCha<span className="text-white">Admin</span>
            </h1>
        ) : (
            <Coffee size={32} className="text-gold-500 animate-in zoom-in duration-300" />
        )}
      </div>

      {/* 2. Menu Items */}
      <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {isOpen && (
            <p className="text-xs font-bold text-gray-500 uppercase px-4 mb-2 tracking-wider animate-in slide-in-from-left-2 duration-300">
                Main Menu
            </p>
        )}
        
        {menuItems.map((item) => {
          // 🔥 LOGIKA PINTAR:
          // Kalau link-nya "/admin", dia cuma aktif kalau pathname PERSIS "/admin"
          // Kalau link lain, dia aktif kalau pathname DIAWALI link tersebut
          const isActive = item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);

          return (
            <Link 
              key={item.href} 
              href={item.href}
              title={!isOpen ? item.name : ""} // Tooltip native saat collapsed
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                isActive 
                  ? "bg-gold-500 text-navy-900 font-bold shadow-lg shadow-gold-500/20" 
                  : "text-gray-400 hover:bg-white/10 hover:text-white"
              } ${!isOpen ? "justify-center" : ""}`}
            >
              <item.icon size={22} className={`min-w-[22px] ${isActive ? "text-navy-900" : "text-gray-400 group-hover:text-gold-500 transition-colors"}`} />
              
              {/* Teks Menu (Hilang saat collapsed) */}
              <span className={`whitespace-nowrap transition-all duration-300 origin-left ${
                  isOpen ? "opacity-100 translate-x-0 w-auto" : "opacity-0 -translate-x-10 w-0 hidden"
              }`}>
                  {item.name}
              </span>

              {/* Tooltip Hover saat Collapsed */}
              {!isOpen && (
                  <div className="absolute left-14 bg-navy-800 text-white text-xs px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-white/10 shadow-xl font-bold tracking-wide">
                      {item.name}
                  </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* 3. Logout Button */}
      <div className="p-4 border-t border-white/10 bg-navy-950/30">
        <button 
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-3 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all font-medium group ${
                !isOpen ? "justify-center" : ""
            }`}
            title={!isOpen ? "Sign Out" : ""}
        >
          <LogOut size={22} className="min-w-[22px]" />
          <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? "opacity-100 w-auto" : "opacity-0 w-0 hidden"}`}>
              Sign Out
          </span>
        </button>
      </div>
    </aside>
  );
}