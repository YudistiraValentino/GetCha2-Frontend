"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Search, Plus, Loader2, Sparkles, UtensilsCrossed, Coffee } from "lucide-react"; 
import NavbarDashboard from "../components/layout/NavbarDashboard";
import { useTransition } from "../context/TransitionContext"; 

const BACKEND_URL = "https://getcha2-backend-production.up.railway.app";

interface ProductAPI {
  id: number;
  name: string;
  category_name: string;
  description: string;
  price: string;
  image: string;
  is_promo: number;
}

export default function MenuPage() {
  const { triggerTransition } = useTransition(); 
  
  const [products, setProducts] = useState<ProductAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 200);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/menu`);
        const json = await res.json();
        if (json.success) {
            const mapped = json.data.map((p: any) => ({
                ...p,
                category_name: p.category ? p.category.name : (p.category_name || "General")
            }));
            setProducts(mapped);
        }
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    fetchMenu();
  }, []);

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

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "All" || product.category_name === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category_name)))];

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-32">
      <NavbarDashboard />

      <div className="relative pt-36 pb-24 px-6 md:px-12 bg-[#0B1120] text-white rounded-b-[2.5rem] shadow-2xl">
         <div className="relative z-10 max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6">Find Your Perfect <br/><span className="text-gold-500">Craving</span></h1>
            <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">Dari kopi artisan hingga pastry hangat, pesan menu favoritmu tanpa antre.</p>
         </div>
      </div>

      <div className={`sticky top-20 z-40 transition-all ${isScrolled ? 'py-4 bg-white/90 backdrop-blur-md shadow-lg' : 'py-8 -mt-10'}`}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-4">
            <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="text" placeholder="Cari menu..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-6 py-3 bg-gray-50 rounded-full outline-none focus:ring-2 focus:ring-gold-500/50" />
            </div>
            <div className="flex-1 overflow-x-auto no-scrollbar flex gap-2">
                {categories.map((cat) => (
                    <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all border ${selectedCategory === cat ? "bg-navy-900 text-white border-navy-900" : "bg-white text-gray-500 border-gray-200"}`}>{cat}</button>
                ))}
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12 min-h-[500px]">
        {loading ? (
            <div className="flex flex-col items-center justify-center py-32"><Loader2 className="animate-spin text-gold-500 mb-4" size={48}/><p className="font-bold">Mengambil menu...</p></div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            {filteredProducts.map((p) => (
              <div key={p.id} onClick={() => triggerTransition(`/product/${p.id}`)} className="group bg-white rounded-3xl p-4 shadow-sm hover:-translate-y-2 transition-all cursor-pointer">
                <div className="relative h-48 bg-gray-50 rounded-2xl overflow-hidden mb-4">
                  <Image src={getImageUrl(p)} alt={p.name} fill className="object-contain p-4 group-hover:scale-110 transition-transform" unoptimized />
                </div>
                <h3 className="font-bold text-navy-900 mb-1">{p.name}</h3>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-dashed">
                    <span className="font-extrabold text-navy-900 text-lg">Rp {parseFloat(p.price || "0").toLocaleString()}</span>
                    <div className="w-8 h-8 bg-navy-50 rounded-full flex items-center justify-center text-navy-900 hover:bg-gold-500 hover:text-white transition-colors"><Plus size={18}/></div>
                </div>
              </div>
            ))}
          </div>
        ) : <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed"><UtensilsCrossed size={48} className="mx-auto text-gray-200 mb-4"/><p>Menu tidak ditemukan.</p></div>}
      </div>
    </div>
  );
}
