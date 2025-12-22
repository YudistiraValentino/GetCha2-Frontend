"use client";

import React, { useState, useEffect } from 'react'; // Hapus 'use' dari import
import NavbarDashboard from "@/app/components/layout/NavbarDashboard";
import Footer from "@/app/components/layout/Footer"; 
import { useCart } from "@/app/context/CartContext";
import { Minus, Plus, ShoppingBag, Heart, ChevronRight, Info, Loader2 } from "lucide-react";
import { useRouter, useParams } from 'next/navigation'; // Pakai useParams

// Ganti baris 7 jadi begini:
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

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

export default function ProductDetailPage() { // Tidak perlu props params
  const { addToCart } = useCart();
  const router = useRouter();
  const params = useParams(); // Ambil ID dari hook
  const id = params?.id; 
  
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  // Logic States
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedModifiers, setSelectedModifiers] = useState<{[key: string]: any}>({});

  // Helper: Ambil Full URL Gambar
  const getImageUrl = (path: string) => {
    if (!path) return "/Image/placeholder.png";
    if (path.startsWith("http")) return path; 
    return `${BACKEND_URL}${path}`; 
  };

  useEffect(() => {
    if (!id) return;

    const fetchDetail = async () => {
      try {
        const res = await fetch(`https://getcha2-backend-production.up.railway.app/api/menu/${id}`);
        const json = await res.json();

        if (json.success) {
          const data = json.data;
          setProduct(data);
          setActiveImage(data.image);

          // 1. Auto-Select Variant Pertama
          if (data.variants && data.variants.length > 0) {
             setSelectedVariant(data.variants[0]);
          }

          // 2. Auto-Select Modifier Default
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

  // --- HITUNG TOTAL HARGA ---
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

  const handleAddToCart = () => {
    if (!product) return;
    
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
    
    // Opsional: Beri feedback visual
    // alert("Item added to cart!");
  };

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center"><Loader2 className="animate-spin text-gold-500" size={40}/></div>;
  if (!product) return <div className="text-center py-20 text-gray-500">Product data not found / Error loading.</div>;

  // Render Nutrition Safe Check
  let nutrition = null;
  try {
     if (product.nutritional_info) nutrition = JSON.parse(product.nutritional_info);
  } catch (e) {}

  return (
    <main className="min-h-screen bg-gray-50 pb-0 flex flex-col justify-between">
      <div>
        <NavbarDashboard />
        
        <div className="container mx-auto px-4 md:px-12 pt-28 pb-20">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                <span className="cursor-pointer hover:text-navy-900" onClick={() => router.push('/menu')}>Menu</span>
                <ChevronRight size={14} />
                <span className="text-navy-900 font-bold">{product.name}</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-12 mb-20">
                {/* --- KIRI: GAMBAR --- */}
                <div className="w-full lg:w-1/2">
                    <div className="sticky top-24 space-y-4">
                        <div className="relative aspect-square bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-gray-100 group">
                            
                            {/* 🔥 UPDATE: MENGGUNAKAN TAG IMG BIASA */}
                            <img 
                                src={getImageUrl(activeImage)} 
                                alt={product.name} 
                                className="w-full h-full object-contain p-10 transition-transform duration-500 group-hover:scale-105" 
                            />

                            <button onClick={() => setIsFavorite(!isFavorite)} className="absolute top-6 right-6 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 transition-colors z-10">
                                <Heart size={24} className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-300"} />
                            </button>
                        </div>
                        
                        {/* Gallery Thumbnails */}
                        {product.images && product.images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                                {product.images.map((img, idx) => (
                                    <button key={idx} onClick={() => setActiveImage(img)} className={`relative w-24 h-24 rounded-2xl bg-white border-2 overflow-hidden shrink-0 transition-all ${activeImage === img ? 'border-navy-900 opacity-100 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}>
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
                </div>

                {/* --- KANAN: DETAIL & OPSI --- */}
                <div className="w-full lg:w-1/2 space-y-8">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="bg-gold-100 text-gold-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                {product.category_name || "Menu"}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-navy-900 mb-4 leading-tight">{product.name}</h1>
                        <p className="text-gray-500 leading-relaxed text-base">{product.description || "No description available."}</p>
                        
                        {nutrition && (
                            <div className="flex gap-6 mt-6 pt-6 border-t border-gray-100">
                                <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Calories</p><p className="text-navy-900 font-bold flex items-center gap-1"><Info size={12} className="text-gold-500"/> {nutrition.calories} kcal</p></div>
                                <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Sugar</p><p className="text-navy-900 font-bold">{nutrition.sugar}</p></div>
                                <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Fat</p><p className="text-navy-900 font-bold">{nutrition.fat}</p></div>
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-xl space-y-8 relative overflow-hidden">
                        
                        {/* 1. SELEKSI VARIAN (UKURAN) */}
                        {product.variants && product.variants.length > 0 && (
                            <div>
                                <h3 className="font-bold text-navy-900 mb-4 text-sm uppercase tracking-wide">Select Size</h3>
                                <div className="flex flex-wrap gap-3">
                                    {product.variants?.map((variant, idx) => (
                                        <button key={idx} onClick={() => setSelectedVariant(variant)} className={`px-6 py-3 rounded-xl border text-sm font-bold transition-all ${selectedVariant?.name === variant.name ? 'bg-navy-900 text-gold-500 border-navy-900 shadow-lg scale-105' : 'bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100'}`}>
                                            {variant.name} <span className="text-[10px] opacity-70 ml-1 font-normal">Rp {parseFloat(variant.price.toString()).toLocaleString()}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 2. SELEKSI MODIFIERS */}
                        {product.modifiers && product.modifiers.length > 0 && product.modifiers.map((mod, idx) => (
                            <div key={idx}>
                                <h3 className="font-bold text-navy-900 mb-3 text-sm flex justify-between uppercase tracking-wide">
                                    {mod.name} 
                                    {mod.required && <span className="text-red-500 text-[10px] bg-red-50 px-2 py-0.5 rounded normal-case">Required</span>}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {mod.options?.map((opt, oIdx) => (
                                        <button key={oIdx} onClick={() => setSelectedModifiers({...selectedModifiers, [mod.name]: opt})} className={`px-4 py-2 rounded-full border text-xs font-bold transition-all ${selectedModifiers[mod.name]?.label === opt.label ? 'bg-gold-50 text-gold-700 border-gold-500 ring-2 ring-gold-100' : 'bg-white text-gray-500 border-gray-200 hover:border-navy-900'}`}>
                                            {opt.label}
                                            {opt.priceChange ? ` (+${(opt.priceChange/1000)}k)` : ''}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <hr className="border-gray-100"/>

                        {/* 3. TOTAL & ADD TO CART */}
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 bg-gray-50 rounded-full px-2 py-1 border border-gray-200">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm hover:text-red-500 transition-colors"><Minus size={18}/></button>
                                    <span className="font-black text-navy-900 w-8 text-center text-lg">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm hover:text-green-500 transition-colors"><Plus size={18}/></button>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Total Price</p>
                                    <p className="text-3xl font-black text-navy-900">Rp {calculateTotal().toLocaleString('id-ID')}</p>
                                </div>
                            </div>
                            <button onClick={handleAddToCart} className="flex-1 bg-navy-900 text-white font-bold py-5 rounded-2xl shadow-xl hover:bg-gold-500 hover:text-navy-900 transition-all flex items-center justify-center gap-3 active:scale-95 group">
                                <ShoppingBag size={22} className="group-hover:animate-bounce"/> Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}