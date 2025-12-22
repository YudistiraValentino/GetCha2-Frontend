"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from "next/navigation";
import { ShoppingCart, Search, User, X, ChevronRight, Loader2 } from 'lucide-react'; // Tambah Loader2
import { useCart } from '@/app/context/CartContext';
// HAPUS IMPORT DATA STATIS INI
// import { products, Product } from "@/app/data/menuData"; 
import { useTransition } from "@/app/context/TransitionContext";

// Definisi Tipe Data sesuai API Laravel
interface ProductAPI {
  id: number;
  name: string;
  category_name: string; // Sesuaikan dengan respon API
  price: string;
  image: string;
  description: string;
}

const NavbarDashboard = () => {
  const { toggleCart, cartCount } = useCart();
  const router = useRouter();
  const { triggerTransition } = useTransition();

  // --- STATE SEARCH ---
  const [isSearchActive, setIsSearchActive] = useState(false); 
  const [searchQuery, setSearchQuery] = useState("");
  
  // STATE BARU: Menampung data dari API
  const [apiProducts, setApiProducts] = useState<ProductAPI[]>([]);
  const [suggestions, setSuggestions] = useState<ProductAPI[]>([]); // Ganti tipe data
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingData, setLoadingData] = useState(false); // Indikator loading data awal
  
  const searchRef = useRef<HTMLDivElement>(null); 
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. FETCH DATA DARI API LARAVEL SAAT LOAD
  // Supaya pencarian cepat (client-side filtering), kita ambil semua menu sekali di awal
  useEffect(() => {
    const fetchProducts = async () => {
        setLoadingData(true);
        try {
            const res = await fetch('https://getcha2-backend-production.up.railway.app/api/menu');
            const json = await res.json();
            if (json.success) {
                setApiProducts(json.data);
            }
        } catch (error) {
            console.error("Gagal load menu untuk search:", error);
        } finally {
            setLoadingData(false);
        }
    };
    fetchProducts();
  }, []);

  // --- FUNGSI MODE SEARCH ---
  const activateSearch = () => {
    setIsSearchActive(true);
    setTimeout(() => {
        inputRef.current?.focus();
    }, 100);
  };

  const deactivateSearch = () => {
    setIsSearchActive(false);
    setShowSuggestions(false);
    setSearchQuery(""); 
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length > 0) {
      const lowerQ = query.toLowerCase();
      
      // Filter dari apiProducts (Data Database)
      const matches = apiProducts.filter(p => 
        p.name.toLowerCase().includes(lowerQ) || 
        (p.category_name && p.category_name.toLowerCase().includes(lowerQ))
      );

      matches.sort((a, b) => {
        const startsA = a.name.toLowerCase().startsWith(lowerQ);
        const startsB = b.name.toLowerCase().startsWith(lowerQ);
        if (startsA && !startsB) return -1;
        if (!startsA && startsB) return 1;
        return 0;
      });

      setSuggestions(matches.slice(0, 5)); 
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    deactivateSearch(); 
    if (searchQuery.trim()) {
      router.push(`/menu?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Helper URL Gambar (Penting karena API mungkin kirim path relatif)
  const getImageUrl = (path: string) => {
    if (!path) return "/Image/placeholder.png";
    if (path.startsWith("http")) return path; 
    return `http://127.0.0.1:8000${path}`; 
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        if (isSearchActive) {
            deactivateSearch();
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSearchActive]);

  return (
    <nav className="w-full h-20 bg-navy-900 flex justify-between items-center px-4 md:px-12 fixed top-0 left-0 z-50 shadow-md font-sans">
      
      {/* LOGO */}
      <div 
        onClick={() => triggerTransition('/dashboard')} 
        className={`cursor-pointer transition-opacity duration-300 ${isSearchActive ? 'opacity-0 md:opacity-100' : 'opacity-100'}`}
      >
        <div className="w-60 h-30 relative hover:scale-105 transition-transform">
          <Image src="/Image/LogoPutih.png" alt="GetCha Logo" fill className="object-contain object-left" sizes="150px" />
        </div>
      </div>

      {/* MENU TENGAH */}
      <div className={`hidden md:flex gap-8 transition-opacity duration-300 ${isSearchActive ? 'opacity-0 lg:opacity-100' : 'opacity-100'}`}>
        <Link href="/dashboard" className="text-white hover:text-gold-500 font-bold transition-colors">Home</Link>
        <Link href="/menu" className="text-gray-300 hover:text-gold-500 font-medium transition-colors">Menu</Link>
        <Link href="/activity" className="text-gray-300 hover:text-gold-500 font-medium transition-colors">My Orders</Link>
      </div>

      {/* AREA KANAN */}
      <div className="flex items-center gap-4 text-white relative justify-end flex-1 md:flex-none" ref={searchRef}>
        
        {/* BUTTON SEARCH */}
        {!isSearchActive && (
            <button 
                onClick={activateSearch}
                className="p-2 hover:text-gold-500 transition-colors rounded-full hover:bg-navy-800"
                title="Search Menu"
            >
                <Search size={22} />
            </button>
        )}

        {/* FORM SEARCH POPUP */}
        <div className={`flex items-center justify-end transition-all duration-500 ease-in-out ${isSearchActive ? 'w-full md:w-[400px] opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}>
            <form 
                onSubmit={handleSearchSubmit} 
                className="flex items-center bg-navy-800 rounded-2xl border border-gold-500 ring-1 ring-gold-500 w-full"
            >
                <Search size={18} className="ml-4 shrink-0 text-gold-500" />
                <input
                    ref={inputRef}
                    type="text"
                    placeholder={loadingData ? "Loading data..." : "Cari 'Latte'..."}
                    value={searchQuery}
                    onChange={handleInput}
                    disabled={loadingData} // Disable kalau data belum siap
                    className="bg-transparent border-none outline-none text-sm text-white w-full px-3 py-2.5 placeholder-gray-500 disabled:opacity-50"
                />
                {loadingData && <Loader2 size={16} className="mr-2 animate-spin text-gray-400"/>}
                <button type="button" onClick={deactivateSearch} className="mr-2 p-2 text-gray-400 hover:text-white hover:bg-navy-700 rounded-full transition-colors">
                    <X size={18}/>
                </button>
            </form>

            {/* DROPDOWN HASIL */}
            {showSuggestions && isSearchActive && (
                <div className="absolute top-full right-0 mt-2 w-full md:w-[400px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 text-navy-900 animate-in fade-in slide-in-from-top-2">
                    {suggestions.length > 0 ? (
                        <>
                            <div className="px-5 py-3 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 flex justify-between items-center">
                                <span>Top Results</span>
                                <span className="text-[10px] bg-gold-100 text-gold-700 px-2 py-0.5 rounded-full">{suggestions.length} items</span>
                            </div>
                            {suggestions.map((product) => (
                                <Link 
                                    key={product.id} 
                                    href={`/product/${product.id}`}
                                    onClick={deactivateSearch}
                                    className="flex items-center gap-4 p-4 hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0 cursor-pointer group"
                                >
                                    <div className="w-12 h-12 relative bg-gray-100 rounded-xl overflow-hidden shrink-0 border border-gray-200">
                                        <Image src={getImageUrl(product.image)} alt={product.name} fill className="object-contain p-1" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-navy-900 group-hover:text-blue-600 truncate">{product.name}</p>
                                        <p className="text-xs text-gray-500 uppercase font-medium mt-0.5 tracking-wide">{product.category_name}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-sm font-bold text-gold-600">Rp {parseFloat(product.price).toLocaleString('id-ID')}</span>
                                        <ChevronRight size={14} className="ml-auto text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity mt-1"/>
                                    </div>
                                </Link>
                            ))}
                        </>
                    ) : (
                        <div className="p-8 text-center">
                            <Search size={20} className="text-gray-400 mx-auto mb-2" />
                            <p className="text-sm font-bold text-navy-900">No results found</p>
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* BUTTON CART & USER */}
        <button 
            onClick={toggleCart} 
            className={`relative hover:text-gold-500 transition-colors ${isSearchActive ? 'hidden md:block' : 'block'}`}
        >
          <ShoppingCart size={22} />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
              {cartCount}
            </span>
          )}
        </button>

        <Link href="/profile" className={`hover:text-gold-500 transition-colors ${isSearchActive ? 'hidden md:block' : 'block'}`}>
          <User size={22} />
        </Link>
      </div>

    </nav>
  );
};

export default NavbarDashboard;