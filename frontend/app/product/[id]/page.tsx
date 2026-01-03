"use client";

import React, { useState, useEffect } from 'react';
import NavbarDashboard from "@/app/components/layout/NavbarDashboard";
import Footer from "@/app/components/layout/Footer"; 
import { useCart } from "@/app/context/CartContext";
import { 
  Minus, Plus, ShoppingBag, Heart, ChevronRight, Info, Loader2, CheckCircle2, Star, Clock 
} from "lucide-react";
import { useRouter, useParams } from 'next/navigation';
import Image from "next/image"; // Menggunakan Image Next.js untuk optimasi

// ✅ URL Backend Railway
const BACKEND_URL = "https://getcha2-backend-production.up.railway.app";

interface ProductDetail {
  id: number;
  name: string;
  category_name: string;
  description: string;
  price: string; 
  image: string;
  images?: string[];
  nutritional_info?: string; 
  variants?: { name: string; price: number }[];
  modifiers?: { 
    name: string; 
    required?: boolean; 
    options: { label: string; priceChange?: number; isDefault?: boolean }[] 
  }[];
}

export default function ProductDetailPage() {
  const { addToCart } = useCart();
  const router = useRouter();
  const params = useParams();
  const id = params?.id; 
  
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  // State untuk Variasi & Modifier
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedModifiers, setSelectedModifiers] = useState<{[key: string]: any}>({});

  // State Visual Button (Loading/Success)
  const [isAdding, setIsAdding] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // 🔥 HELPER: Fix URL Gambar
  const getImageUrl = (path: string) => {
    if (!path) return "/Image/placeholder.png";
    if (path.startsWith("http")) return path;

    const BACKEND_URL = "https://getcha2-backend-production.up.railway.app";
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

  useEffect(() => {
    if (!id) return;

    const fetchDetail = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/menu/${id}`);
        const json = await res.json();

        if (json.success) {
          const data = json.data;
          setProduct(data);
          setActiveImage(data.image);

          // Set Default Variant
          if (data.variants && data.variants.length > 0) {
              setSelectedVariant(data.variants[0]);
          }

          // Set Default Modifiers
          if (data.modifiers && data.modifiers.length > 0) {
              const defaults: any = {};
              data.modifiers.forEach((mod: any) => {
                  if (mod.options && mod.options.length > 0) {
                      const defaultOpt = mod.options.find((opt: any) => opt.isDefault) || mod.options[0];
                      defaults[mod.name] = defaultOpt;
                  }
              });
              setSelectedModifiers(defaults);
          }
        }
      } catch (error) {
        console.error("Gagal ambil detail:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const calculateTotal = () => {
    if (!product) return 0;
    
    const baseProductPrice = parseFloat(product.price) || 0;
    let currentPrice = selectedVariant ? parseFloat(selectedVariant.price) : baseProductPrice;

    let modifierTotal = 0;
    Object.values(selectedModifiers).forEach((mod: any) => {
        if (mod.priceChange) modifierTotal += mod.priceChange;
    });

    return (currentPrice + modifierTotal) * qty;
  };

  const handleAddToCartWrapper = () => {
    if (!product) return;
    
    setIsAdding(true); // Mulai animasi loading

    // Simulasi delay sedikit agar animasi terlihat smooth
    setTimeout(() => {
        const finalUnitPrice = calculateTotal() / qty;

        addToCart({
            id: product.id,
            name: product.name,
            price: finalUnitPrice,
            image: getImageUrl(product.image),
            category: product.category_name || "Uncategorized",
            quantity: qty,
            selectedVariant: selectedVariant?.name,
            selectedModifiers: Object.fromEntries(
               Object.entries(selectedModifiers).map(([key, val]: any) => [key, val.label])
            )
        });

        setIsAdding(false);
        setIsSuccess(true); // Munculkan ceklis hijau

        // Hilangkan status sukses setelah 2 detik
        setTimeout(() => setIsSuccess(false), 2000);
    }, 600);
  };

  if (loading) return <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center"><Loader2 className="animate-spin text-gold-500" size={40}/></div>;
  if (!product) return <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center text-gray-500 font-bold">Product data not found.</div>;

  let nutrition = null;
  try {
     if (product.nutritional_info) nutrition = JSON.parse(product.nutritional_info);
  } catch (e) {}

  return (
    <main className="min-h-screen bg-[#F8F9FA] font-sans text-navy-900 flex flex-col justify-between selection:bg-gold-200">
      <NavbarDashboard />
      
      <div className="container mx-auto px-6 md:px-12 pt-32 pb-24 max-w-7xl">
        
        {/* Breadcrumb */}
        <button 
            onClick={() => router.push('/menu')} 
            className="group flex items-center gap-2 text-gray-400 hover:text-navy-900 mb-8 transition-colors text-sm font-bold"
        >
            <span className="group-hover:underline">Menu</span>
            <ChevronRight size={14} />
            <span className="text-navy-900">{product.name}</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            
            {/* --- LEFT: PRODUCT IMAGE (STICKY) --- */}
            <div className="relative lg:sticky lg:top-32">
                <div className="relative aspect-square bg-white rounded-[2.5rem] shadow-xl shadow-navy-900/5 overflow-hidden border border-gray-100 group">
                    {/* Background Blob Dekorasi */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-gold-50 rounded-full blur-3xl opacity-60"></div>
                    
                    {/* Main Image */}
                    <div className="absolute inset-0 p-10 flex items-center justify-center">
                        <img 
                            src={getImageUrl(activeImage)} 
                            alt={product.name} 
                            className="w-full h-full object-contain transition-transform duration-700 hover:scale-110 drop-shadow-2xl z-10" 
                        />
                    </div>

                    {/* Favorite Button */}
                    <button 
                        onClick={() => setIsFavorite(!isFavorite)} 
                        className="absolute top-6 right-6 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all z-20 group/fav"
                    >
                        <Heart size={22} className={`transition-colors ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-300 group-hover/fav:text-red-400"}`} />
                    </button>
                </div>

                {/* Thumbnails */}
                {product.images && product.images.length > 1 && (
                    <div className="flex gap-4 mt-6 overflow-x-auto pb-2 no-scrollbar justify-center lg:justify-start">
                        {product.images.map((img, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => setActiveImage(img)} 
                                className={`relative w-20 h-20 rounded-2xl bg-white border-2 overflow-hidden shrink-0 transition-all ${activeImage === img ? 'border-navy-900 ring-2 ring-gold-200' : 'border-transparent opacity-60 hover:opacity-100'}`}
                            >
                                <img 
                                    src={getImageUrl(img)} 
                                    alt="thumb" 
                                    className="w-full h-full object-contain p-2" 
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* --- RIGHT: PRODUCT DETAILS & OPTIONS --- */}
            <div className="flex flex-col gap-8">
                
                {/* Header Info */}
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-navy-50 text-navy-900 text-[10px] font-bold uppercase tracking-wider rounded-lg">
                            {product.category_name || "Specialty"}
                        </span>
                        <div className="flex items-center gap-1 text-gold-500">
                            <Star size={14} fill="currentColor" />
                            <span className="text-xs font-bold text-navy-900">Recommended</span>
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-extrabold text-navy-900 leading-tight mb-4">
                        {product.name}
                    </h1>
                    
                    <p className="text-gray-500 text-lg leading-relaxed">
                        {product.description || "Rasakan kenikmatan menu spesial kami yang dibuat dengan bahan premium."}
                    </p>

                    {/* Nutrition Grid */}
                    {nutrition && (
                        <div className="grid grid-cols-3 gap-4 mt-6 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="text-center">
                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Calories</p>
                                <p className="text-navy-900 font-bold flex items-center justify-center gap-1">
                                    <Info size={12} className="text-gold-500"/> {nutrition.calories}
                                </p>
                            </div>
                            <div className="text-center border-l border-gray-100">
                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Sugar</p>
                                <p className="text-navy-900 font-bold">{nutrition.sugar}</p>
                            </div>
                            <div className="text-center border-l border-gray-100">
                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Fat</p>
                                <p className="text-navy-900 font-bold">{nutrition.fat}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-px w-full bg-gray-200"></div>

                {/* --- CUSTOMIZATION SECTION --- */}
                <div className="space-y-8">
                    
                    {/* 1. VARIANTS (Size, dll) */}
                    {product.variants && product.variants.length > 0 && (
                        <div>
                            <h3 className="font-bold text-navy-900 mb-4 text-sm uppercase tracking-wide flex items-center gap-2">
                                Select Size
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {product.variants?.map((variant, idx) => (
                                    <button 
                                        key={idx} 
                                        onClick={() => setSelectedVariant(variant)} 
                                        className={`
                                            px-6 py-3 rounded-2xl border text-sm font-bold transition-all duration-200 flex flex-col items-center min-w-[100px]
                                            ${selectedVariant?.name === variant.name 
                                                ? 'bg-navy-900 text-white border-navy-900 shadow-lg shadow-navy-900/20 transform scale-105' 
                                                : 'bg-white text-gray-500 border-gray-200 hover:border-gold-500 hover:text-navy-900'}
                                        `}
                                    >
                                        <span>{variant.name}</span>
                                        <span className={`text-[10px] mt-1 ${selectedVariant?.name === variant.name ? 'text-gold-500' : 'opacity-70'}`}>
                                            Rp {parseFloat(variant.price.toString()).toLocaleString()}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 2. MODIFIERS (Topping, Sugar, dll) */}
                    {product.modifiers && product.modifiers.length > 0 && product.modifiers.map((mod, idx) => (
                        <div key={idx}>
                            <h3 className="font-bold text-navy-900 mb-3 text-sm flex items-center justify-between uppercase tracking-wide">
                                <span>{mod.name}</span>
                                {mod.required && <span className="text-red-500 text-[10px] bg-red-50 px-2 py-0.5 rounded-full font-bold normal-case">Required</span>}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {mod.options?.map((opt, oIdx) => (
                                    <button 
                                        key={oIdx} 
                                        onClick={() => setSelectedModifiers({...selectedModifiers, [mod.name]: opt})} 
                                        className={`
                                            px-4 py-2.5 rounded-full border text-xs font-bold transition-all duration-200
                                            ${selectedModifiers[mod.name]?.label === opt.label 
                                                ? 'bg-gold-50 text-gold-700 border-gold-500 shadow-sm' 
                                                : 'bg-white text-gray-500 border-gray-200 hover:border-navy-900 hover:text-navy-900'}
                                        `}
                                    >
                                        {opt.label}
                                        {opt.priceChange ? ` (+${(opt.priceChange/1000)}k)` : ''}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- BOTTOM ACTION BAR --- */}
                <div className="bg-white p-6 rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 mt-4 sticky bottom-6 z-30">
                    <div className="flex flex-col gap-6">
                        
                        {/* Qty & Total */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 bg-gray-50 rounded-full px-2 py-1.5 border border-gray-200">
                                <button 
                                    onClick={() => setQty(Math.max(1, qty-1))} 
                                    className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors text-navy-900"
                                >
                                    <Minus size={18}/>
                                </button>
                                <span className="font-black text-navy-900 w-8 text-center text-lg">{qty}</span>
                                <button 
                                    onClick={() => setQty(qty+1)} 
                                    className="w-10 h-10 flex items-center justify-center bg-navy-900 text-white rounded-full shadow-sm hover:bg-navy-800 transition-colors"
                                >
                                    <Plus size={18}/>
                                </button>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1 tracking-wider">Total Amount</p>
                                <p className="text-3xl font-black text-navy-900 leading-none">
                                    Rp {calculateTotal().toLocaleString('id-ID')}
                                </p>
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        <button 
                            onClick={handleAddToCartWrapper}
                            disabled={isAdding || isSuccess} 
                            className={`
                                w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 transform active:scale-[0.98] shadow-xl
                                ${isSuccess 
                                    ? "bg-green-500 text-white shadow-green-500/30" 
                                    : "bg-navy-900 text-white hover:bg-gold-500 hover:text-navy-900 shadow-navy-900/20"
                                }
                            `}
                        >
                            {isAdding ? (
                                <>
                                    <Loader2 className="animate-spin" /> Adding...
                                </>
                            ) : isSuccess ? (
                                <>
                                    <CheckCircle2 /> Added to Cart!
                                </>
                            ) : (
                                <>
                                    <ShoppingBag size={22} /> Add to Cart
                                </>
                            )}
                        </button>
                    </div>
                </div>

            </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}