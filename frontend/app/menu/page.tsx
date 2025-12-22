"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Search, Filter, Plus } from "lucide-react"; // Hapus ShoppingCart, pake Navbar
import NavbarDashboard from "../components/layout/NavbarDashboard";
import { useTransition } from "../context/TransitionContext"; // Import Transisi

// Interface Produk Simple untuk Menu List
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
  const { triggerTransition } = useTransition(); // Panggil Trigger
  
  const [products, setProducts] = useState<ProductAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch('https://getcha2-backend-production.up.railway.app/api/menu');
        const json = await res.json();
        if (json.success) setProducts(json.data);
      } catch (error) {
        console.error("Gagal mengambil menu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "All" || product.category_name === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category_name)))];

  // Fungsi Navigasi ke Detail (Pengganti Add to Cart langsung)
  const handleItemClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // Mencegah klik ganda
    triggerTransition(`/product/${id}`); // Pindah ke halaman detail
  };

  return (
    <div className="min-h-screen bg-white font-sans text-navy-900 pb-20">
      <NavbarDashboard />

      {/* HEADER */}
      <div className="pt-28 pb-10 px-6 md:px-12 bg-navy-900 text-white rounded-b-[3rem] shadow-xl relative overflow-hidden">
         {/* ... (Header content sama seperti sebelumnya) ... */}
         <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Our <span className="text-gold-500">Menu</span></h1>
      </div>

      {/* CONTROLS */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 -mt-8 relative z-20">
        <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-6 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${selectedCategory === cat ? "bg-navy-900 text-gold-500 shadow-md" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                {cat}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500" />
          </div>
        </div>
      </div>

      {/* GRID PRODUK */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-12">
        {loading ? (
            <div className="text-center py-20">Loading Menu...</div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                onClick={(e) => handleItemClick(e, product.id)} // KLIK KARTU -> PINDAH
                className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
              >
                <div className="h-56 relative bg-gray-50 overflow-hidden">
                  <Image src={product.image || "/Image/placeholder.png"} alt={product.name} fill className="object-contain p-6 group-hover:scale-110 transition-transform duration-500" />
                  {product.is_promo === 1 && <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">PROMO</div>}
                </div>

                <div className="p-6 flex flex-col flex-1">
                   <p className="text-xs font-bold text-gold-600 uppercase tracking-wider mb-1">{product.category_name}</p>
                   <h3 className="text-lg font-extrabold text-navy-900 leading-tight mb-2">{product.name}</h3>
                   <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">{product.description}</p>

                   <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                     <span className="text-xl font-bold text-navy-900">Rp {parseFloat(product.price).toLocaleString("id-ID")}</span>
                     
                     {/* TOMBOL PLUS -> PINDAH HALAMAN (BUKAN ADD TO CART) */}
                     <button
                       onClick={(e) => handleItemClick(e, product.id)} 
                       className="w-10 h-10 rounded-full bg-navy-900 text-white flex items-center justify-center hover:bg-gold-500 hover:text-navy-900 transition-colors shadow-lg active:scale-90"
                     >
                       <Plus size={20} />
                     </button>
                   </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">No menu items found.</div>
        )}
      </div>
    </div>
  );
}