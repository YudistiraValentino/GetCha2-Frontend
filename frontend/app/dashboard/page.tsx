"use client";

import React, { useState, useEffect, useMemo } from 'react';
import NavbarDashboard from "@/app/components/layout/NavbarDashboard";
import HeroCarousel from "@/app/components/dashboard/HeroCarousel";
import ProductCard from "@/app/components/common/ProductCard";
import Footer from "@/app/components/layout/Footer"; 
import { heroSlidesData } from "@/app/data/heroData"; 
import { promoBanner } from "@/app/data/bannerData"; 
import createEcho from '@/app/lib/echo'; 
import OrderNotification from "@/app/components/common/OrderNotification";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Flame, Clock, ArrowRight, User as UserIcon, Loader2 } from "lucide-react"; 
import Link from "next/link";
import { useRouter } from "next/navigation"; 

// 👇 KONFIGURASI URL BACKEND
// Ganti baris 7 jadi begini:
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
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
        console.log("🔌 Connecting to Reverb...");
        const echo = createEcho();

        echo.channel('public-orders')
            .listen('.order.updated', (e: any) => {
                console.log("🔥 EVENT MASUK:", e);
                
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

        return () => {
            echo.leave('public-orders');
        };
    }
  }, [user]);

  const fetchMenu = async () => {
    try {
      const res = await fetch(`https://getcha2-backend-production.up.railway.app/api/menu`);
      const json = await res.json();
      if (json.success) setProducts(json.data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const fetchMyOrders = async (token: string) => {
      try {
          const res = await fetch(`https://getcha2-backend-production.up.railway.app/api/my-orders`, {
              headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
          });
          if (!res.ok) return;
          const json = await res.json();
          if (json.success) setMyOrders(json.data);
      } catch (error) { console.error(error); }
  };

  // 👇 FUNGSI PENTING: MEMPERBAIKI URL GAMBAR (UPDATED)
  const getImageUrl = (path: string) => {
    if (!path) return "/Image/placeholder.png"; 
    
    // 1. Jika path sudah URL lengkap, return langsung
    if (path.startsWith("http")) return path;

    // 2. Bersihkan path dari prefix 'public/' yang kadang tersimpan di DB
    let cleanPath = path.replace('public/', '');
    if (!cleanPath.startsWith('/')) {
        cleanPath = '/' + cleanPath;
    }

    // 3. LOGIC DETEKSI FOLDER
    // Jika path diawali '/images' atau '/maps', kemungkinan besar filenya di folder public langsung (bukan storage)
    // Jadi URL-nya: http://127.0.0.1:8000/images/foto.jpg
    if (cleanPath.startsWith('/images') || cleanPath.startsWith('/maps')) {
        return `${BACKEND_URL}${cleanPath}`;
    }

    // Default: Asumsikan file ada di dalam STORAGE link
    // URL-nya: http://127.0.0.1:8000/storage/products/foto.jpg
    if (!cleanPath.startsWith('/storage')) {
        cleanPath = '/storage' + cleanPath;
    }

    return `${BACKEND_URL}${cleanPath}`;
  };

  // Logic Sorting & Filtering
  const newArrivals = useMemo(() => [...products].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 4), [products]);
  const bestSellers = useMemo(() => products.filter(p => p.is_promo === 1).slice(0, 4), [products]);
  const categories = useMemo(() => ["All", ...Array.from(new Set(products.map(p => p.category_name)))], [products]);
  const filteredProducts = activeCategory === "All" ? products : products.filter(p => p.category_name === activeCategory);
  
  // 👇 UPDATE MAPPING KE CARD
  const mapToCard = (p: ProductAPI) => ({
    id: p.id, 
    name: p.name, 
    category: p.category_name, 
    price: parseFloat(p.price), 
    image: getImageUrl(p.image), // 👈 Gunakan helper baru
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
        case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'processing': return 'bg-orange-100 text-orange-700 border-orange-200';
        case 'ready': return 'bg-green-100 text-green-700 border-green-200';
        case 'completed': return 'bg-navy-900 text-gold-500 border-navy-900';
        case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
        default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) return <div className="min-h-screen bg-navy-900 flex items-center justify-center"><Loader2 className="animate-spin text-gold-500" size={40}/></div>;

  return (
    <main className="min-h-screen bg-gray-50 font-sans flex flex-col justify-between">
      
      {/* NOTIFIKASI POPUP */}
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

          <div className="container mx-auto px-4 md:px-12 pt-28 space-y-16 pb-20">
            
            {/* USER WELCOME */}
            {user && (
                <section className="animate-in slide-in-from-top-4 fade-in duration-500">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-navy-900 rounded-full flex items-center justify-center text-gold-500">
                                    <UserIcon size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-navy-900">Hi, {user.name}! 👋</h2>
                                    <p className="text-sm text-gray-500">Welcome back to GetCha.</p>
                                </div>
                            </div>
                            <Link href="/menu" className="text-sm font-bold text-gold-600 hover:underline">+ New Order</Link>
                        </div>

                        {myOrders.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2">
                                {myOrders.slice(0, 2).map(order => (
                                    <div key={order.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50 flex justify-between items-center hover:shadow-md transition-all">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-navy-900 text-sm">{order.order_number}</span>
                                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400">
                                                {new Date(order.created_at).toLocaleDateString()} • {order.items?.length || 0} Items
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gold-600 text-sm">Rp {parseInt(order.total_price).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                                {myOrders.length > 2 && <div className="col-span-full text-center mt-2"><button className="text-xs text-gray-400 hover:text-navy-900">View All History</button></div>}
                            </div>
                        ) : (
                            <div className="text-center py-4 text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">No active orders right now.</div>
                        )}
                    </div>
                </section>
            )}

            {/* HERO CAROUSEL */}
            <section><HeroCarousel slides={heroSlidesData} /></section>

            {/* NEW ARRIVALS */}
            <section>
              <div className="flex justify-between items-end mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2.5 rounded-xl text-blue-500 shadow-sm shadow-blue-100 animate-bounce"><Clock size={24} /></div>
                    <div><span className="text-blue-500 font-bold tracking-widest text-[10px] uppercase block mb-1">Just Landed</span><h2 className="text-2xl md:text-3xl font-serif font-bold text-navy-900 leading-none">New <span className="text-gold-500">Arrivals</span></h2></div>
                </div>
                <Link href="/menu" className="text-navy-900 font-bold text-xs hover:text-gold-500 transition-colors flex items-center gap-1 group">View All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/></Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {newArrivals.map((product) => (
                  <div key={product.id} className="relative h-full group">
                      {isNewBadge(product.created_at) && <div className="absolute -top-2 -right-2 z-20"><span className="relative flex h-8 w-16"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex items-center justify-center rounded-full h-8 w-16 bg-gradient-to-r from-blue-600 to-blue-400 border-2 border-white shadow-lg"><span className="text-[10px] font-black text-white italic tracking-wider">NEW!</span></span></span></div>}
                      <ProductCard product={mapToCard(product)} />
                  </div>
                ))}
              </div>
            </section>

            {/* BEST SELLERS */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-red-100 p-2.5 rounded-xl text-red-500 shadow-sm shadow-red-100"><Flame size={24} fill="currentColor" /></div>
                <div><span className="text-red-500 font-bold tracking-widest text-[10px] uppercase block mb-1">Weekly Top Pick</span><h2 className="text-2xl md:text-3xl font-serif font-bold text-navy-900 leading-none">Best <span className="text-gold-500 underline decoration-4 underline-offset-4">Sellers</span></h2></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {bestSellers.slice(0, promoBanner.isActive ? 2 : 4).map((product, idx) => (
                  <div key={product.id} className="relative h-full">
                        <div className="absolute -top-3 -left-3 z-20 w-8 h-8 bg-gradient-to-br from-navy-900 to-navy-700 text-white font-bold rounded-full flex items-center justify-center border-2 border-white shadow-lg text-sm">#{idx + 1}</div>
                        {idx === 0 && <div className="absolute -top-6 -left-2 z-30 text-gold-500 transform -rotate-12"><Sparkles size={24} fill="currentColor" /></div>}
                        <ProductCard product={mapToCard(product)} />
                  </div>
                ))}
                {promoBanner.isActive && (
                    <div className={`col-span-2 bg-gradient-to-br ${promoBanner.gradientFrom} ${promoBanner.gradientTo} rounded-2xl p-6 md:p-10 text-white flex flex-col justify-center relative overflow-hidden group cursor-pointer shadow-xl transition-all hover:scale-[1.01]`}>
                        <div className="absolute right-0 top-0 w-48 h-48 bg-gold-500 rounded-full blur-[80px] opacity-20 group-hover:opacity-30 transition-opacity"></div>
                        <div className="relative z-10">
                            <span className={`bg-gold-500 text-navy-900 text-[10px] font-bold px-2 py-1 rounded mb-4 inline-block`}>{promoBanner.badge}</span>
                            <h3 className="text-2xl md:text-3xl font-bold font-serif mb-3 leading-tight">{promoBanner.title}</h3>
                            <p className="text-gray-300 text-sm mb-6 max-w-sm leading-relaxed">{promoBanner.subtitle}</p>
                            <Link href={promoBanner.ctaLink} className={`flex items-center gap-2 font-bold text-sm ${promoBanner.accentColor} hover:text-white transition-colors`}>{promoBanner.ctaText} <ArrowRight size={18}/></Link>
                        </div>
                    </div>
                )}
              </div>
            </section>

            {/* FULL MENU */}
            <section id="menu-section">
                <div className="sticky top-20 z-30 bg-gray-50/95 backdrop-blur-md py-4 mb-6 transition-all border-b border-gray-200 -mx-4 px-4 md:-mx-12 md:px-12">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <h2 className="text-xl font-serif font-bold text-navy-900 flex items-center gap-2">Full Menu <Sparkles size={16} className="text-gold-500"/></h2>
                        <div className="flex overflow-x-auto pb-1 gap-2 w-full md:w-auto no-scrollbar mask-gradient">
                            {categories.map((cat) => (
                                <button key={cat} onClick={() => setActiveCategory(cat)} className={`whitespace-nowrap px-5 py-2 rounded-full text-xs font-bold transition-all border transform active:scale-95 ${activeCategory === cat ? "bg-navy-900 text-white border-navy-900 shadow-lg shadow-navy-900/20" : "bg-white text-gray-500 border-gray-200 hover:border-gold-500 hover:text-navy-900"}`}>{cat}</button>
                            ))}
                        </div>
                    </div>
                </div>
                <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 min-h-[400px]">
                    <AnimatePresence mode='popLayout'>
                        {filteredProducts.map((product) => (
                            <motion.div layout key={product.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }}>
                                <div className="relative h-full">
                                   {isNewBadge(product.created_at) && <div className="absolute top-2 right-2 z-10 bg-blue-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm">NEW</div>}
                                   <ProductCard product={mapToCard(product)} />
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
                <div className="mt-16 mb-8 text-center opacity-30"><p className="text-[10px] uppercase tracking-widest font-bold">You've reached the end</p></div>
            </section>
          </div>
      </div>
      <Footer />
    </main>
  );
}