"use client";
import React, { useEffect, useState } from 'react';
import NavbarDashboard from "@/app/components/layout/NavbarDashboard";
import { useRouter } from 'next/navigation';
import { 
    User, ChevronRight, LogOut, CreditCard, ReceiptText, 
    Star, Settings, Gift, Camera, ShoppingBag, Heart, AlertTriangle 
} from 'lucide-react';
import { useTransition } from "@/app/context/TransitionContext";

// ✅ URL BACKEND RAILWAY
const API_BASE_URL = "https://getcha2-backend-production.up.railway.app";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { setIsLoading } = useTransition();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
        router.push('/login'); 
        return;
    }

    const fetchData = async () => {
        try {
            // A. FETCH USER PROFILE
            const resUser = await fetch(`${API_BASE_URL}/api/user`, {
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json" 
                }
            });
            
            if (resUser.ok) {
                const userData = await resUser.json();
                setUser(userData); 
                localStorage.setItem("user", JSON.stringify(userData)); 
            }

            // B. FETCH ORDERS & CALCULATE TOTAL SPENT
            const resOrder = await fetch(`${API_BASE_URL}/api/my-orders`, {
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json" 
                }
            });
            const jsonOrder = await resOrder.json();
            
            if (jsonOrder.success) {
                // 1. Hitung Active Orders (Selain Completed & Cancelled)
                const active = jsonOrder.data.filter((o: any) => 
                    !['completed', 'cancelled'].includes(o.status.toLowerCase())
                ).length;
                setActiveOrdersCount(active);

                // 2. Hitung Total Spent (Hanya yang statusnya 'completed')
                const spent = jsonOrder.data
                    .filter((o: any) => o.status.toLowerCase() === 'completed')
                    .reduce((acc: number, curr: any) => acc + Number(curr.total_price || 0), 0);
                
                setTotalSpent(spent);
            }

        } catch (error) {
            console.error("Gagal ambil data dari Railway:", error);
        }
    };

    fetchData();
  }, [router]);

  const handleNavigate = (path: string) => {
    if (path === '#') return;
    setIsLoading(true);
    setTimeout(() => {
        router.push(path);
    }, 800);
  };

  const handleLogout = async () => {
    setShowLogoutModal(false);
    setIsLoading(true);

    try {
        const token = localStorage.getItem("token");
        await fetch(`${API_BASE_URL}/api/logout`, {
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
    { icon: ReceiptText, label: "My Activity / Orders", link: "/activity", color: "text-blue-600", bg: "bg-blue-50", badge: activeOrdersCount > 0 ? activeOrdersCount.toString() : null },
    { icon: Gift, label: "My Vouchers", link: "/deals", color: "text-pink-600", bg: "bg-pink-50", badge: "2" },
    { icon: Heart, label: "Favorites", link: "/favorites", color: "text-red-600", bg: "bg-red-50" },
    { icon: CreditCard, label: "Payment Methods", link: "/profile/payment-methods", color: "text-purple-600", bg: "bg-purple-50" },
    { icon: Settings, label: "Settings", link: "/profile/settings", color: "text-gray-600", bg: "bg-gray-100" },
  ];

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-32">
      <NavbarDashboard />

      <div className="container mx-auto px-4 md:px-12 pt-32 max-w-lg">
        <div className="flex justify-between items-end mb-6">
            <h1 className="text-3xl font-extrabold text-navy-900">My Profile</h1>
            <button className="text-sm font-bold text-gold-600 hover:text-gold-700">Edit</button>
        </div>

        {/* MEMBER CARD */}
        <div className="bg-navy-900 rounded-[2rem] p-6 text-white shadow-xl shadow-navy-900/20 mb-8 relative overflow-hidden group transition-all hover:scale-[1.02] duration-500">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gold-500 rounded-full blur-[80px] opacity-20 translate-x-10 -translate-y-10 group-hover:opacity-30 transition-opacity"></div>
            
            <div className="flex items-center gap-5 mb-8 relative z-10">
                <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-white/10 to-white/5 rounded-full flex items-center justify-center border-2 border-white/20 backdrop-blur-md">
                        <User size={36} className="text-gold-400" />
                    </div>
                </div>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">{user?.name || "Loading..."}</h2>
                    <p className="text-white/60 text-sm">{user?.email || "Memuat data..."}</p>
                    <div className="flex gap-2 mt-2">
                         <span className="bg-gold-500/20 text-gold-400 px-2 py-0.5 rounded text-[10px] font-bold border border-gold-500/20 uppercase tracking-wide">
                             {user?.username ? `@${user.username}` : 'Silver Member'}
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
                        <p className="text-3xl font-black text-white">
                            {user?.points ? user.points.toLocaleString() : 0}
                        </p>
                    </div>
                    <div className="text-right">
                         <span className="text-xs font-bold text-white bg-white/10 px-3 py-1 rounded-full border border-white/10">Silver</span>
                    </div>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="bg-gold-500 h-full w-[45%] rounded-full shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
                </div>
            </div>
        </div>

        {/* QUICK STATS */}
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
                     {totalSpent > 0 ? `Rp${totalSpent.toLocaleString('id-ID')}` : 'Rp0'}
                 </p>
                 <p className="text-xs text-gray-400 font-bold uppercase">Total Spent</p>
            </div>
        </div>

        {/* MENU LIST */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden mb-8">
            {menuItems.map((item, idx) => (
                <div key={idx} onClick={() => handleNavigate(item.link)} className="cursor-pointer block hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center justify-between p-5 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                                <item.icon size={22} />
                            </div>
                            <span className="font-bold text-navy-900 text-sm">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            {item.badge && (
                                <span className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">{item.badge}</span>
                            )}
                            <ChevronRight size={18} className="text-gray-300" />
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* LOGOUT BUTTON */}
        <button onClick={() => setShowLogoutModal(true)} className="w-full py-4 rounded-2xl border-2 border-red-50 text-red-500 font-bold flex items-center justify-center gap-2 hover:bg-red-50 transition-all active:scale-[0.98]">
            <LogOut size={20} /> Log Out
        </button>
      </div>

      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setShowLogoutModal(false)}></div>
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 relative z-10 animate-in zoom-in-95 border border-gray-100">
            <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
                    <AlertTriangle size={40} className="text-red-500" />
                </div>
            </div>
            <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-navy-900 mb-2">Log Out?</h3>
                <p className="text-gray-500 text-sm">Are you sure you want to log out?</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setShowLogoutModal(false)} className="py-3 bg-gray-100 rounded-xl font-bold">Cancel</button>
                <button onClick={handleLogout} className="py-3 bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-200">Yes, Logout</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
