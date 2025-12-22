"use client";
import React, { useEffect, useState } from 'react';
import NavbarDashboard from "@/app/components/layout/NavbarDashboard";
import { useRouter } from 'next/navigation';
import { User, ChevronRight, LogOut, CreditCard, ReceiptText, Star, Settings, Gift } from 'lucide-react';

// 👇 IMPORT CONTEXT TRANSISI KAMU
import { useTransition } from "@/app/context/TransitionContext";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);

  // 👇 GANTI STATE LOKAL DENGAN GLOBAL CONTEXT
  // const [loading, setLoading] = useState(true); // HAPUS INI
  const { setIsLoading } = useTransition(); // PAKAI INI

  // 1. LOAD DATA REAL-TIME
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
        router.push('/login'); 
        return;
    }

    const fetchData = async () => {
        // Kita tidak perlu set loading true di sini karena TransitionLoader 
        // sudah otomatis jalan saat halaman di-refresh (mount)
        
        try {
            // A. FETCH USER PROFILE
            const resUser = await fetch('http://127.0.0.1:8000/api/user', {
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json" 
                }
            });
            const userData = await resUser.json();
            
            if (resUser.ok) {
                setUser(userData); 
                localStorage.setItem("user", JSON.stringify(userData)); 
            }

            // B. FETCH ORDERS
            const resOrder = await fetch('http://127.0.0.1:8000/api/my-orders', {
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json" 
                }
            });
            const jsonOrder = await resOrder.json();
            
            if (jsonOrder.success) {
                const count = jsonOrder.data.filter((o: any) => !['completed', 'cancelled'].includes(o.status)).length;
                setActiveOrdersCount(count);
            }

        } catch (error) {
            console.error("Gagal ambil data:", error);
        }
        // Kita tidak perlu setIsLoading(false) manual di sini, 
        // karena TransitionLoader punya onComplete callback sendiri.
    };

    fetchData();
  }, [router]);

  // 2. FUNGSI NAVIGASI DENGAN BEAN LOADER ✨
  const handleNavigate = (path: string) => {
    if (path === '#') return;

    // A. Panggil Loader Bean Global
    setIsLoading(true);

    // B. Beri waktu animasi muncul sedikit, baru pindah halaman
    // (Misal 1 detik agar user sempat lihat si Bean lompat)
    setTimeout(() => {
        router.push(path);
    }, 1000);
  };

  // 3. LOGOUT FUNCTION
  const handleLogout = async () => {
    if (!confirm("Are you sure you want to log out?")) return;
    
    // Panggil Loader Bean
    setIsLoading(true);

    try {
        const token = localStorage.getItem("token");
        await fetch('http://127.0.0.1:8000/api/logout', {
            method: 'POST',
            headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
        });
    } catch (e) { console.log("Logout error", e); }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cart"); 
    
    // Redirect setelah sedikit delay
    setTimeout(() => {
        router.push('/login');
    }, 1000);
  };

  const menuItems = [
    { 
        icon: ReceiptText, 
        label: "My Activity / Orders", 
        link: "/activity", 
        color: "text-blue-600", 
        bg: "bg-blue-50",
        badge: activeOrdersCount > 0 ? activeOrdersCount.toString() : null 
    },
    { 
        icon: Gift, 
        label: "My Vouchers", 
        link: "/deals", // Arahkan ke halaman deals
        color: "text-pink-600", 
        bg: "bg-pink-50", 
        badge: "2" 
    },
    { icon: CreditCard, label: "Payment Methods", link: "/profile/payment-methods", color: "text-purple-600", bg: "bg-purple-50" },
    { icon: Settings, label: "Settings", link: "/profile/settings", color: "text-gray-600", bg: "bg-gray-100" },
  ];

  // HAPUS BAGIAN RETURN LOADING SCREEN LAMA
  // if (loading) return ... (Hapus ini, biarkan TransitionLoader yang handle)

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <NavbarDashboard />

      <div className="container mx-auto px-4 md:px-12 pt-32 max-w-lg">
        
        <h1 className="text-3xl font-serif font-bold text-navy-900 mb-6">Profile</h1>

        {/* 1. MEMBER CARD */}
        <div className="bg-gradient-to-br from-navy-900 to-navy-800 rounded-3xl p-6 text-white shadow-xl mb-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500 rounded-full blur-[60px] opacity-20 translate-x-10 -translate-y-10 group-hover:opacity-30 transition-opacity"></div>
            
            <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center border-2 border-white/20">
                    <User size={32} className="text-gold-500" />
                </div>
                <div>
                    <h2 className="text-xl font-bold">{user?.name}</h2>
                    <p className="text-white/60 text-sm">{user?.email}</p>
                    {user?.username && <p className="text-gold-500 text-xs mt-1">@{user.username}</p>}
                </div>
            </div>

            {/* Stats Bar */}
            <div className="bg-white/10 rounded-xl p-4 flex justify-between items-center backdrop-blur-sm border border-white/5">
                <div>
                    <p className="text-[10px] text-gold-500 uppercase font-bold tracking-wider mb-1">Loyalty Points</p>
                    <p className="text-2xl font-mono font-bold text-white animate-in fade-in slide-in-from-bottom-2">
                        {user?.points ? user.points.toLocaleString() : 0}
                    </p>
                </div>
                <div className="text-right">
                    <div className="flex items-center gap-1 justify-end text-gold-400 mb-1">
                        <Star size={14} fill="#EEBC6B" />
                        <span className="text-xs font-bold uppercase">
                            {(user?.points || 0) > 1000 ? "Gold Member" : "New Member"}
                        </span>
                    </div>
                    <p className="text-[10px] text-white/50">Joined {new Date(user?.created_at).getFullYear() || '2025'}</p>
                </div>
            </div>
        </div>

        {/* 2. MENU LIST */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
            {menuItems.map((item, idx) => (
                <div 
                    key={idx} 
                    onClick={() => handleNavigate(item.link)} 
                    className="cursor-pointer block hover:bg-gray-50 transition-colors"
                >
                    <div className="flex items-center justify-between p-5 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.bg} ${item.color}`}>
                                <item.icon size={20} />
                            </div>
                            <span className="font-bold text-navy-900 text-sm">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            {item.badge && (
                                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    {item.badge}
                                </span>
                            )}
                            <ChevronRight size={18} className="text-gray-300" />
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* 3. LOGOUT */}
        <button 
            onClick={handleLogout}
            className="w-full py-4 rounded-xl border-2 border-red-50 text-red-500 font-bold flex items-center justify-center gap-2 hover:bg-red-50 transition-colors active:scale-95"
        >
            <LogOut size={20} /> Log Out
        </button>

        <p className="text-center text-gray-400 text-xs mt-8">GetCha App v1.0</p>
      </div>
    </main>
  );
}