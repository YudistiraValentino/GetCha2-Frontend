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
        } catch (e) {
            setMyOrders([]);
        }
    } else {
        setMyOrders([]); // Pastikan kosong jika tidak login
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
                                return prevOrders.map(o => o.id === e.order.id ? { ...o, ...e.order } : o);
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
          const mapped = json.data.map((p: any) => ({
              ...p,
              category_name: p.category ? p.category.name : (p.category_name || "Uncategorized")
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
              setMyOrders(json.data || []);
          } else {
              setMyOrders([]);
          }
      } catch (error) { setMyOrders([]); }
  };

  const getImageUrl = (p: ProductAPI) => {
    const id = p.id || 0;
    const name = (p.name || "").toLowerCase();
    const cat = (p.category_name || "").toLowerCase();
    const coffeeImages = ["https://images.unsplash.com/photo-1509042239860-f550ce710b93","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085","https://images.unsplash.com/photo-1506372023823-741c83b836fe","https://images.unsplash.com/photo-1497933322477-911f3c7a89c8","https://images.unsplash.com/photo-1541167760496-162955ed8a9f","https://images.unsplash.com/photo-1498804103079-a6351b050096","https://images.unsplash.com/photo-1511920170033-f8396924c348","https://images.unsplash.com/photo-1525193612562-0ec53b0e5d7c","https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd","https://images.unsplash.com/photo-1459755486867-b55449bb39ff"];
    const nonCoffeeImages = ["https://images.unsplash.com/photo-1556679343-c7306c1976bc","https://images.unsplash.com/photo-1597318181409-cf44d0582db8","https://images.unsplash.com/photo-1576092729250-19c137184b8c","https://images.unsplash.com/photo-1544787210-2213d84ad960","https://images.unsplash.com/photo-1536935338212-3b6abf17ac42","https://images.unsplash.com/photo-1623065422902-30a2ad299dd4","https://images.unsplash.com/photo-1585225442642-c41236125451","https://images.unsplash.com/photo-1556881286-fc6915169721","https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd","https://images.unsplash.com/photo-1556710807-a9261973328e"];
    const foodImages = ["https://images.unsplash.com/photo-1546069901-ba9599a7e63c","https://images.unsplash.com/photo-1567620905732-2d1ec7bb7445","https://images.unsplash.com/photo-1565299624946-b28f40a0ae38","https://images.unsplash.com/photo-1482049016688-2d3e1b311543","https://images.unsplash.com/photo-1504674900247-0877df9cc836","https://images.unsplash.com/photo-1473093226795-af9932fe5856","https://images.unsplash.com/photo-1555939594-58d7cb561ad1","https://images.unsplash.com/photo-1540189549336-e6e99c3679fe","https://images.unsplash.com/photo-1565958011703-44f9829ba187","https://images.unsplash.com/photo-1512621776951-a57141f2eefd"];
    const snackImages = ["https://images.unsplash.com/photo-1551024601-bec78aea704b","https://images.unsplash.com/photo-1495147466023-ac5c588e2e94","https://images.unsplash.com/photo-1558961363-fa8fdf82db35","https://images.unsplash.com/photo-1509365465985-25d11c17e812","https://images.unsplash.com/photo-1530610476181-d83430b64dcd","https://images.unsplash.com/photo-1573821663912-569905445661","https://images.unsplash.com/photo-1582298538104-fe2e74c27f59","https://images.unsplash.com/photo-1559339352-11d035aa65de","https://images.unsplash.com/photo-1579306194872-64d3b7bac4c2","https://images.unsplash.com/photo-1519915028121-7d3463d20b13"];
    let coll = foodImages;
    if (cat.includes("non coffee") || name.includes("tea")) coll = nonCoffeeImages;
    else if (cat.includes("coffee") || name.includes("kopi")) coll = coffeeImages;
    else if (cat.includes("snack") || cat.includes("dessert")) coll = snackImages;
    return `${coll[id % 10]}?w=500&h=500&fit=crop`;
  };

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

  const newArrivals = useMemo(() => [...products].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 4), [products]);
  const categories = useMemo(() => ["All", ...Array.from(new Set(products.map(p => p.category_name)))], [products]);
  const filteredProducts = activeCategory === "All" ? products : products.filter(p => p.category_name === activeCategory);
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
        case 'confirmed': return 'bg-blue-50 text-blue-700 border-blue-200';
        case 'ready': return 'bg-green-50 text-green-700 border-green-200';
        case 'completed': return 'bg-navy-900 text-gold-500 border-navy-900';
        default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) return <div className="min-h-screen bg-navy-900 flex items-center justify-center"><Loader2 className="animate-spin text-gold-500" size={40}/></div>;

  return (
    <main className="min-h-screen bg-[#FAFAFA] font-sans flex flex-col justify-between selection:bg-gold-200">
      <AnimatePresence>{notification && <OrderNotification key={notification.id + notification.status} order={notification} onClose={() => setNotification(null)} />}</AnimatePresence>
      <div>
          <NavbarDashboard />
          <div className="container mx-auto px-4 md:px-12 pt-28 space-y-20 pb-20">
            {user && (
                <section className="animate-in slide-in-from-top-4 fade-in duration-700">
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-50 rounded-full blur-3xl opacity-50 -mr-20 -mt-20"></div>
                        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                            <div className="flex items-center gap-6">
                                <div className="relative">
                                    <div className="w-16 h-16 bg-gradient-to-br from-navy-900 to-navy-800 rounded-full flex items-center justify-center text-gold-500 shadow-xl shadow-navy-900/10"><UserIcon size={28} /></div>
                                    <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-4 border-white"></div>
                                </div>
                                <div>
                                    <h2 className="text-3xl font-extrabold text-navy-900 tracking-tight">Hi, <span className="text-gold-600">{user.name}</span>! 👋</h2>
                                    <p className="text-gray-500 font-medium mt-1">Ready for your coffee break?</p>
                                </div>
                            </div>
                            <Link href="/menu" className="hidden md:flex items-center gap-2 px-6 py-3 bg-navy-50 text-navy-900 font-bold rounded-full hover:bg-gold-500 hover:text-white transition-all duration-300"><ShoppingBag size={18} />Start New Order</Link>
                        </div>
                        <div className="mt-8 pt-8 border-t border-gray-100 relative z-10">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-4"><Receipt size={14} /> Recent Orders</h3>
                            {myOrders.length > 0 ? (
                                <div className="grid gap-4 md:grid-cols-2">
                                    {myOrders.slice(0, 2).map(order => (
                                        <div key={order.id} className="border border-gray-100 rounded-2xl p-5 bg-white shadow-sm">
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="font-bold text-navy-900 block">Order #{order.order_number}</span>
                                                <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full border ring-1 ${getStatusColor(order.status)}`}>{order.status}</span>
                                            </div>
                                            <p className="font-bold text-navy-900 text-sm">Rp {parseInt(order.total_price || "0").toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-sm text-gray-400">No active orders right now.</p>}
                        </div>
                    </div>
                </section>
            )}
            <section><HeroCarousel slides={heroSlidesData} /></section>
            <section>
              <div className="flex justify-between items-end mb-8 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <div className="bg-navy-900 p-3 rounded-xl text-gold-500 shadow-lg shadow-navy-900/20"><Sparkles size={24} /></div>
                    <div><h2 className="text-2xl md:text-4xl font-extrabold text-navy-900 leading-none">New Arrivals</h2></div>
                </div>
                <Link href="/menu" className="hidden md:flex text-navy-900 font-bold text-sm hover:text-gold-600 transition-colors items-center gap-2 group bg-white px-4 py-2 rounded-full border border-gray-200">View All <ArrowRight size={16} /></Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {newArrivals.map((product) => (
                  <div key={product.id} className="relative h-full group hover:-translate-y-2 transition-transform duration-300">
                      <ProductCard product={mapToCard(product)} />
                  </div>
                ))}
              </div>
            </section>
            <section id="menu-section">
                <div className="sticky top-20 z-30 bg-white/80 backdrop-blur-xl py-4 mb-8 transition-all border-b border-gray-100 -mx-4 px-4 md:-mx-12 md:px-12">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 container mx-auto">
                        <h2 className="text-2xl font-bold text-navy-900 flex items-center gap-2">Full Menu <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{products.length} Items</span></h2>
                        <div className="flex overflow-x-auto pb-1 gap-2 w-full md:w-auto no-scrollbar">
                            {categories.map((cat) => (
                                <button key={cat} onClick={() => setActiveCategory(cat)} className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all border transform active:scale-95 ${activeCategory === cat ? "bg-navy-900 text-white border-navy-900 shadow-lg" : "bg-gray-50 text-gray-500 border-transparent hover:bg-white hover:text-navy-900"}`}>{cat}</button>
                            ))}
                        </div>
                    </div>
                </div>
                <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 min-h-[400px]">
                    <AnimatePresence mode='popLayout'>
                        {filteredProducts.map((product) => (
                            <motion.div layout key={product.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}>
                                <ProductCard product={mapToCard(product)} />
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
