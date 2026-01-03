"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Search, Plus, Loader2, Sparkles, UtensilsCrossed, Coffee } from "lucide-react"; 
import NavbarDashboard from "../components/layout/NavbarDashboard";
import { useTransition } from "../context/TransitionContext"; 

// ✅ URL Backend Railway
const BACKEND_URL = "https://getcha2-backend-production.up.railway.app";

interface ProductAPI {
  id: number;
  name: string;
  category_name: string;
  description: string;
  price: string;
  image: string;
  is_promo: number;
  // Add category object interface if needed for type safety, but 'any' in map covers it for now
  category?: {
      id: number;
      name: string;
  };
}

export default function MenuPage() {
  const { triggerTransition } = useTransition(); 
  
  const [products, setProducts] = useState<ProductAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false); // Untuk efek sticky

  // Deteksi scroll untuk styling navbar kategori
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/menu`);
        const json = await res.json();
        
        if (json.success) {
            // ✅ FIX: Map data agar category_name terbaca dengan benar
            // Backend mungkin kirim 'category' object atau 'category_name' string
            const mappedProducts = json.data.map((product: any) => ({
                ...product,
                category_name: product.category ? product.category.name : (product.category_name || "Uncategorized")
            }));
            
            setProducts(mappedProducts);
        }
      } catch (error) {
        console.error("Gagal mengambil menu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  // ✅ HELPER URL GAMBAR
  const getImageUrl = (path: string) => {
    if (!path) return "/Image/placeholder.png";
    if (path.startsWith("http")) return path;

    let cleanPath = path.replace('public/', '');
    if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;

    if (
      !cleanPath.startsWith('/storage') && 
      !cleanPath.startsWith('/images') && 
      !cleanPath.startsWith('/maps')
    ) {
      cleanPath = '/storage' + cleanPath;
    }

    return `${BACKEND_URL}${cleanPath}`;
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "All" || product.category_name === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category_name)))];

  const handleItemClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); 
    triggerTransition(`/product/${id}`); 
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-navy-900 pb-32">
      <NavbarDashboard />

      {/* --- HERO SECTION --- */}
      {/* Background gelap dengan aksen emas untuk kesan mewah */}
      <div className="relative pt-36 pb-24 px-6 md:px-12 bg-[#0B1120] text-white overflow-hidden rounded-b-[2.5rem] shadow-2xl">
         {/* Dekorasi Background */}
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-500 rounded-full blur-[120px] opacity-10 -mr-32 -mt-32"></div>
         <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500 rounded-full blur-[100px] opacity-10 -ml-20 -mb-20"></div>
         
         <div className="relative z-10 max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full mb-6 border border-white/10">
                <Coffee size={16} className="text-gold-500" />
                <span className="text-xs font-bold tracking-widest uppercase text-gold-400">Premium Taste</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
                Find Your Perfect <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-gold-600">Craving Today</span>
            </h1>
            <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                Dari kopi artisan hingga pastry hangat, temukan menu favoritmu dan pesan tanpa antre.
            </p>
         </div>
      </div>

      {/* --- STICKY NAVIGATION BAR (SEARCH & FILTER) --- */}
      {/* Ini akan menempel di atas saat scroll agar user mudah ganti kategori */}
      <div className={`sticky top-20 z-40 transition-all duration-300 ${isScrolled ? 'py-4 bg-white/90 backdrop-blur-xl shadow-lg border-b border-gray-100' : 'py-8 -mt-10'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className={`bg-white rounded-full transition-all duration-300 flex flex-col md:flex-row items-center gap-4 p-2 ${isScrolled ? 'shadow-none border-0 bg-transparent' : 'shadow-xl border border-gray-100 p-3'}`}>
                
                {/* Search Input */}
                <div className={`relative w-full md:w-80 group ${isScrolled ? 'shadow-sm' : ''}`}>
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-600 transition-colors" size={20} />
                    <input 
                        type="text" 
                        placeholder="Cari kopi, kue..." 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        className="w-full pl-12 pr-6 py-3 bg-gray-50 border-none rounded-full focus:ring-2 focus:ring-gold-500/50 focus:bg-white transition-all text-sm font-medium placeholder:text-gray-400" 
                    />
                </div>

                {/* Divider (Hidden on mobile) */}
                <div className="hidden md:block w-px h-8 bg-gray-200 mx-2"></div>

                {/* Categories */}
                <div className="flex-1 w-full overflow-x-auto no-scrollbar pb-2 md:pb-0 mask-gradient-right">
                    <div className="flex gap-2">
                        {categories.map((cat) => (
                            <button 
                                key={cat} 
                                onClick={() => setSelectedCategory(cat)} 
                                className={`
                                    px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap border
                                    ${selectedCategory === cat 
                                        ? "bg-navy-900 text-white border-navy-900 shadow-md transform scale-105" 
                                        : "bg-white text-gray-500 border-gray-200 hover:border-gold-400 hover:text-navy-900 hover:bg-gold-50"}
                                `}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* --- MENU GRID --- */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-8 min-h-[500px]">
        
        {/* Header Kategori Terpilih */}
        <div className="mb-8 flex items-end gap-4">
            <h2 className="text-3xl font-bold text-navy-900">{selectedCategory === "All" ? "All Menu" : selectedCategory}</h2>
            <span className="text-gray-400 font-medium text-sm pb-1.5">{filteredProducts.length} Items</span>
            <div className="flex-1 h-px bg-gray-200 mb-2"></div>
        </div>

        {loading ? (
            <div className="flex flex-col items-center justify-center py-32 text-navy-900">
                <Loader2 className="animate-spin text-gold-500 mb-4" size={48} />
                <p className="font-bold text-lg">Mengambil menu...</p>
            </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                onClick={(e) => handleItemClick(e, product.id)} 
                className="group relative bg-white rounded-3xl transition-all duration-300 hover:-translate-y-2 cursor-pointer flex flex-col"
              >
                {/* Image Container - Floating Effect */}
                <div className="relative mx-4 mt-4 h-56 rounded-2xl bg-[#F4F5F7] overflow-hidden flex items-center justify-center group-hover:shadow-xl transition-shadow duration-300">
                   {/* Background Blob */}
                   <div className="absolute w-32 h-32 bg-gold-200 rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
                   
                   <Image 
                        src={getImageUrl(product.image)} 
                        alt={product.name} 
                        fill 
                        className="object-contain p-5 transition-transform duration-500 group-hover:scale-110 drop-shadow-sm" 
                   />
                   
                   {/* Promo Badge */}
                   {product.is_promo === 1 && (
                       <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1 z-10">
                           <Sparkles size={10} fill="white"/> PROMO
                       </div>
                   )}
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                        <div className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                            {product.category_name}
                        </div>
                    </div>

                    <h3 className="text-lg font-bold text-navy-900 leading-snug mb-2 line-clamp-2 group-hover:text-gold-600 transition-colors">
                        {product.name}
                    </h3>
                    
                    <p className="text-gray-400 text-xs line-clamp-2 mb-4 leading-relaxed font-medium">
                        {product.description}
                    </p>

                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-dashed border-gray-100">
                        <div>
                            <span className="text-xs text-gray-400 block mb-0.5">Price</span>
                            <span className="text-lg font-extrabold text-navy-900">
                                Rp {parseFloat(product.price).toLocaleString("id-ID")}
                            </span>
                        </div>
                        
                        <button
                            onClick={(e) => handleItemClick(e, product.id)} 
                            className="w-10 h-10 rounded-full bg-navy-50 text-navy-900 flex items-center justify-center hover:bg-gold-500 hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-gold-500/30 active:scale-90"
                        >
                            <Plus size={20} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-200">
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                <UtensilsCrossed size={32} />
             </div>
             <h3 className="text-xl font-bold text-navy-900 mb-2">Menu tidak ditemukan</h3>
             <p className="text-gray-400 font-medium mb-6">Kami tidak menemukan menu dengan kata kunci "{searchQuery}".</p>
             <button 
                onClick={() => {setSearchQuery(""); setSelectedCategory("All")}} 
                className="text-gold-600 font-bold hover:underline hover:text-gold-700 transition-colors"
             >
                Tampilkan Semua Menu
             </button>
          </div>
        )}
      </div>
    </div>
  );
}