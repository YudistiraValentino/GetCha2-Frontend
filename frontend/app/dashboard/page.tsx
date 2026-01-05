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

  const [products, setProducts] = useState<ProductAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [user, setUser] = useState<any>(null);
  const [myOrders, setMyOrders] = useState<OrderAPI[]>([]);
  const [notification, setNotification] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
        try {
            setUser(JSON.parse(userData));
            fetchMyOrders(token);
        } catch (e) { console.error("User data parse error"); }
    }
    fetchMenu();
  }, []);

  useEffect(() => {
    if (user) {
        const echo = createEcho();
        if (echo) {
            echo.channel('public-orders')
                .listen('.order.updated', (e: any) => {
                    if (e.order.customer_name === user.name) {
                        setMyOrders((prevOrders) => {
                            const exists = prevOrders.find(o => o.id === e.order.id);
                            if (exists) {
                                return prevOrders.map(o => o.id === e.order.id ? { ...o, ...e.order, items: o.items } : o);
                            } else {
                                return [e.order, ...prevOrders];
                            }
                        });
                        setNotification(e.order);
                    }
                });
        }
        return () => { if (echo) echo.leave('public-orders'); };
    }
  }, [user]);

  const fetchMenu = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/menu`);
      const json = await res.json();
      if (json.success) {
          // Tambahkan mapping agar category_name selalu aman
          const mapped = json.data.map((p: any) => ({
              ...p,
              category_name: p.category ? p.category.name : (p.category_name || "General")
          }));
          setProducts(mapped);
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const fetchMyOrders = async (token: string) => {
      try {
          const res = await fetch(`${BACKEND_URL}/api/my-orders`, {
              headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
          });
          if (res.ok) {
              const json = await res.json();
              if (json.success) setMyOrders(json.data);
          }
      } catch (error) { console.error(error); }
  };

  // ✅ JURUS PAMUNGKAS: Gambar Unsplash agar ANTI-404
  const getImageUrl = (p: any) => {
    const name = (p?.name || "").toLowerCase();
    const cat = (p?.category_name || "").toLowerCase();
    if (name.includes("coffee") || name.includes("kopi") || cat.includes("coffee")) 
        return "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop";
    if (name.includes("snack") || name.includes("cake") || cat.includes("snack") || cat.includes("dessert")) 
        return "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=400&fit=crop";
    return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop";
  };

  const newArrivals = useMemo(() => [...products].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 4), [products]);
  const categories = useMemo(() => ["All", ...Array.from(new Set(products.map(p => p.category_name)))], [products]);
  const filteredProducts = activeCategory === "All" ? products : products.filter(p => p.category_name === activeCategory);
  
  const mapToCard = (p: ProductAPI) => ({
    id: p.id, 
    name: p.name, 
    category: p.category_name, 
    price: parseFloat(p.price || "0"), 
    image: getImageUrl(p), 
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
        case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
        case 'ready': return 'bg-green-50 text-green-700 border-green-200';
        case 'completed': return 'bg-navy-900 text-gold-500 border-navy-900';
        default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) return <div className="min-h-screen bg-navy-900 flex items-center justify-center"><Loader2 className="animate-spin text-gold-500" size={40}/></div>;

  return (
    <main className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between">
      <AnimatePresence>
        {notification && (
            <OrderNotification 
                key={notification.id} 
                order={notification} 
                onClose={() => setNotification(null)} 
            />
        )}
      </AnimatePresence>

      <div>
          <NavbarDashboard />
          <div className="container mx-auto px-4 md:px-12 pt-28 space-y-20 pb-20">
            {user && (
                <section>
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden group">
                        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-navy-900 rounded-full flex items-center justify-center text-gold-500">
                                    <UserIcon size={28} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-extrabold text-navy-900 tracking-tight">
                                        Hi, <span className="text-gold-600">{user.name}</span>! 👋
                                    </h2>
                                    <p className="text-gray-500 font-medium mt-1">Ready for your coffee break?</p>
                                </div>
                            </div>
                            <Link href="/menu" className="bg-navy-50 text-navy-900 px-6 py-3 rounded-full font-bold hover:bg-gold-500 hover:text-white transition-all">
                                <ShoppingBag size={18} className="inline mr-2" />
                                Start New Order
                            </Link>
                        </div>
                        
                        <div className="mt-8 pt-8 border-t border-gray-100">
                             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Recent Orders</h3>
                             {myOrders.length > 0 ? (
                                <div className="grid gap-4 md:grid-cols-2">
                                    {myOrders.slice(0, 2).map(order => (
                                        <div key={order.id} className="border border-gray-100 rounded-2xl p-5 bg-white">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-bold text-navy-900">Order #{order.order_number}</span>
                                                <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <p className="font-bold text-navy-900 text-sm">Rp {parseInt(order.total_price || "0").toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                             ) : <p className="text-sm text-gray-400 italic">No active orders.</p>}
                        </div>
                    </div>
                </section>
            )}

            <section><HeroCarousel slides={heroSlidesData} /></section>

            <section>
              <div className="flex justify-between items-end mb-8 pb-4 border-b">
                <h2 className="text-2xl md:text-4xl font-extrabold text-navy-900">New Arrivals</h2>
                <Link href="/menu" className="text-navy-900 font-bold hover:text-gold-600 transition-colors">View All</Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {newArrivals.map((product) => (
                  <ProductCard key={product.id} product={mapToCard(product)} />
                ))}
              </div>
            </section>

            <section id="menu-section">
                <div className="sticky top-20 z-30 bg-white/80 backdrop-blur-xl py-4 mb-8 border-b">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 container mx-auto">
                        <h2 className="text-2xl font-bold">Full Menu</h2>
                        <div className="flex overflow-x-auto gap-2 w-full md:w-auto no-scrollbar pb-1">
                            {categories.map((cat) => (
                                <button key={cat} onClick={() => setActiveCategory(cat)} className={`whitespace-nowrap px-6 py-2 rounded-full text-sm font-bold transition-all ${activeCategory === cat ? "bg-navy-900 text-white shadow-lg" : "bg-gray-50 text-gray-500"}`}>{cat}</button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 min-h-[400px]">
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={mapToCard(product)} />
                    ))}
                </div>
            </section>
          </div>
      </div>
      <Footer />
    </main>
  );
}
