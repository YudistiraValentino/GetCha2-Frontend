"use client";
import { Bell, User, Menu } from "lucide-react";

// 👇 Menerima props toggleSidebar
interface HeaderProps {
    toggleSidebar: () => void;
}

export default function AdminHeader({ toggleSidebar }: HeaderProps) {
  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-40 transition-all duration-300">
      
      {/* Kiri: Toggle Button & Welcome Text */}
      <div className="flex items-center gap-4">
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-navy-900 transition active:scale-95"
          >
              <Menu size={24} />
          </button>
          <h2 className="text-gray-400 text-sm font-medium hidden sm:block">Welcome back, Admin!</h2>
      </div>
      
      {/* Kanan: Notif & Profile */}
      <div className="flex items-center gap-6">
        <button className="relative text-gray-400 hover:text-navy-900 transition p-2 rounded-full hover:bg-gray-50">
            <Bell size={20} />
            <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
            <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-navy-900">Administrator</p>
                <p className="text-xs text-gray-400">Super User</p>
            </div>
            <div className="w-10 h-10 bg-navy-900 rounded-full flex items-center justify-center text-gold-500 border-2 border-gold-500 shadow-sm">
                <User size={20} />
            </div>
        </div>
      </div>
    </header>
  );
}