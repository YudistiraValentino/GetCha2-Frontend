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

const BACKEND_URL = "https://getcha2-backend-production.up.railway.app";

export default function DashboardPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [user, setUser] = useState(null);
  const [myOrders, setMyOrders] = useState([]);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
        setUser(JSON.parse(userData));
        fetchMyOrders(token);
    }
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/menu`);
      const json = await res.json();
      if (json.success) {
          setProducts(json.data.map((p: any) => ({
              ...p,
              category_name: p.category ? p.category.name : (p.category_name || "Uncategorized")
          })));
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
          }
      } catch (error) { console.error(error); }
  };

  // ✅ FIX: Ambil gambar dari public/images/
  const getImageUrl = (path: string) => {
    if (!path) return "/images/food.jpg";
    if (path.startsWith("http")) return path;
    const fileName = path.split('/').pop(); // ambil nama filenya aja
    return `/images/${fileName}`;
  };

  const newArrivals = useMemo(() => [...products].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 4), [products]);
  const categories = useMemo(() => ["All", ...Array.from(new Set(products.map((p: any) => p.category_name)))], [products]);
  const filteredProducts = activeCategory === "All" ? products : products.filter((p: any) => p.category_name === activeCategory);

  if (loading) return <div className="min-h-screen bg-navy-900 flex items-center justify-center"><Loader2 className="animate-spin text-gold-500" size={40}/></div>;

  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <NavbarDashboard />
      <div className="container mx-auto px-4 md:px-12 pt-28 space-y-12 pb-20">
        <HeroCarousel slides={heroSlidesData} />
        <section>
            <h2 className="text-2xl font-bold mb-6">New Arrivals</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {newArrivals.map((p: any) => (
                    <ProductCard key={p.id} product={{...p, image: getImageUrl(p.image), price: parseFloat(p.price)}} />
                ))}
            </div>
        </section>
        <section>
            <div className="flex gap-2 overflow-x-auto pb-4">
                {categories.map(cat => (
                    <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-2 rounded-full text-sm font-bold ${activeCategory === cat ? "bg-navy-900 text-white" : "bg-gray-100"}`}>{cat}</button>
                ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {filteredProducts.map((p: any) => (
                    <ProductCard key={p.id} product={{...p, image: getImageUrl(p.image), price: parseFloat(p.price)}} />
                ))}
            </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
