"use client";

import React, { useState, useEffect, useMemo } from 'react';
import NavbarDashboard from "@/app/components/layout/NavbarDashboard";
import HeroCarousel from "@/app/components/dashboard/HeroCarousel";
import ProductCard from "@/app/components/common/ProductCard";
import Footer from "@/app/components/layout/Footer"; 
import { heroSlidesData } from "@/app/data/heroData"; 
import createEcho from '@/app/lib/echo'; 
import OrderNotification from "@/app/components/common/OrderNotification";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Clock, ArrowRight, User as UserIcon, Loader2, Receipt, ShoppingBag } from "lucide-react"; 
import Link from "next/link";
import { useRouter } from "next/navigation"; 

// ✅ URL Backend Railway
const BACKEND_URL = "https://getcha2-backend-production.up.railway.app";

interface ProductAPI {
  id: number;
  name: string;
  category_name: string; 
  description: string;
  price: string; 
  image: string;
  created_at: string; 
  is_promo: number;
}

interface OrderAPI {
   id: number;
   order_number: string;
   customer_name: string;
   status: string;
   total_price: string;
   created_at: string;
   items: any[];
}

export default function DashboardPage() {
  const router = useRouter();

  // State Data
  const [products, setProducts] = useState<ProductAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [user, setUser] = useState<any>(null);
  const [myOrders, setMyOrders] = useState<OrderAPI[]>([]);
  
  // State Notifikasi
  const [notification, setNotification] = useState<any>(null);

  // 1. CEK LOGIN & FETCH
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
        setUser(JSON.parse(userData));
        fetchMyOrders(token);
    }
    fetchMenu();
  }, []);

  // 2. REALTIME LISTENER
  useEffect(() => {
    if (user) {
        const echo = createEcho();

        if (echo) {
            echo.channel('public-orders')
                .listen('.order.updated', (e: any) => {
                    if (e.order.customer_name === user.name) {
                        // Update List Order
                        setMyOrders((prevOrders) => {
                            const exists = prevOrders.find(o => o.id === e.order.id);
                            if (exists) {
                                return prevOrders.map(o => o.id === e.order.id ? { ...o, ...e.order, items: o.items } : o);
                            } else {
                                return [e.order, ...prevOrders];
                            }
                        });

                        // Tampilkan Notifikasi
                        setNotification(e.order);
                    }
                });
        }

        return () => {
            if (echo) {
                echo.leave('public-orders');
            }
        };
    }
  }, [user]);

  const fetchMenu = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/menu`);
      const json = await res.json();
      if (json.success) setProducts(json.data);
    } catch (error) { 
        console.error("Gagal fetch menu:", error); 
    } finally { 
        setLoading(false); 
    }
  };

  const fetchMyOrders = async (token: string) => {
      try {
          const res = await fetch(`${BACKEND_URL}/api/my-orders`, {
              headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
          });
          if (!res.ok) return;
          const json = await res.json();
          if (json.success) setMyOrders(json.data);
      } catch (error) { console.error(error); }
  };

  // 🔥 HELPER: Fix URL Gambar (Sama dengan Navbar & Admin)
  const getImageUrl = (path: string) => {
    if (!path) return "/Image/placeholder.png";
    if (path.startsWith("http")) return path;

    const BACKEND_URL = "https://getcha2-backend-production.up.railway.app";
    
    // 1. Bersihkan path dari string 'public/' jika terbawa dari database
    let cleanPath = path.replace('public/', '');

    // 2. Pastikan diawali dengan satu garis miring
    if (!cleanPath.startsWith('/')) {
      cleanPath = '/' + cleanPath;
    }

    // 3. JANGAN tambahkan /storage jika path sudah diawali /images atau /maps
    if (
      !cleanPath.startsWith('/storage') && 
      !cleanPath.startsWith('/images') && 
      !cleanPath.startsWith('/maps')
    ) {
      cleanPath = '/storage' + cleanPath;
    }

    return `${BACKEND_URL}${cleanPath}`;
  };

  // Logic Sorting & Filtering
  const newArrivals = useMemo(() => [...products].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 4), [products]);
  const categories = useMemo(() => ["All", ...Array.from(new Set(products.map(p => p.category_name)))], [products]);
  const filteredProducts = activeCategory === "All" ? products : products.filter(p => p.category_name === activeCategory);
  
  const mapToCard = (p: ProductAPI) => ({
    id: p.id, 
    name: p.name, 
    category: p.category_name, 
    price: parseFloat(p.price), 
    image: getImageUrl(p.image), 
    description: p.description, 
    createdAt: p.created_at, 
    soldCount: 0, 
  });
  
  const isNewBadge = (dateString: string) => {
    const diffDays = Math.ceil(Math.abs(new Date().getTime() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24)); 
    return diffDays <= 7; 
  };

  const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200 ring-yellow-500/20';
        case 'confirmed': return 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20';
        case 'processing': return 'bg-orange-50 text-orange-700 border-orange-200 ring-orange-500/20';
        case 'ready': return 'bg-green-50 text-green-700 border-green-200 ring-green-500/20';
        case 'completed': return 'bg-navy-900 text-gold-500 border-navy-900 ring-navy-900/20';
        case 'cancelled': return 'bg-red-50 text-red-700 border-red-200 ring-red-500/20';
        default: return 'bg-gray-100 text-gray-600 ring-gray-500/20';
    }
  };

  if (loading) return <div className="min-h-screen bg-navy-900 flex items-center justify-center"><Loader2 className="animate-spin text-gold-500" size={40}/></div>;

  return (
    <main className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col justify-between selection:bg-gold-200">
      
      <AnimatePresence>
        {notification && (
            <OrderNotification 
                key={notification.id + notification.status} 
                order={notification} 
                onClose={() => setNotification(null)} 
            />
        )}
      </AnimatePresence>

      <div>
          <NavbarDashboard />

          <div className="container mx-auto px-4 md:px-12 pt-28 space-y-20 pb-20">
            
            {/* WELCOME SECTION - Improved UI */}
            {user && (
                <section className="animate-in slide-in-from-top-4 fade-in duration-700">
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden group">
                        {/* Decorative Background Blob */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-50 rounded-full blur-3xl opacity-50 -mr-20 -mt-20 group-hover:opacity-70 transition-opacity duration-700"></div>

                        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                            <div className="flex items-center gap-6">
                                <div className="relative">
                                    <div className="w-16 h-16 bg-gradient-to-br from-navy-900 to-navy-800 rounded-full flex items-center justify-center text-gold-500 shadow-xl shadow-navy-900/10">
                                        <UserIcon size={28} />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-4 border-white"></div>
                                </div>
                                <div>
                                    <h2 className="text-3xl font-extrabold text-navy-900 tracking-tight">
                                        Hi, <span className="text-transparent bg-clip-text bg-gradient-to-r from-navy-900 to-gold-600">{user.name}</span>! 👋
                                    </h2>
                                    <p className="text-gray-500 font-medium mt-1">Ready for your coffee break?</p>
                                </div>
                            </div>
                            
                            <Link href="/menu" className="hidden md:flex items-center gap-2 px-6 py-3 bg-navy-50 text-navy-900 font-bold rounded-full hover:bg-gold-500 hover:text-white transition-all duration-300 group-hover:shadow-lg">
                                <ShoppingBag size={18} />
                                Start New Order
                            </Link>
                        </div>

                        {/* ORDER LIST SECTION */}
                        <div className="mt-8 pt-8 border-t border-gray-100 relative z-10">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Receipt size={14} /> Recent Orders
                                </h3>
                                {myOrders.length > 2 && <span className="text-xs text-gold-600 font-bold cursor-pointer">View All</span>}
                            </div>

                            {myOrders.length > 0 ? (
                                <div className="grid gap-4 md:grid-cols-2">
                                    {myOrders.slice(0, 2).map(order => (
                                        <div key={order.id} className="group border border-gray-100 rounded-2xl p-5 bg-white hover:border-gold-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 cursor-default">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-navy-900 group-hover:bg-gold-100 group-hover:text-gold-700 transition-colors">
                                                        <Clock size={18} />
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-navy-900 block">Order #{order.order_number}</span>
                                                        <span className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full border ring-1 ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center pl-[52px]">
                                                <p className="text-xs text-gray-500 font-medium">{order.items?.length || 0} Items</p>
                                                <p className="font-bold text-navy-900 text-sm">Rp {parseInt(order.total_price).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-gray-400 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200 hover:bg-gray-50 transition-colors">
                                    <ShoppingBag size={32} className="mb-2 opacity-20" />
                                    <p className="text-sm font-medium">No active orders right now.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            <section><HeroCarousel slides={heroSlidesData} /></section>

            {/* NEW ARRIVALS - Improved UI */}
            <section>
              <div className="flex justify-between items-end mb-8 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <div className="bg-navy-900 p-3 rounded-xl text-gold-500 shadow-lg shadow-navy-900/20">
                        <Sparkles size={24} className="animate-pulse"/>
                    </div>
                    <div>
                        <span className="text-gold-600 font-bold tracking-[0.2em] text-[10px] uppercase block mb-1">Fresh from Kitchen</span>
                        <h2 className="text-2xl md:text-4xl font-extrabold text-navy-900 leading-none">New <span className="text-gold-500 underline decoration-4 underline-offset-4 decoration-gold-200">Arrivals</span></h2>
                    </div>
                </div>
                <Link href="/menu" className="hidden md:flex text-navy-900 font-bold text-sm hover:text-gold-600 transition-colors items-center gap-2 group bg-white px-4 py-2 rounded-full border border-gray-200 hover:border-gold-500 shadow-sm">
                    View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {newArrivals.map((product) => (
                  <div key={product.id} className="relative h-full group hover:-translate-y-2 transition-transform duration-300">
                      {isNewBadge(product.created_at) && <div className="absolute -top-3 -right-3 z-20"><span className="relative flex h-8 w-16"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span><span className="relative inline-flex items-center justify-center rounded-full h-8 w-16 bg-navy-900 border-2 border-white shadow-lg"><span className="text-[10px] font-black text-gold-500 italic tracking-wider">NEW!</span></span></span></div>}
                      <ProductCard product={mapToCard(product)} />
                  </div>
                ))}
              </div>
            </section>

            {/* MENU SECTION - Sticky with better blur */}
            <section id="menu-section">
                <div className="sticky top-20 z-30 bg-white/80 backdrop-blur-xl py-4 mb-8 transition-all border-b border-gray-100 -mx-4 px-4 md:-mx-12 md:px-12 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)]">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 container mx-auto">
                        <h2 className="text-2xl font-bold text-navy-900 flex items-center gap-2">
                            Full Menu <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{products.length} Items</span>
                        </h2>
                        <div className="flex overflow-x-auto pb-1 gap-2 w-full md:w-auto no-scrollbar">
                            {categories.map((cat) => (
                                <button key={cat} onClick={() => setActiveCategory(cat)} className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all border transform active:scale-95 ${activeCategory === cat ? "bg-navy-900 text-white border-navy-900 shadow-lg shadow-navy-900/20 ring-2 ring-navy-900 ring-offset-2" : "bg-gray-50 text-gray-500 border-transparent hover:bg-white hover:border-gold-200 hover:text-navy-900 hover:shadow-sm"}`}>{cat}</button>
                            ))}
                        </div>
                    </div>
                </div>
                <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 min-h-[400px]">
                    <AnimatePresence mode='popLayout'>
                        {filteredProducts.map((product) => (
                            <motion.div layout key={product.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}>
                                <div className="relative h-full">
                                   <ProductCard product={mapToCard(product)} />
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </section>
          </div>
      </div>
      <Footer />
    </main>
  );
}