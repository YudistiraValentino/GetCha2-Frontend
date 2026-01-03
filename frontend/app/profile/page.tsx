"use client";
import React, { useEffect, useState } from 'react';
import NavbarDashboard from "@/app/components/layout/NavbarDashboard";
import { useRouter } from 'next/navigation';
import { 
    User, ChevronRight, LogOut, CreditCard, ReceiptText, 
    Star, Settings, Gift, Camera, ShoppingBag, Heart 
} from 'lucide-react';
import { useTransition } from "@/app/context/TransitionContext";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0); // Tambahan: Total pengeluaran

  const { setIsLoading } = useTransition();

  // 1. LOAD DATA REAL-TIME
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
        router.push('/login'); 
        return;
    }

    const fetchData = async () => {
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
                // Hitung Active Orders
                const active = jsonOrder.data.filter((o: any) => !['completed', 'cancelled'].includes(o.status)).length;
                setActiveOrdersCount(active);

                // Hitung Total Spent (Iseng-iseng buat stats)
                const spent = jsonOrder.data
                    .filter((o: any) => o.status === 'completed')
                    .reduce((acc: number, curr: any) => acc + parseInt(curr.total_price), 0);
                setTotalSpent(spent);
            }

        } catch (error) {
            console.error("Gagal ambil data:", error);
        }
    };

    fetchData();
  }, [router]);

  // 2. NAVIGASI
  const handleNavigate = (path: string) => {
    if (path === '#') return;
    setIsLoading(true);
    setTimeout(() => {
        router.push(path);
    }, 800);
  };

  // 3. LOGOUT
  const handleLogout = async () => {
    if (!confirm("Are you sure you want to log out?")) return;
    
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
    localStorage.removeItem("checkout_session");
    
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
        link: "/deals", 
        color: "text-pink-600", 
        bg: "bg-pink-50", 
        badge: "2" 
    },
    { 
        icon: Heart, 
        label: "Favorites", 
        link: "/favorites", 
        color: "text-red-600", 
        bg: "bg-red-50" 
    },
    { 
        icon: CreditCard, 
        label: "Payment Methods", 
        link: "/profile/payment-methods", 
        color: "text-purple-600", 
        bg: "bg-purple-50" 
    },
    { 
        icon: Settings, 
        label: "Settings", 
        link: "/profile/settings", 
        color: "text-gray-600", 
        bg: "bg-gray-100" 
    },
  ];

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-32">
      <NavbarDashboard />

      <div className="container mx-auto px-4 md:px-12 pt-32 max-w-lg">
        
        <div className="flex justify-between items-end mb-6">
            <h1 className="text-3xl font-extrabold text-navy-900">My Profile</h1>
            <button className="text-sm font-bold text-gold-600 hover:text-gold-700">Edit</button>
        </div>

        {/* 1. MEMBER CARD (UPGRADED) */}
        <div className="bg-navy-900 rounded-[2rem] p-6 text-white shadow-xl shadow-navy-900/20 mb-8 relative overflow-hidden group transition-all hover:scale-[1.02] duration-500">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gold-500 rounded-full blur-[80px] opacity-20 translate-x-10 -translate-y-10 group-hover:opacity-30 transition-opacity duration-700"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500 rounded-full blur-[60px] opacity-10 -translate-x-5 translate-y-5"></div>
            
            <div className="flex items-center gap-5 mb-8 relative z-10">
                <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-white/10 to-white/5 rounded-full flex items-center justify-center border-2 border-white/20 backdrop-blur-md shadow-inner">
                        <User size={36} className="text-gold-400" />
                    </div>
                    <button className="absolute bottom-0 right-0 bg-gold-500 p-1.5 rounded-full border-2 border-navy-900 text-navy-900 hover:scale-110 transition-transform">
                        <Camera size={12} />
                    </button>
                </div>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">{user?.name}</h2>
                    <p className="text-white/60 text-sm">{user?.email}</p>
                    <div className="flex gap-2 mt-2">
                         <span className="bg-gold-500/20 text-gold-400 px-2 py-0.5 rounded text-[10px] font-bold border border-gold-500/20 uppercase tracking-wide">
                             {user?.username ? `@${user.username}` : 'Member'}
                         </span>
                    </div>
                </div>
            </div>

            {/* Loyalty Progress */}
            <div className="bg-white/5 rounded-2xl p-5 backdrop-blur-md border border-white/10 relative z-10">
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <p className="text-[10px] text-gold-400 uppercase font-bold tracking-widest mb-1 flex items-center gap-1">
                            <Star size={10} fill="currentColor"/> Loyalty Points
                        </p>
                        <p className="text-3xl font-black text-white leading-none">
                            {user?.points ? user.points.toLocaleString() : 0}
                        </p>
                    </div>
                    <div className="text-right">
                         <span className="text-xs font-bold text-white bg-white/10 px-3 py-1 rounded-full border border-white/10">
                            Silver Member
                         </span>
                    </div>
                </div>
                
                {/* Progress Bar Dummy */}
                <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="bg-gold-500 h-full w-[45%] rounded-full shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
                </div>
                <p className="text-[10px] text-white/40 mt-2 text-right">450 points to Gold</p>
            </div>
        </div>

        {/* 2. QUICK STATS (NEW) */}
        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                 <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                     <ShoppingBag size={20} />
                 </div>
                 <p className="text-2xl font-black text-navy-900">{activeOrdersCount}</p>
                 <p className="text-xs text-gray-400 font-bold uppercase">Active Orders</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                 <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-2">
                     <ReceiptText size={20} />
                 </div>
                 <p className="text-lg font-black text-navy-900 line-clamp-1">
                     {totalSpent > 0 ? `${(totalSpent/1000).toFixed(0)}k` : '0'}
                 </p>
                 <p className="text-xs text-gray-400 font-bold uppercase">Total Spent</p>
            </div>
        </div>

        {/* 3. MENU LIST */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden mb-8">
            {menuItems.map((item, idx) => (
                <div 
                    key={idx} 
                    onClick={() => handleNavigate(item.link)} 
                    className="cursor-pointer block hover:bg-gray-50 transition-colors group"
                >
                    <div className="flex items-center justify-between p-5 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.bg} ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                                <item.icon size={22} />
                            </div>
                            <span className="font-bold text-navy-900 text-sm md:text-base group-hover:translate-x-1 transition-transform">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            {item.badge && (
                                <span className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-red-200 shadow-md">
                                    {item.badge}
                                </span>
                            )}
                            <ChevronRight size={18} className="text-gray-300 group-hover:text-navy-900 transition-colors" />
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* 4. LOGOUT */}
        <button 
            onClick={handleLogout}
            className="w-full py-4 rounded-2xl border-2 border-red-50 text-red-500 font-bold flex items-center justify-center gap-2 hover:bg-red-50 hover:border-red-100 transition-all active:scale-[0.98]"
        >
            <LogOut size={20} /> Log Out
        </button>

        <p className="text-center text-gray-300 text-[10px] font-bold uppercase tracking-widest mt-8 mb-4">
            GetCha App v1.2.0 • Build 2024
        </p>
      </div>
    </main>
  );
}