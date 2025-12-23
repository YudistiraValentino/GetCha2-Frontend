"use client";

import React, { useState, useEffect } from 'react';
import NavbarDashboard from "@/app/components/layout/NavbarDashboard";
import Footer from "@/app/components/layout/Footer"; 
import { useCart } from "@/app/context/CartContext";
import { Minus, Plus, ShoppingBag, Heart, ChevronRight, Info, Loader2 } from "lucide-react";
import { useRouter, useParams } from 'next/navigation';

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

  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedModifiers, setSelectedModifiers] = useState<{[key: string]: any}>({});

  // 🔥 HELPER: Fix URL Gambar (Sesuai dengan Dashboard & Admin)
  const getImageUrl = (path: string) => {
  if (!path) return "/Image/placeholder.png";
  if (path.startsWith("http")) return path;

  const BACKEND_URL = "https://getcha2-backend-production.up.railway.app";
  
  // 1. Bersihkan path dari string 'public/' jika terbawa dari database
  let cleanPath = path.replace('public/', '');

  // 2. Pastikan diawali dengan satu garis miring
  if (!cleanPath.startsWith('/')) {
    cleanPath = '/' + cleanPath;
  }

  // 3. JANGAN tambahkan /storage jika path sudah diawali /images atau /maps
  // Karena data kamu di DB sekarang adalah /images/namafile.png
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

          if (data.variants && data.variants.length > 0) {
              setSelectedVariant(data.variants[0]);
          }

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
  };

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center"><Loader2 className="animate-spin text-gold-500" size={40}/></div>;
  if (!product) return <div className="text-center py-20 text-gray-500">Product data not found.</div>;

  let nutrition = null;
  try {
     if (product.nutritional_info) nutrition = JSON.parse(product.nutritional_info);
  } catch (e) {}

  return (
    <main className="min-h-screen bg-gray-50 pb-0 flex flex-col justify-between">
      <div>
        <NavbarDashboard />
        
        <div className="container mx-auto px-4 md:px-12 pt-28 pb-20">
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                <span className="cursor-pointer hover:text-navy-900" onClick={() => router.push('/menu')}>Menu</span>
                <ChevronRight size={14} />
                <span className="text-navy-900 font-bold">{product.name}</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-12 mb-20">
                <div className="w-full lg:w-1/2">
                    <div className="sticky top-24 space-y-4">
                        <div className="relative aspect-square bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-gray-100 group">
                            <img 
                                src={getImageUrl(activeImage)} 
                                alt={product.name} 
                                className="w-full h-full object-contain p-10 transition-transform duration-500 group-hover:scale-105" 
                            />
                            <button onClick={() => setIsFavorite(!isFavorite)} className="absolute top-6 right-6 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 transition-colors z-10">
                                <Heart size={24} className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-300"} />
                            </button>
                        </div>
                        
                        {product.images && product.images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                                {product.images.map((img, idx) => (
                                    <button key={idx} onClick={() => setActiveImage(img)} className={`relative w-24 h-24 rounded-2xl bg-white border-2 overflow-hidden shrink-0 transition-all ${activeImage === img ? 'border-navy-900 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}>
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

                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-xl space-y-8">
                        {product.variants && product.variants.length > 0 && (
                            <div>
                                <h3 className="font-bold text-navy-900 mb-4 text-sm uppercase tracking-wide">Select Size</h3>
                                <div className="flex flex-wrap gap-3">
                                    {product.variants?.map((variant, idx) => (
                                        <button key={idx} onClick={() => setSelectedVariant(variant)} className={`px-6 py-3 rounded-xl border text-sm font-bold transition-all ${selectedVariant?.name === variant.name ? 'bg-navy-900 text-gold-500 border-navy-900 shadow-lg' : 'bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100'}`}>
                                            {variant.name} <span className="text-[10px] opacity-70 ml-1">Rp {parseFloat(variant.price.toString()).toLocaleString()}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {product.modifiers && product.modifiers.length > 0 && product.modifiers.map((mod, idx) => (
                            <div key={idx}>
                                <h3 className="font-bold text-navy-900 mb-3 text-sm flex justify-between uppercase tracking-wide">
                                    {mod.name} 
                                    {mod.required && <span className="text-red-500 text-[10px] bg-red-50 px-2 py-0.5 rounded normal-case">Required</span>}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {mod.options?.map((opt, oIdx) => (
                                        <button key={oIdx} onClick={() => setSelectedModifiers({...selectedModifiers, [mod.name]: opt})} className={`px-4 py-2 rounded-full border text-xs font-bold transition-all ${selectedModifiers[mod.name]?.label === opt.label ? 'bg-gold-50 text-gold-700 border-gold-500' : 'bg-white text-gray-500 border-gray-200 hover:border-navy-900'}`}>
                                            {opt.label}
                                            {opt.priceChange ? ` (+${(opt.priceChange/1000)}k)` : ''}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <hr className="border-gray-100"/>

                        <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 bg-gray-50 rounded-full px-2 py-1 border border-gray-200">
                                    <button onClick={() => setQty(Math.max(1, qty-1))} className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm"><Minus size={18}/></button>
                                    <span className="font-black text-navy-900 w-8 text-center text-lg">{qty}</span>
                                    <button onClick={() => setQty(qty+1)} className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm"><Plus size={18}/></button>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-400 uppercase font-bold mb-1 tracking-wider">Total Price</p>
                                    <p className="text-3xl font-black text-navy-900">Rp {calculateTotal().toLocaleString('id-ID')}</p>
                                </div>
                            </div>
                            <button onClick={handleAddToCart} className="bg-navy-900 text-white font-bold py-5 rounded-2xl shadow-xl hover:bg-gold-500 hover:text-navy-900 transition-all flex items-center justify-center gap-3">
                                <ShoppingBag size={22}/> Add to Cart
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